/* ===============================
   CONFIG
================================ */
const WS_URL = "wss://mf65ys1wsi.execute-api.ap-south-1.amazonaws.com/prod/";

/* ===============================
   GLOBAL STATE
================================ */
let ws;
let gameId = null;
let myPlayer = null;      // "X" or "O"
let currentPlayer = null;
let board = Array(9).fill("-");

/* ===============================
   INIT
================================ */
connectWebSocket();
setupCellClicks();

/* ===============================
   WEBSOCKET CONNECTION
================================ */
function connectWebSocket() {
  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log("✅ Connected to AWS WebSocket");
    updateStatus("Connected. Create or join a game.");
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("📩 Server:", data);
    handleServerMessage(data);
  };

  ws.onerror = (err) => {
    console.error("❌ WebSocket error", err);
  };

  ws.onclose = () => {
    updateStatus("Disconnected from server");
  };
}

/* ===============================
   SERVER MESSAGE HANDLER
================================ */
function handleServerMessage(data) {
  switch (data.type) {

    case "GAME_CREATED":
      gameId = data.gameId;
      myPlayer = data.player;     // X
      currentPlayer = "X";
      board = Array(9).fill("-");
      renderBoard();
      updateStatus(`Game created! You are ${myPlayer}. Code: ${gameId}`);
      break;

    case "GAME_JOINED":
      gameId = data.gameId;
      myPlayer = data.player;     // O
      updateStatus(`Joined game ${gameId}. You are ${myPlayer}`);
      break;

    case "OPPONENT_JOINED":
      updateStatus("Opponent joined. Game started!");
      break;

    case "MOVE_MADE":
      board = data.board;
      currentPlayer = data.currentPlayer;
      renderBoard();

      if (data.status === "FINISHED") {
        updateStatus(
          data.winner === myPlayer ? "🎉 You won!" : "😢 You lost"
        );
      } else if (data.status === "DRAW") {
        updateStatus("😐 It's a draw");
      } else {
        updateStatus(
          currentPlayer === myPlayer ? "Your turn" : "Opponent's turn"
        );
      }
      break;

    case "ERROR":
      alert(data.message);
      break;
  }
}

/* ===============================
   UI ACTIONS
================================ */

// Call this from "Create Game" button
function createGame() {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  ws.send(JSON.stringify({
    action: "createGame"
  }));
}

// Call this from "Join Game" button
function joinGame() {
  const codeInput = document.getElementById("gameCode");
  const code = codeInput.value.trim().toUpperCase();

  if (!code) {
    alert("Enter game code");
    return;
  }

  ws.send(JSON.stringify({
    action: "joinGame",
    gameId: code
  }));
}

/* ===============================
   CELL CLICK HANDLING
================================ */
function setupCellClicks() {
  const cells = document.querySelectorAll(".cell");

  cells.forEach((cell, index) => {
    cell.addEventListener("click", () => {
      if (!gameId) return;
      if (currentPlayer !== myPlayer) return;
      if (board[index] !== "-") return;

      ws.send(JSON.stringify({
        action: "makeMove",
        gameId,
        index
      }));
    });
  });
}

/* ===============================
   RENDERING
================================ */
function renderBoard() {
  document.querySelectorAll(".cell").forEach((cell, i) => {
    cell.textContent = board[i] === "-" ? "" : board[i];
  });
}

function updateStatus(text) {
  const status = document.getElementById("status");
  if (status) status.textContent = text;
}

/* ===============================
   OPTIONAL: RESET UI (frontend only)
================================ */
function resetUI() {
  gameId = null;
  myPlayer = null;
  currentPlayer = null;
  board = Array(9).fill("-");
  renderBoard();
  updateStatus("Create or join a game");
}
