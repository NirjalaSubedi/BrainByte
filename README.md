# BrainByte 🧠🎮

BrainByte is a web-based gaming platform that hosts a variety of interactive browser games. It features a modern frontend, a backend for managing game data, and a growing collection of engaging games.

## 📂 Project Structure

- **`frontend/`**: The main React-based application that serves as the dashboard and portal to access all the games.
- **`backend/`**: The server-side code (Node.js) that handles API requests, high scores, and user data.
- **`ragdoll-game/`**: A fully featured archery combat game utilizing Phaser for 2D physics and rendering, integrated smoothly with React.

## 🚀 Games Included

1. **Ragdoll Game** 🏹: A physics-based archery game where you fight against AI using a bow and arrow. Features include:
   - Dynamic 2D physics with Phaser.
   - High-quality sound effects (headshots, hits, hurt, victory, defeat).
   - A reactive UI built with React components.

*(Additional games like Sudoku, Spacewaves, and Fruit Slicer are also integrated within the platform).*

## 🛠️ Getting Started

To run the project locally, you will need to start the respective development servers:

### 1. Running the Ragdoll Game directly
```bash
cd ragdoll-game
npm install
npm run dev
```

### 2. Running the Main Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Running the Backend
```bash
cd backend
npm install
npm start
```

## 💻 Tech Stack
- **Frontend**: React, Vite, Tailwind CSS
- **Game Engine**: Phaser 3
- **Backend**: Node.js, Express

---
*Created and maintained by [NirjalaSubedi](https://github.com/NirjalaSubedi) / [SamikshaBhandari](https://github.com/SamikshaBhandari) / [RuksanKarki](https://github.com/ruksan27)*
