# 🎮 Multiplayer Tic Tac Toe (AWS WebSocket)

A **real-time multiplayer Tic Tac Toe game** built using a **serverless AWS architecture**. Players can create a game room, join using a code, play in real time, and restart games — all synchronized instantly across clients.

This project demonstrates **WebSockets, serverless backend design, real-time state synchronization, and cloud-native engineering**.

---

## 🚀 Live Demo
🔗 [Demo](https://rohan1510.github.io/tic-tac-toe/)

Open the link in **two browsers / devices** to test multiplayer.

---

## ✨ Features
- Real-time multiplayer gameplay  
- Create & join games using a room code  
- Turn-based move validation  
- Single-winner enforcement (no race conditions)  
- Winning strike / highlight effect  
- Game locks after win or draw  
- Restart game (syncs both players)  
- Fully serverless backend  
- Responsive UI (desktop & mobile)

---

## 🧠 Tech Stack

**Frontend**
- HTML5
- CSS3
- Vanilla JavaScript
- WebSocket client

**Backend (AWS)**
- API Gateway (WebSocket API)
- AWS Lambda (Node.js)
- Amazon DynamoDB
- IAM (secure permissions)

---

## 🏗️ Architecture Overview
Browser (Player A / Player B)
↓ WebSocket
AWS API Gateway (WebSocket)
↓
AWS Lambda (Game Logic)
↓
Amazon DynamoDB (Game State)


---

## 🎮 How to Play
1. Player A clicks **Create Game**
2. Share the generated **game code**
3. Player B enters the code and clicks **Join Game**
4. Players take turns (X always starts)
5. Game ends on **Win** or **Draw**
6. Click **Restart Game** to play again

---

## 🔒 Game Rules & Safety
- Only the correct player can make a move
- Invalid or late moves are ignored
- Board locks after game ends
- Restart resets the board for both players

---

## 🧪 Local Setup
```bash
git clone https://github.com/Rohan1510/tic-tac-toe.git
cd tic-tac-toe
tic-tac-toe/
├── index.html
├── style.css
├── script.js
└── README.md
🙌 Author

Rohan
GitHub: https://github.com/Rohan1510
