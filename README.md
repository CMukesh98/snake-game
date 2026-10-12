# Cyber Snake 2077 🐍⚡

A futuristic, high-octane Cyberpunk & Glassmorphic Snake arcade web game built with **Vanilla HTML5 Canvas, CSS3, and modern JavaScript**. Features procedural Web Audio API sound synthesis, dynamic combo streaks, power-ups, multiple game modes, and particle explosions with **zero external dependencies**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Vanilla JS](https://img.shields.io/badge/built%20with-HTML5%20Canvas%20%7C%20CSS3%20%7C%20Vanilla%20JS-yellow.svg)
![Zero Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen.svg)
![Audio Engine](https://img.shields.io/badge/audio-Web%20Audio%20API-ff007f.svg)

---

## ✨ Key Features

- 🎮 **4 Distinct Game Modes**:
  - **Classic**: The pure retro test of reflexes. Walls are lethal.
  - **Wrap Portal**: Quantum edge wrapping. Slip through boundaries to reappear on the opposite side.
  - **Speed Blitz**: Velocity ramps up dynamically with every orb consumed!
  - **Labyrinth**: Procedural neon laser barriers and hazards placed across the arena.
- ⚡ **4 Speed & Difficulty Tiers**:
  - **Relaxed**: Smooth, chill cruising.
  - **Normal**: Balanced arcade rhythm.
  - **Hyper**: Fast-paced reflex gauntlet.
  - **Godspeed**: Ultra-high adrenaline challenge.
- 🔮 **Quantum Power-Ups & Collectibles**:
  - 🟢 **Energy Core**: Standard nourishment (+10 pts, +1 length).
  - ⭐ **Quantum Star**: Rare timed golden orb (+50 pts, rapid expiry ring).
  - ❄️ **Cryo Freeze**: Dilates time, slowing movement by 45% for 6 seconds with frosty visual borders.
  - ⚡ **2X Surge Boost**: Doubles all earned points for 8 seconds.
  - ✂️ **Phase Slicer**: Trims 3 tail segments to rescue you in tight spots.
- 🔥 **Combo Streak System**:
  - Collect items before the combo meter drains to elevate your multiplier (up to **x5.0 MAX**)!
  - Rising audio pitch harmonics reflect your active combo streak tier.
- 🔊 **Zero-Dependency Synthesized Audio Engine**:
  - Powered directly by the browser's native **Web Audio API** (oscillators, biquad filters, exponential gain ramps, noise buffers).
  - Zero audio files or external CDNs required. Zero audio latency.
  - Quick mute toggle (`M`).
- 🎨 **4 Glowing Cyber Themes**:
  - **Cyber Neon**: Electric cyan & vibrant magenta.
  - **Matrix Emerald**: Phosphor terminal green & digital mint.
  - **Synthwave Sunset**: Solar coral & retro violet.
  - **Tokyo Gold**: Imperial gold & electric diamond.
- 📱 **Full Mobile & Touch Support**:
  - Native touch swipe gestures on the canvas.
  - Optional virtual on-screen glowing Neon D-Pad.
  - Responsive high-DPI canvas scaling for sharp visuals on all screens.
- 🎆 **Particle Effects & Screen Dynamics**:
  - Shimmering spark bursts on eating orbs.
  - Screen shake impulse on collisions and golden orbs.
  - Confetti celebration fireworks upon breaking your all-time high score!
  - LocalStorage persistence for your record.

---

## 🕹️ Controls

| Action | Keyboard | Touch / Mobile |
| :--- | :--- | :--- |
| **Move Up** | `↑` or `W` | Swipe Up / D-Pad Up |
| **Move Down** | `↓` or `S` | Swipe Down / D-Pad Down |
| **Move Left** | `←` or `A` | Swipe Left / D-Pad Left |
| **Move Right** | `→` or `D` | Swipe Right / D-Pad Right |
| **Pause / Resume** | `Space` | Pause Button |
| **Quick Restart** | `R` | Restart Button |
| **Toggle Audio** | `M` | Speaker Icon Button |

---

## 🚀 How to Run Locally

Since this project is completely dependency-free, no bundlers, compilation steps, or Node.js installations are required:

1. Clone this repository:
   ```bash
   git clone https://github.com/CMukesh98/snake-game.git
   ```
2. Open `index.html` in your browser (Google Chrome, Microsoft Edge, Safari, Firefox, or Brave).

---

## 🌐 Deploy to GitHub Pages

To host your game online with free hosting:

1. In your GitHub repository, navigate to **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
3. Select branch `main` and folder `/ (root)`.
4. Click **Save**. Your game will be live in 1–2 minutes!

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
