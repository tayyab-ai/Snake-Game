class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game State
        this.gridSize = 20;
        this.tileCount = 0;
        this.snake = [];
        this.food = {};
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.score = 0;
        this.level = 1;
        this.bestScore = 0;
        this.foodEaten = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.speed = 100; // ms per frame
        this.baseSpeed = 100;
        this.animationId = null;
        this.lastUpdate = 0;
        this.particles = [];
        this.trailPositions = [];
        this.soundEnabled = true;
        
        // Snake textures
        this.snakeGradient = null;
        this.scalePattern = null;
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        this.loadBestScore();
        this.createStars();
        this.bindEvents();
        this.createSnakeTextures();
        this.showScreen('start');
        this.drawIdleSnake();
        
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const width = container.clientWidth;
        const height = Math.min(width / 1.6, 450);
        this.canvas.width = Math.floor(width);
        this.canvas.height = Math.floor(height);
        this.tileCount = Math.floor(this.canvas.width / this.gridSize);
        this.gridSize = Math.floor(this.canvas.width / this.tileCount);
    }
    
    createStars() {
        const starsContainer = document.getElementById('stars');
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.width = Math.random() * 2 + 1 + 'px';
            star.style.height = star.style.width;
            star.style.setProperty('--duration', (Math.random() * 3 + 2) + 's');
            star.style.setProperty('--delay', Math.random() * 3 + 's');
            starsContainer.appendChild(star);
        }
    }
    
    createSnakeTextures() {
        // Create scale pattern
        const patternCanvas = document.createElement('canvas');
        patternCanvas.width = 20;
        patternCanvas.height = 20;
        const pctx = patternCanvas.getContext('2d');
        
        // Draw scale
        pctx.fillStyle = '#0a5e2e';
        pctx.beginPath();
        pctx.arc(10, 10, 9, 0, Math.PI * 2);
        pctx.fill();
        
        pctx.fillStyle = '#0d7a3b';
        pctx.beginPath();
        pctx.arc(10, 10, 7, 0, Math.PI * 2);
        pctx.fill();
        
        pctx.strokeStyle = '#0f9648';
        pctx.lineWidth = 1;
        pctx.beginPath();
        pctx.arc(10, 10, 6, 0, Math.PI * 2);
        pctx.stroke();
        
        pctx.fillStyle = 'rgba(255,255,255,0.15)';
        pctx.beginPath();
        pctx.arc(8, 8, 3, 0, Math.PI * 2);
        pctx.fill();
        
        this.scalePattern = this.ctx.createPattern(patternCanvas, 'repeat');
        
        // Create gradient
        this.snakeGradient = this.ctx.createLinearGradient(0, 0, 20, 20);
        this.snakeGradient.addColorStop(0, '#00ff88');
        this.snakeGradient.addColorStop(0.5, '#00cc6a');
        this.snakeGradient.addColorStop(1, '#00994d');
    }
    
    bindEvents() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning && !this.gameOver && e.key === 'Enter') {
                this.startGame();
                return;
            }
            
            if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
                e.preventDefault();
                this.togglePause();
                return;
            }
            
            const keyMap = {
                'ArrowUp': { x: 0, y: -1 },
                'ArrowDown': { x: 0, y: 1 },
                'ArrowLeft': { x: -1, y: 0 },
                'ArrowRight': { x: 1, y: 0 },
                'w': { x: 0, y: -1 },
                'W': { x: 0, y: -1 },
                's': { x: 0, y: 1 },
                'S': { x: 0, y: 1 },
                'a': { x: -1, y: 0 },
                'A': { x: -1, y: 0 },
                'd': { x: 1, y: 0 },
                'D': { x: 1, y: 0 },
            };
            
            const newDir = keyMap[e.key];
            if (newDir) {
                e.preventDefault();
                // Prevent reversing
                if (newDir.x !== -this.direction.x || newDir.y !== -this.direction.y) {
                    this.nextDirection = newDir;
                }
            }
        });
        
        // Buttons
        document.getElementById('btnStart').addEventListener('click', () => this.startGame());
        document.getElementById('btnRestart').addEventListener('click', () => this.startGame());
        document.getElementById('btnResume').addEventListener('click', () => this.togglePause());
        document.getElementById('btnMenu').addEventListener('click', () => this.showScreen('start'));
        document.getElementById('pauseToggle').addEventListener('click', () => this.togglePause());
        document.getElementById('soundToggle').addEventListener('click', () => this.toggleSound());
        
        // Touch controls
        let touchStartX = 0;
        let touchStartY = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.gameRunning) return;
            
            const dx = e.touches[0].clientX - touchStartX;
            const dy = e.touches[0].clientY - touchStartY;
            
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 20) {
                this.nextDirection = { x: dx > 0 ? 1 : -1, y: 0 };
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            } else if (Math.abs(dy) > 20) {
                this.nextDirection = { x: 0, y: dy > 0 ? 1 : -1 };
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }
        });
    }
    
    startGame() {
        this.snake = [
            { x: Math.floor(this.tileCount / 2), y: Math.floor((this.canvas.height / this.gridSize) / 2) },
            { x: Math.floor(this.tileCount / 2) - 1, y: Math.floor((this.canvas.height / this.gridSize) / 2) },
            { x: Math.floor(this.tileCount / 2) - 2, y: Math.floor((this.canvas.height / this.gridSize) / 2) },
        ];
        
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.score = 0;
        this.level = 1;
        this.foodEaten = 0;
        this.speed = this.baseSpeed;
        this.gameOver = false;
        this.gameRunning = true;
        this.gamePaused = false;
        this.particles = [];
        this.trailPositions = [];
        this.startTime = Date.now();
        this.elapsedTime = 0;
        
        this.spawnFood();
        this.updateDisplay();
        this.showScreen('game');
        
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.lastUpdate = performance.now();
        this.gameLoop(this.lastUpdate);
    }
    
    togglePause() {
        if (!this.gameRunning || this.gameOver) return;
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            this.showScreen('pause');
        } else {
            this.showScreen('game');
            this.lastUpdate = performance.now();
            this.gameLoop(this.lastUpdate);
        }
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const btn = document.getElementById('soundToggle');
        const wave1 = document.getElementById('soundWave1');
        const wave2 = document.getElementById('soundWave2');
        
        if (this.soundEnabled) {
            wave1.style.opacity = '1';
            wave2.style.opacity = '1';
            btn.style.color = '';
        } else {
            wave1.style.opacity = '0.3';
            wave2.style.opacity = '0.3';
            btn.style.color = '#606070';
        }
    }
    
    showScreen(screen) {
        const screens = ['start', 'pause', 'gameOver'];
        screens.forEach(s => {
            const el = document.getElementById(s + 'Screen');
            if (el) el.classList.add('hidden');
        });
        
        const activeScreen = document.getElementById(screen + 'Screen');
        if (activeScreen) activeScreen.classList.remove('hidden');
        
        if (screen === 'game') {
            document.getElementById('pauseIcon').innerHTML = 
                '<rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/>';
        }
    }
    
    gameLoop(timestamp) {
        if (!this.gameRunning || this.gamePaused || this.gameOver) return;
        
        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
        
        const delta = timestamp - this.lastUpdate;
        
        if (delta >= this.speed) {
            this.update();
            this.draw();
            this.lastUpdate = timestamp;
        }
    }
    
    update() {
        this.direction = this.nextDirection;
        
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // Wall collision check - wrap around
        if (head.x < 0) head.x = this.tileCount - 1;
        if (head.x >= this.tileCount) head.x = 0;
        if (head.y < 0) head.y = Math.floor(this.canvas.height / this.gridSize) - 1;
        if (head.y >= Math.floor(this.canvas.height / this.gridSize)) head.y = 0;
        
        // Add trail
        this.trailPositions.push({ ...head, alpha: 1 });
        if (this.trailPositions.length > 5) this.trailPositions.shift();
        this.trailPositions.forEach(t => t.alpha -= 0.2);
        
        // Self collision check
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.endGame();
            return;
        }
        
        this.snake.unshift(head);
        
        // Food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.eatFood();
        } else {
            this.snake.pop();
        }
    }
    
    eatFood() {
        this.score += 10 * this.level;
        this.foodEaten++;
        this.level = this.foodEaten + 1;
        
        // Increase speed
        this.speed = Math.max(40, this.baseSpeed - (this.level - 1) * 3);
        
        // Particles
        this.spawnParticles(this.food.x * this.gridSize + this.gridSize / 2, 
                           this.food.y * this.gridSize + this.gridSize / 2);
        
        this.spawnFood();
        this.showLevelUp();
        this.updateDisplay();
        this.playSound('eat');
    }
    
    spawnFood() {
        const maxY = Math.floor(this.canvas.height / this.gridSize);
        
        do {
            this.food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * maxY),
            };
        } while (this.snake.some(s => s.x === this.food.x && s.y === this.food.y));
        
        // Food animation
        this.food.pulse = 0;
        this.food.type = Math.random() < 0.2 ? 'golden' : 'normal'; // 20% chance golden apple
    }
    
    spawnParticles(x, y) {
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 1,
                color: this.food.type === 'golden' ? '#ffa502' : '#00ff88',
            });
        }
    }
    
    showLevelUp() {
        const notif = document.getElementById('levelUpNotif');
        document.getElementById('levelUpNumber').textContent = this.level;
        document.getElementById('levelUpSpeed').textContent = 
            'Speed: ' + (this.baseSpeed / this.speed).toFixed(1) + 'x';
        
        notif.classList.add('show');
        setTimeout(() => notif.classList.remove('show'), 1500);
    }
    
    endGame() {
        this.gameOver = true;
        this.gameRunning = false;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('snakeBestScore', this.bestScore);
        }
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalLevel').textContent = this.level;
        document.getElementById('finalFood').textContent = this.foodEaten;
        document.getElementById('finalTime').textContent = 
            minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
        
        this.updateDisplay();
        this.showScreen('gameOver');
        this.draw();
        this.playSound('die');
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('foodCount').textContent = this.foodEaten;
        document.getElementById('speedDisplay').textContent = 
            (this.baseSpeed / this.speed).toFixed(1) + 'x';
    }
    
    loadBestScore() {
        const saved = localStorage.getItem('snakeBestScore');
        this.bestScore = saved ? parseInt(saved) : 0;
        document.getElementById('bestScore').textContent = this.bestScore;
    }
    
    playSound(type) {
        if (!this.soundEnabled) return;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === 'eat') {
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.linearRampToValueAtTime(1200, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.15);
        } else if (type === 'die') {
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            oscillator.frequency.linearRampToValueAtTime(100, audioContext.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
        }
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }
    
    draw() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Clear with dark grid
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, width, height);
        
        // Grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 0.5;
        
        for (let x = 0; x <= this.tileCount; x++) {
            ctx.beginPath();
            ctx.moveTo(x * this.gridSize, 0);
            ctx.lineTo(x * this.gridSize, height);
            ctx.stroke();
        }
        
        const rows = Math.floor(height / this.gridSize);
        for (let y = 0; y <= rows; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * this.gridSize);
            ctx.lineTo(width, y * this.gridSize);
            ctx.stroke();
        }
        
        // Trail
        this.trailPositions.forEach(trail => {
            ctx.fillStyle = `rgba(0, 255, 136, ${trail.alpha * 0.3})`;
            ctx.fillRect(
                trail.x * this.gridSize + 2,
                trail.y * this.gridSize + 2,
                this.gridSize - 4,
                this.gridSize - 4
            );
        });
        
        // Snake body
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            const padding = 2;
            
            if (index === 0) {
                // Head
                ctx.save();
                ctx.shadowColor = 'rgba(0, 255, 136, 0.8)';
                ctx.shadowBlur = 15;
                
                // Head shape
                const headGrad = ctx.createLinearGradient(x, y, x + this.gridSize, y + this.gridSize);
                headGrad.addColorStop(0, '#00ff88');
                headGrad.addColorStop(0.5, '#00cc6a');
                headGrad.addColorStop(1, '#00994d');
                
                ctx.fillStyle = headGrad;
                ctx.beginPath();
                ctx.roundRect(
                    x + padding,
                    y + padding,
                    this.gridSize - padding * 2,
                    this.gridSize - padding * 2,
                    6
                );
                ctx.fill();
                
                // Eyes
                this.drawEyes(x, y);
                
                ctx.restore();
            } else {
                // Body with scale pattern
                ctx.save();
                ctx.shadowColor = 'rgba(0, 255, 136, 0.4)';
                ctx.shadowBlur = 8;
                
                const alpha = 1 - (index / this.snake.length) * 0.5;
                const bodyGrad = ctx.createLinearGradient(x, y, x + this.gridSize, y + this.gridSize);
                bodyGrad.addColorStop(0, `rgba(0, 200, 100, ${alpha})`);
                bodyGrad.addColorStop(0.5, `rgba(0, 170, 85, ${alpha})`);
                bodyGrad.addColorStop(1, `rgba(0, 130, 65, ${alpha})`);
                
                ctx.fillStyle = bodyGrad;
                ctx.beginPath();
                ctx.roundRect(
                    x + padding + 1,
                    y + padding + 1,
                    this.gridSize - padding * 2 - 2,
                    this.gridSize - padding * 2 - 2,
                    5
                );
                ctx.fill();
                
                // Scale highlight
                ctx.fillStyle = `rgba(255, 255, 255, ${0.1 * alpha})`;
                ctx.beginPath();
                ctx.arc(
                    x + this.gridSize / 2,
                    y + this.gridSize / 2,
                    this.gridSize / 5,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                
                ctx.restore();
            }
        });
        
        // Food
        this.drawFood();
        
        // Particles
        this.particles = this.particles.filter(p => p.life > 0);
        this.particles.forEach(p => {
            ctx.fillStyle = p.color.replace(')', `, ${p.life})`).replace('rgb', 'rgba');
            if (p.color.startsWith('#')) {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
            }
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.05;
        });
        ctx.globalAlpha = 1;
    }
    
    drawEyes(x, y) {
        const ctx = this.ctx;
        const eyeSize = this.gridSize / 5;
        
        // Eye positions based on direction
        let eye1X, eye1Y, eye2X, eye2Y;
        
        if (this.direction.x === 1) { // Right
            eye1X = x + this.gridSize * 0.65;
            eye1Y = y + this.gridSize * 0.3;
            eye2X = x + this.gridSize * 0.65;
            eye2Y = y + this.gridSize * 0.7;
        } else if (this.direction.x === -1) { // Left
            eye1X = x + this.gridSize * 0.35;
            eye1Y = y + this.gridSize * 0.3;
            eye2X = x + this.gridSize * 0.35;
            eye2Y = y + this.gridSize * 0.7;
        } else if (this.direction.y === -1) { // Up
            eye1X = x + this.gridSize * 0.3;
            eye1Y = y + this.gridSize * 0.35;
            eye2X = x + this.gridSize * 0.7;
            eye2Y = y + this.gridSize * 0.35;
        } else { // Down
            eye1X = x + this.gridSize * 0.3;
            eye1Y = y + this.gridSize * 0.65;
            eye2X = x + this.gridSize * 0.7;
            eye2Y = y + this.gridSize * 0.65;
        }
        
        // White part
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupil
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(eye1X + this.direction.x * 1.5, eye1Y + this.direction.y * 1.5, eyeSize * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eye2X + this.direction.x * 1.5, eye2Y + this.direction.y * 1.5, eyeSize * 0.6, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawFood() {
        const ctx = this.ctx;
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        
        // Pulsing animation
        this.food.pulse = (this.food.pulse || 0) + 0.05;
        const pulse = Math.sin(this.food.pulse) * 3;
        const center = this.gridSize / 2;
        
        ctx.save();
        
        if (this.food.type === 'golden') {
            // Golden apple
            ctx.shadowColor = 'rgba(255, 165, 2, 0.8)';
            ctx.shadowBlur = 20;
            
            const grad = ctx.createRadialGradient(
                x + center, y + center, 2,
                x + center, y + center, center + pulse
            );
            grad.addColorStop(0, '#ffd700');
            grad.addColorStop(0.6, '#ffa502');
            grad.addColorStop(1, '#ff7f00');
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x + center, y + center, center - 3 + pulse, 0, Math.PI * 2);
            ctx.fill();
            
            // Star sparkle
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '14px Inter';
            ctx.fillText('✨', x + center - 8, y + center + 5);
        } else {
            // Normal red apple
            ctx.shadowColor = 'rgba(255, 71, 87, 0.6)';
            ctx.shadowBlur = 15;
            
            const grad = ctx.createRadialGradient(
                x + center - 2, y + center - 2, 2,
                x + center, y + center, center + pulse
            );
            grad.addColorStop(0, '#ff6b81');
            grad.addColorStop(0.5, '#ff4757');
            grad.addColorStop(1, '#c0392b');
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x + center, y + center, center - 3 + pulse, 0, Math.PI * 2);
            ctx.fill();
            
            // Leaf
            ctx.fillStyle = '#2ed573';
            ctx.beginPath();
            ctx.ellipse(x + center + 3, y + 4, 5, 3, 0.3, 0, Math.PI * 2);
            ctx.fill();
            
            // Stem
            ctx.strokeStyle = '#8b4513';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x + center + 2, y + 4);
            ctx.lineTo(x + center + 2, y - 2);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    drawIdleSnake() {
        // Draw a small animated snake on start screen
        if (this.gameRunning) return;
        
        const ctx = this.ctx;
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 0.5;
        
        for (let x = 0; x <= this.tileCount; x++) {
            ctx.beginPath();
            ctx.moveTo(x * this.gridSize, 0);
            ctx.lineTo(x * this.gridSize, this.canvas.height);
            ctx.stroke();
        }
        
        const rows = Math.floor(this.canvas.height / this.gridSize);
        for (let y = 0; y <= rows; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * this.gridSize);
            ctx.lineTo(this.canvas.width, y * this.gridSize);
            ctx.stroke();
        }
        
        // Demo snake
        const time = Date.now() / 1000;
        const demoSnake = [];
        const startX = Math.floor(this.tileCount / 2);
        const startY = Math.floor(rows / 2);
        
        for (let i = 0; i < 5; i++) {
            demoSnake.push({
                x: startX - i + Math.sin(time + i * 0.5) * 2,
                y: startY + Math.cos(time + i * 0.5) * 1,
            });
        }
        
        demoSnake.forEach((seg, i) => {
            const x = seg.x * this.gridSize;
            const y = seg.y * this.gridSize;
            
            ctx.fillStyle = i === 0 ? '#00ff88' : `rgba(0, 200, 100, ${1 - i * 0.15})`;
            ctx.beginPath();
            ctx.roundRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4, 5);
            ctx.fill();
        });
        
        if (!this.gameRunning) {
            setTimeout(() => this.drawIdleSnake(), 100);
        }
    }
}

// Polyfill for roundRect
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (typeof r === 'number') r = { tl: r, tr: r, br: r, bl: r };
        this.beginPath();
        this.moveTo(x + r.tl, y);
        this.lineTo(x + w - r.tr, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r.tr);
        this.lineTo(x + w, y + h - r.br);
        this.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
        this.lineTo(x + r.bl, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r.bl);
        this.lineTo(x, y + r.tl);
        this.quadraticCurveTo(x, y, x + r.tl, y);
        this.closePath();
        return this;
    };
}

// Initialize game
const game = new SnakeGame();