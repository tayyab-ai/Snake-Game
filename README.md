# Neon Coil — Snake Game

A retro-arcade styled Snake game built for the web. Glowing neon snake, CRT scanline effect, increasing speed, and touch controls — pure HTML, CSS, and vanilla JavaScript, no dependencies.

![Made with HTML, CSS, JS](https://img.shields.io/badge/stack-HTML%20%7C%20CSS%20%7C%20JS-4cf1c7)
![No dependencies](https://img.shields.io/badge/dependencies-none-14181f)
![License](https://img.shields.io/badge/license-MIT-6d7688)

## 🎮 Features

- **Classic Snake gameplay** on a 20×20 grid, rendered on `<canvas>`
- **Neon arcade visual style** — glowing gradient snake body, pulsing food, CRT scanlines
- **Progressive difficulty** — speed increases automatically as your score grows
- **Score + Best tracking** for the current session
- **Full keyboard controls** — Arrow keys or WASD, Space to pause/resume
- **On-screen D-pad** for mobile/touch devices
- **Pause / Resume / Game Over overlays**
- **Fully responsive** — playable on desktop and mobile

## 🖥️ Live Preview

Open `index.html` in any modern browser — no build step, no installation, no dependencies.

## 📁 Project Structure

```
├── index.html      # Markup / structure
├── style.css        # Neon arcade theme & layout
├── script.js        # Game loop, rendering, and input handling
└── README.md         # You're here
```

## 🚀 Getting Started

1. Clone the repository
   ```bash
   git clone https://github.com/<your-username>/<repo-name>.git
   ```
2. Open `index.html` in your browser — that's it.

Or deploy instantly with **GitHub Pages**:
`Settings → Pages → Deploy from branch → main`

## ⌨️ Controls

| Key | Action |
|---|---|
| `↑ ↓ ← →` or `W A S D` | Move |
| `Space` | Pause / Resume |
| On-screen D-pad | Move (touch devices) |

## 🛠️ Tech

- **HTML5 Canvas** for rendering
- **CSS3** — custom properties, responsive layout, glow/scanline effects
- **Vanilla JavaScript** — game loop, collision detection, and state management, no external libraries

## 📄 License

This project is open source under the [MIT License](https://opensource.org/licenses/MIT).
