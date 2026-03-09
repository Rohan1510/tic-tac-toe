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
      updatePlayerIndicators();
      updateTurnDisplay();
      updateStatus(`Game code: ${gameId}`);
      hideRestartButton();
      break;

    case "GAME_JOINED":
      gameId = data.gameId;
      myPlayer = data.player;
      updatePlayerIndicators();
      updateTurnDisplay();
      updateStatus(`Joined game ${gameId}`);
      hideRestartButton();
      break;

    case "OPPONENT_JOINED":
      updateStatus("Opponent joined! Game starting...");
      updateTurnDisplay();
      break;

    case "MOVE_MADE":
      board = data.board;
      currentPlayer = data.currentPlayer;
      gameStatus = data.status;
      renderBoard(data.winningPattern);

      if (data.status === "FINISHED") {
        updateStatus(data.winner === myPlayer ? "🎉 You won!" : "😢 You lost");
        showRestartButton();
      } else if (data.status === "DRAW") {
        updateStatus("😐 Draw!");
        showRestartButton();
      } else {
        updateStatus(currentPlayer === myPlayer ? "Your turn" : "Opponent's turn");
        updateTurnDisplay();
      }
      break;

    case "GAME_RESTARTED":
      board = data.board;
      currentPlayer = data.currentPlayer;
      gameStatus = data.status;
      renderBoard();
      updateStatus(currentPlayer === myPlayer ? "New game! Your turn" : "New game!");
      updateTurnDisplay();
      hideRestartButton();
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
  if (winPattern) {
    winPattern.forEach(i =>
      document.querySelectorAll(".cell")[i].classList.add("win")
    );
    drawStrikeLine(winPattern);
  } else {
    hideStrikeLine();
  }
}

function updateStatus(text) {
  document.getElementById("status").textContent = text;
}

function updatePlayerIndicators() {
  const playerXElem = document.getElementById("player-x");
  const playerOElem = document.getElementById("player-o");

  if (myPlayer === "X") {
    playerXElem.classList.add("active");
    playerOElem.classList.remove("active");
  } else if (myPlayer === "O") {
    playerOElem.classList.add("active");
    playerXElem.classList.remove("active");
  }
}

function updateTurnDisplay() {
  const turnText = document.getElementById("turn-text");

  if (!gameId) {
    turnText.textContent = "Waiting for opponent...";
  } else if (gameStatus === "FINISHED" || gameStatus === "DRAW") {
    turnText.textContent = "Game Over";
  } else if (currentPlayer === myPlayer) {
    turnText.textContent = `Your turn (${myPlayer})`;
  } else {
    turnText.textContent = `Opponent's turn (${currentPlayer})`;
  }
}

function showRestartButton() {
  document.querySelector(".restart-btn").classList.add("show");
}

function hideRestartButton() {
  document.querySelector(".restart-btn").classList.remove("show");
}

function drawStrikeLine(winPattern) {
  const cells = document.querySelectorAll(".cell");
  const boardContainer = document.getElementById("board-container");
  const strikeLineSvg = document.getElementById("strike-line");
  const strikeLine = document.getElementById("strike");

  // Get positions of the three winning cells
  const positions = winPattern.map(i => {
    const cell = cells[i];
    const rect = cell.getBoundingClientRect();
    const containerRect = boardContainer.getBoundingClientRect();
    return {
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top + rect.height / 2
    };
  });

  // Calculate SVG coordinates (viewBox is 0 0 400 400)
  const containerWidth = boardContainer.offsetWidth;
  const containerHeight = boardContainer.offsetHeight;
  const scale = 400 / containerWidth;

  const p1 = {
    x: positions[0].x * scale,
    y: positions[0].y * scale
  };

  const p3 = {
    x: positions[2].x * scale,
    y: positions[2].y * scale
  };

  // Set line coordinates with padding to extend beyond cells
  const dx = p3.x - p1.x;
  const dy = p3.y - p1.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const extendFactor = 1.2;
  const extendX = (dx / length) * (length * (extendFactor - 1) / 2);
  const extendY = (dy / length) * (length * (extendFactor - 1) / 2);

  strikeLine.setAttribute("x1", p1.x - extendX);
  strikeLine.setAttribute("y1", p1.y - extendY);
  strikeLine.setAttribute("x2", p3.x + extendX);
  strikeLine.setAttribute("y2", p3.y + extendY);

  strikeLineSvg.classList.add("show");
}

function hideStrikeLine() {
  const strikeLineSvg = document.getElementById("strike-line");
  strikeLineSvg.classList.remove("show");
}

