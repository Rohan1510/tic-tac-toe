const WS_URL = "wss://mf65ys1wsi.execute-api.ap-south-1.amazonaws.com/prod/";

let ws;
let gameId = null;
let myPlayer = null;
let currentPlayer = null;
let board = Array(9).fill("-");
let gameStatus = "WAITING";

connectWebSocket();
setupCellClicks();

function connectWebSocket() {
  ws = new WebSocket(WS_URL);
  ws.onopen = () => updateStatus("Connected. Create or join a game.");
  ws.onmessage = e => handleServerMessage(JSON.parse(e.data));
}

function handleServerMessage(data) {
  switch (data.type) {

    case "GAME_CREATED":
      gameId = data.gameId;
      myPlayer = data.player;
      currentPlayer = "X";
      gameStatus = "PLAYING";
      board = Array(9).fill("-");
      renderBoard();
      updateStatus(`Game code: ${gameId}`);
      break;

    case "GAME_JOINED":
      gameId = data.gameId;
      myPlayer = data.player;
      updateStatus(`Joined game ${gameId}`);
      break;

    case "OPPONENT_JOINED":
      updateStatus("Opponent joined!");
      break;

    case "MOVE_MADE":
      board = data.board;
      currentPlayer = data.currentPlayer;
      gameStatus = data.status;
      renderBoard(data.winningPattern);

      if (data.status === "FINISHED")
        updateStatus(data.winner === myPlayer ? "🎉 You won!" : "😢 You lost");
      else if (data.status === "DRAW")
        updateStatus("😐 Draw");
      else
        updateStatus(currentPlayer === myPlayer ? "Your turn" : "Opponent's turn");
      break;

    case "GAME_RESTARTED":
      board = data.board;
      currentPlayer = data.currentPlayer;
      gameStatus = data.status;
      renderBoard();
      updateStatus(currentPlayer === myPlayer ? "New game! Your turn" : "New game!");
      break;
  }
}

function createGame() {
  ws.send(JSON.stringify({ action: "createGame" }));
}

function joinGame() {
  const code = document.getElementById("gameCode").value.trim().toUpperCase();
  if (!code) return alert("Enter game code");
  ws.send(JSON.stringify({ action: "joinGame", gameId: code }));
}

function restartGame() {
  if (gameStatus !== "FINISHED" && gameStatus !== "DRAW") return;
  ws.send(JSON.stringify({ action: "restartGame", gameId }));
}

function setupCellClicks() {
  document.querySelectorAll(".cell").forEach((cell, i) => {
    cell.addEventListener("click", () => {
      if (!gameId || gameStatus !== "PLAYING") return;
      if (currentPlayer !== myPlayer || board[i] !== "-") return;
      ws.send(JSON.stringify({ action: "makeMove", gameId, index: i }));
    });
  });
}

function renderBoard(winPattern = null) {
  document.querySelectorAll(".cell").forEach((cell, i) => {
    cell.textContent = board[i] === "-" ? "" : board[i];
    cell.classList.remove("win");
  });
  if (winPattern) winPattern.forEach(i =>
    document.querySelectorAll(".cell")[i].classList.add("win")
  );
}

function updateStatus(text) {
  document.getElementById("status").textContent = text;
}
