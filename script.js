const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");

let currentPlayer = "X";
let board = ["", "", "", "", "", "", "", "", ""];
let gameActive = true;

const winPatterns = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

cells.forEach((cell, index) => {
  cell.addEventListener("click", () => handleClick(index));
});

function handleClick(index) {
  if (!gameActive || board[index] !== "") return;

  board[index] = currentPlayer;
  cells[index].textContent = currentPlayer;

  if (checkWinner()) {
    statusText.textContent = `Player ${currentPlayer} wins 🎉`;
    gameActive = false;
    return;
  }

  if (!board.includes("")) {
    statusText.textContent = "It's a draw 😐";
    gameActive = false;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = `Player ${currentPlayer}'s turn`;
}

function checkWinner() {
  return winPatterns.some(pattern =>
    pattern.every(index => board[index] === currentPlayer)
  );
}

function restartGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  gameActive = true;
  currentPlayer = "X";
  statusText.textContent = "Player X's turn";
  cells.forEach(cell => cell.textContent = "");
}

statusText.textContent = "Player X's turn";
