# Neo Tic-Tac-Toe 🎮⚡

A futuristic, high-octane Cyberpunk & Glassmorphism Tic-Tac-Toe web game featuring an **unbeatable Minimax AI**, multiple board sizes (3x3, 4x4, 5x5), synthesized Web Audio sound effects, match replays, win streak tracking, and customizable glowing themes.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Vanilla JS](https://img.shields.io/badge/built%20with-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-yellow.svg)
![Zero Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen.svg)

---

## ✨ Features

- 🧠 **Smart AI with 3 Difficulties**:
  - **Casual**: Relaxed, fun gameplay with tactical moments.
  - **Tactical**: Actively seeks wins and blocks opponent streaks.
  - **Unbeatable (God Mode)**: Full Minimax algorithm with $\alpha$-$\beta$ pruning. Mathematically impossible to defeat on 3x3!
- 👥 **Local 2-Player Mode**: Pass & play with friends with active turn spotlights.
- 📐 **Multiple Board Sizes**:
  - **3x3 Classic**: Standard 3 in a row.
  - **4x4 Tactical**: 4 in a row.
  - **5x5 Grand**: Gomoku-style 4 in a row on an expansive grid.
- 🎨 **4 Glowing Cyber Themes**:
  - **Cyber Neon**: Electric cyan & vibrant magenta.
  - **Emerald Matrix**: Matrix green & golden solar.
  - **Sunset Synthwave**: Electric violet & solar coral.
  - **Obsidian Gold**: Champagne gold & diamond blue.
- 🔊 **Zero-Dependency Synthesized Audio**: Built entirely using the native **Web Audio API** for zero-latency, crisp sci-fi clicks, drop tones, and celebratory chords. Includes one-tap mute (`M`).
- 🎬 **Match Replay**: Watch an animated, move-by-move replay of your finished match.
- ↩️ **Undo Move**: Take back moves at any time with turn rollback.
- 🎆 **Particle Celebration**: Custom canvas confetti burst upon victory.
- ⚡ **Dynamic Laser Strike**: SVG animated laser beam slicing through the exact winning coordinates.
- ⌨️ **Keyboard Controls**: Play using NumPad / keys `1`–`9`, `R` to restart, `U` to undo, `M` to mute.

---

## 🚀 How to Run Locally

Since this game is built entirely with pure HTML5, CSS3, and JavaScript, no build steps, bundlers, or Node.js installations are required:

1. Clone the repository:
   ```bash
   git clone https://github.com/CMukesh98/tic-tac-toe-game.git
   ```
2. Open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).

---

## 🌐 Deploy to GitHub Pages

To host this game online for free with GitHub Pages:

1. Go to your repository on GitHub: `https://github.com/CMukesh98/tic-tac-toe-game`
2. Click **Settings** > **Pages** (in the left sidebar).
3. Under **Branch**, select `main` (or `master`) and folder `/ (root)`.
4. Click **Save**. Within 1–2 minutes, your game will be live at:
   `https://cmukesh98.github.io/tic-tac-toe-game/`

---

## 📂 Project Structure

```text
├── index.html       # HTML5 semantics, scoreboard, board arena, modal dialogs
├── styles.css       # Design system, glassmorphism, glowing CSS variables, animations
├── game.js          # Core TicTacToeEngine with Minimax AI & heuristic search
├── app.js           # UI events, laser coordinates, replay engine, keyboard shortcuts
├── audio.js         # Web Audio API sound synthesizer
├── confetti.js      # HTML5 Canvas victory particle engine
├── README.md        # Documentation & deployment guide
└── .gitignore       # Git ignore rules
```

---

## 📜 License

MIT License. Feel free to use, modify, and distribute!
