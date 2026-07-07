# 🐍 Snake Game - Level Infinity

A professional, visually stunning snake game with realistic textures, infinite levels, and smooth gameplay. Built with vanilla JavaScript and HTML5 Canvas.

![Snake Game Preview](preview.png)

## ✨ Features

### 🎮 Gameplay
- **Infinite Levels**: Each food eaten = 1 level up. No level cap!
- **Speed Progression**: Game gets faster with each level
- **Golden Apples**: 20% chance of golden apple spawn for extra thrill
- **Wrap-Around Mode**: Snake wraps around screen edges (no wall death)
- **Self-Collision**: Only way to die is hitting your own body

### 🎨 Visual Excellence
- **Realistic Snake Textures**: Gradient scales with highlights and shadows
- **Animated Eyes**: Snake eyes follow movement direction
- **Particle Effects**: Burst particles when eating food
- **Motion Trail**: Ghost trail behind the snake
- **Pulsing Food**: Animated apples with glow effects
- **Level Up Notification**: Dramatic popup with bounce animation
- **Starfield Background**: Dynamic twinkling stars

### 🎵 Audio
- **Sound Effects**: Eat and death sounds
- **Sound Toggle**: Mute/unmute with button
- **Web Audio API**: No external audio files needed

### 📊 Stats & Progress
- **Score Tracking**: Points multiplier increases with level
- **Best Score**: Persistent high score via localStorage
- **Real-time Stats**: Score, level, food count, speed display
- **Survival Timer**: Track how long you survived

### 🕹️ Controls
| Key | Action |
|-----|--------|
| `↑` `↓` `←` `→` | Move snake |
| `W` `A` `S` `D` | Alternative movement |
| `SPACE` / `P` | Pause/Resume |
| `ENTER` | Start game |

- **Touch Support**: Swipe gestures for mobile devices

### 📱 Responsive Design
- Fully responsive for desktop and mobile
- Adaptive canvas sizing
- Touch-optimized controls

## 🚀 Getting Started

### Live Demo
Open `index.html` in any modern browser. No dependencies!

### Local Setup
```bash
# Clone repository
git clone https://github.com/Tayyab/snake-game.git

# Navigate to folder
cd snake-game

# Open in browser
open index.html
# OR
python -m http.server 8000
