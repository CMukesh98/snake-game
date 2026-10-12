/**
 * Cyber Snake 2077 - Core Game Engine
 * High-performance canvas arcade loop with particles, combo streaks, power-ups, and audio.
 */

class CyberSnakeGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.wrapper = document.querySelector('.canvas-wrapper');

        // Grid Configuration
        this.gridSize = 24; // 24x24 tiles
        this.tileSize = 25; // Base tile size, dynamically scaled
        this.width = 600;
        this.height = 600;

        // Game State
        this.state = 'START'; // 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('cyber_snake_highscore') || '0', 10);
        this.applesEaten = 0;
        this.gameStartTime = 0;
        this.playDuration = 0;

        // Settings
        this.gameMode = 'classic'; // 'classic' | 'portal' | 'blitz' | 'obstacles'
        this.difficulty = 'normal'; // 'relaxed' | 'normal' | 'hyper' | 'godspeed'

        // Snake Model
        this.snake = [];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.inputQueue = [];

        // Food & Items
        this.food = null; // { x, y, type: 'apple' | 'golden' | 'freeze' | 'shrink' | 'multiplier', timer?: number, maxTimer?: number }
        this.obstacles = []; // Array of { x, y }

        // Active Buffs
        this.activeBuffs = {
            freeze: 0,       // remaining ms
            multiplier: 0,   // remaining ms
            magnet: 0        // remaining ms
        };

        // Combo Multiplier System
        this.combo = 1;
        this.maxComboReached = 1;
        this.comboTimer = 0;
        this.comboDuration = 4500; // 4.5 seconds to chain next food

        // VFX Systems
        this.particles = [];
        this.floatingTexts = [];
        this.glowPulse = 0;

        // Timing Loop
        this.lastFrameTime = 0;
        this.tickAccumulator = 0;
        this.baseSpeeds = {
            relaxed: 135,
            normal: 100,
            hyper: 70,
            godspeed: 48
        };

        this.initCanvas();
        this.initEventListeners();
        this.updateHUD();
        this.render();
    }

    initCanvas() {
        const dpr = window.devicePixelRatio || 1;
        this.width = 600;
        this.height = 600;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.tileSize = this.width / this.gridSize;
    }

    getTickInterval() {
        let speed = this.baseSpeeds[this.difficulty] || 100;
        if (this.gameMode === 'blitz') {
            const speedUp = Math.min(this.applesEaten * 2.2, 55);
            speed = Math.max(38, speed - speedUp);
        }
        if (this.activeBuffs.freeze > 0) {
            speed *= 1.45; // 45% slower when freeze is active
        }
        return speed;
    }

    reset() {
        const startX = Math.floor(this.gridSize / 2);
        const startY = Math.floor(this.gridSize / 2);

        this.snake = [
            { x: startX, y: startY },
            { x: startX - 1, y: startY },
            { x: startX - 2, y: startY }
        ];

        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.inputQueue = [];

        this.score = 0;
        this.applesEaten = 0;
        this.combo = 1;
        this.maxComboReached = 1;
        this.comboTimer = 0;
        this.gameStartTime = Date.now();
        this.playDuration = 0;

        this.activeBuffs = { freeze: 0, multiplier: 0, magnet: 0 };
        this.particles = [];
        this.floatingTexts = [];

        this.generateObstacles();
        this.spawnFood();

        this.state = 'PLAYING';
        this.hideOverlays();
        this.updateHUD();
        if (window.sound) window.sound.init();
    }

    generateObstacles() {
        this.obstacles = [];
        if (this.gameMode !== 'obstacles') return;

        const count = 10;
        for (let i = 0; i < count; i++) {
            let pos;
            let attempts = 0;
            do {
                pos = {
                    x: Math.floor(Math.random() * (this.gridSize - 4)) + 2,
                    y: Math.floor(Math.random() * (this.gridSize - 4)) + 2
                };
                attempts++;
            } while (attempts < 50 && (
                (Math.abs(pos.x - this.gridSize / 2) < 4 && Math.abs(pos.y - this.gridSize / 2) < 4) ||
                this.obstacles.some(o => o.x === pos.x && o.y === pos.y)
            ));
            this.obstacles.push(pos);
        }
    }

    spawnFood() {
        const roll = Math.random();
        let type = 'apple';

        // Power-up roll chances
        if (roll < 0.12) {
            type = 'golden';
        } else if (roll < 0.20) {
            type = 'freeze';
        } else if (roll < 0.28) {
            type = 'multiplier';
        } else if (roll < 0.35 && this.snake.length > 5) {
            type = 'shrink';
        }

        let pos;
        let valid = false;
        let attempts = 0;

        while (!valid && attempts < 200) {
            attempts++;
            pos = {
                x: Math.floor(Math.random() * this.gridSize),
                y: Math.floor(Math.random() * this.gridSize)
            };

            const hitsSnake = this.snake.some(seg => seg.x === pos.x && seg.y === pos.y);
            const hitsObstacle = this.obstacles.some(obs => obs.x === pos.x && obs.y === pos.y);

            if (!hitsSnake && !hitsObstacle) {
                valid = true;
            }
        }

        const timer = type === 'golden' ? 6000 : 0;
        this.food = {
            x: pos.x,
            y: pos.y,
            type,
            timer,
            maxTimer: timer
        };
    }

    // Input & Direction Handlers
    handleKey(code) {
        if (window.sound) window.sound.init();

        if (code === 'Space') {
            if (this.state === 'START' || this.state === 'GAMEOVER') {
                this.reset();
            } else if (this.state === 'PLAYING') {
                this.pause();
            } else if (this.state === 'PAUSED') {
                this.resume();
            }
            return;
        }

        if (code === 'KeyR') {
            this.reset();
            return;
        }

        if (code === 'KeyM') {
            const isMuted = window.sound.toggleMute();
            this.updateMuteButton(isMuted);
            return;
        }

        if (this.state !== 'PLAYING') return;

        let desiredDir = null;
        switch (code) {
            case 'ArrowUp':
            case 'KeyW':
                desiredDir = { x: 0, y: -1 };
                break;
            case 'ArrowDown':
            case 'KeyS':
                desiredDir = { x: 0, y: 1 };
                break;
            case 'ArrowLeft':
            case 'KeyA':
                desiredDir = { x: -1, y: 0 };
                break;
            case 'ArrowRight':
            case 'KeyD':
                desiredDir = { x: 1, y: 0 };
                break;
        }

        if (desiredDir && this.inputQueue.length < 2) {
            const lastQueued = this.inputQueue.length > 0 ? this.inputQueue[this.inputQueue.length - 1] : this.direction;
            // Prevent 180 reverse
            if (desiredDir.x !== -lastQueued.x || desiredDir.y !== -lastQueued.y) {
                this.inputQueue.push(desiredDir);
                if (window.sound) window.sound.playTurn();
            }
        }
    }

    setDirection(x, y) {
        this.handleKey(
            x === 0 && y === -1 ? 'ArrowUp' :
            x === 0 && y === 1 ? 'ArrowDown' :
            x === -1 && y === 0 ? 'ArrowLeft' :
            'ArrowRight'
        );
    }

    pause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            document.getElementById('pause-overlay').classList.add('active');
            if (window.sound) window.sound.playUiClick();
        }
    }

    resume() {
        if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            document.getElementById('pause-overlay').classList.remove('active');
            if (window.sound) window.sound.playUiClick();
        }
    }

    // Main Game Loop Step
    update(dt) {
        if (this.state !== 'PLAYING') return;

        this.glowPulse += dt * 0.005;

        // Update Combo Decay
        if (this.comboTimer > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) {
                this.combo = 1;
                this.comboTimer = 0;
            }
        }

        // Update Active Buff Timers
        for (let key in this.activeBuffs) {
            if (this.activeBuffs[key] > 0) {
                this.activeBuffs[key] -= dt;
                if (this.activeBuffs[key] <= 0) {
                    this.activeBuffs[key] = 0;
                }
            }
        }

        // Update Golden Food Expiry
        if (this.food && this.food.timer > 0) {
            this.food.timer -= dt;
            if (this.food.timer <= 0) {
                this.spawnFood(); // replace with standard food
            }
        }

        // Update VFX
        this.updateParticles(dt);
        this.updateFloatingTexts(dt);

        // Tick Snake Physics
        this.tickAccumulator += dt;
        const tickInterval = this.getTickInterval();

        while (this.tickAccumulator >= tickInterval) {
            this.tickAccumulator -= tickInterval;
            this.step();
        }

        this.updateHUD();
    }

    step() {
        // Apply Next Queued Direction
        if (this.inputQueue.length > 0) {
            this.direction = this.inputQueue.shift();
        }

        const head = this.snake[0];
        let nextX = head.x + this.direction.x;
        let nextY = head.y + this.direction.y;

        // Wall Collision Handling
        if (this.gameMode === 'portal') {
            if (nextX < 0) nextX = this.gridSize - 1;
            if (nextX >= this.gridSize) nextX = 0;
            if (nextY < 0) nextY = this.gridSize - 1;
            if (nextY >= this.gridSize) nextY = 0;
        } else {
            if (nextX < 0 || nextX >= this.gridSize || nextY < 0 || nextY >= this.gridSize) {
                this.gameOver('Crashing into the wall boundary');
                return;
            }
        }

        // Obstacle Collision
        if (this.obstacles.some(obs => obs.x === nextX && obs.y === nextY)) {
            this.gameOver('Colliding with a laser barrier');
            return;
        }

        // Self Collision
        if (this.snake.some((seg, idx) => idx !== this.snake.length - 1 && seg.x === nextX && seg.y === nextY)) {
            this.gameOver('Self-collision collision');
            return;
        }

        const newHead = { x: nextX, y: nextY };
        this.snake.unshift(newHead);

        // Check Food Collection
        if (this.food && this.food.x === nextX && this.food.y === nextY) {
            this.handleEatFood();
        } else {
            this.snake.pop(); // Standard movement without growing
        }
    }

    handleEatFood() {
        this.applesEaten++;
        const type = this.food.type;
        let basePoints = 10;
        let color = '#00ff66';
        let label = '+10';

        // Combo Step
        this.combo = Math.min(this.combo + 0.5, 5);
        this.maxComboReached = Math.max(this.maxComboReached, this.combo);
        this.comboTimer = this.comboDuration;

        let multiplierBonus = (this.activeBuffs.multiplier > 0) ? 2 : 1;

        if (type === 'golden') {
            basePoints = 50;
            color = '#ffe600';
            label = '+50 GOLDEN!';
            if (window.sound) window.sound.playSpecialEat();
            this.triggerScreenShake(200);
        } else if (type === 'freeze') {
            this.activeBuffs.freeze = 6000;
            color = '#00f0ff';
            label = 'SLOW-MO 6s';
            if (window.sound) window.sound.playFreeze();
        } else if (type === 'multiplier') {
            this.activeBuffs.multiplier = 8000;
            color = '#a855f7';
            label = '2X MULTIPLIER 8s';
            if (window.sound) window.sound.playPowerup();
        } else if (type === 'shrink') {
            const cutCount = Math.min(3, this.snake.length - 3);
            for (let i = 0; i < cutCount; i++) {
                this.snake.pop();
            }
            color = '#ff007f';
            label = 'SHRINK -3';
            if (window.sound) window.sound.playShrink();
        } else {
            if (window.sound) {
                if (this.combo > 1) {
                    window.sound.playCombo(Math.round(this.combo));
                } else {
                    window.sound.playEat();
                }
            }
        }

        const earnedPoints = Math.round(basePoints * this.combo * multiplierBonus);
        this.score += earnedPoints;

        // Visual FX
        const px = (this.food.x + 0.5) * this.tileSize;
        const py = (this.food.y + 0.5) * this.tileSize;
        this.spawnBurst(px, py, color, 18);
        this.spawnFloatingText(px, py - 10, `${label} (${earnedPoints}pts)`, color);

        // Update High Score Check
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('cyber_snake_highscore', this.highScore);
        }

        this.spawnFood();
    }

    triggerScreenShake(duration = 250) {
        if (!this.wrapper) return;
        this.wrapper.classList.add('shake');
        setTimeout(() => this.wrapper.classList.remove('shake'), duration);
    }

    gameOver(reason) {
        this.state = 'GAMEOVER';
        this.playDuration = Math.round((Date.now() - this.gameStartTime) / 1000);
        this.triggerScreenShake(350);

        if (window.sound) window.sound.playCrash();

        const isNewRecord = this.score >= this.highScore && this.score > 0;
        if (isNewRecord) {
            if (window.confetti) window.confetti.fire(3500);
            if (window.sound) setTimeout(() => window.sound.playHighScoreFanfare(), 300);
        }

        // Populate Modal Stats
        document.getElementById('modal-score').textContent = this.score;
        document.getElementById('modal-highscore').textContent = this.highScore;
        document.getElementById('modal-apples').textContent = this.applesEaten;
        document.getElementById('modal-length').textContent = this.snake.length;

        const recordBadge = document.getElementById('new-record-badge');
        if (isNewRecord) {
            recordBadge.style.display = 'inline-flex';
        } else {
            recordBadge.style.display = 'none';
        }

        document.getElementById('gameover-overlay').classList.add('active');
    }

    hideOverlays() {
        document.getElementById('start-overlay').classList.remove('active');
        document.getElementById('pause-overlay').classList.remove('active');
        document.getElementById('gameover-overlay').classList.remove('active');
    }

    // Particle FX Engine
    spawnBurst(x, y, color, count = 16) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 4.5;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 2 + Math.random() * 3,
                color,
                alpha: 1,
                decay: 0.02 + Math.random() * 0.03
            });
        }
    }

    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.95;
            p.vy *= 0.95;
            p.alpha -= p.decay;
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    spawnFloatingText(x, y, text, color) {
        this.floatingTexts.push({
            x,
            y,
            text,
            color,
            alpha: 1,
            vy: -1.2,
            decay: 0.016
        });
    }

    updateFloatingTexts(dt) {
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y += ft.vy;
            ft.alpha -= ft.decay;
            if (ft.alpha <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    // Render Pipeline
    render() {
        const now = performance.now();
        const dt = this.lastFrameTime ? Math.min(now - this.lastFrameTime, 100) : 16;
        this.lastFrameTime = now;

        this.update(dt);

        this.ctx.clearRect(0, 0, this.width, this.height);

        // 1. Draw Grid Lines
        this.drawGrid();

        // 2. Draw Obstacles
        this.drawObstacles();

        // 3. Draw Food Item
        this.drawFood();

        // 4. Draw Snake
        this.drawSnake();

        // 5. Draw Particles
        this.drawParticles();

        // 6. Draw Floating Texts
        this.drawFloatingTexts();

        requestAnimationFrame(() => this.render());
    }

    drawGrid() {
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
        this.ctx.lineWidth = 1;

        for (let i = 0; i <= this.gridSize; i++) {
            const pos = i * this.tileSize;
            this.ctx.beginPath();
            this.ctx.moveTo(pos, 0);
            this.ctx.lineTo(pos, this.height);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(0, pos);
            this.ctx.lineTo(this.width, pos);
            this.ctx.stroke();
        }
        this.ctx.restore();
    }

    drawObstacles() {
        if (this.obstacles.length === 0) return;
        this.ctx.save();
        this.ctx.fillStyle = '#ff0055';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#ff0055';

        for (const obs of this.obstacles) {
            const px = obs.x * this.tileSize + 2;
            const py = obs.y * this.tileSize + 2;
            const size = this.tileSize - 4;

            this.ctx.fillRect(px, py, size, size);
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1.5;
            this.ctx.strokeRect(px + 2, py + 2, size - 4, size - 4);
        }
        this.ctx.restore();
    }

    drawFood() {
        if (!this.food) return;
        const px = this.food.x * this.tileSize + this.tileSize / 2;
        const py = this.food.y * this.tileSize + this.tileSize / 2;
        const radius = (this.tileSize / 2) - 3;

        this.ctx.save();
        const pulse = Math.sin(this.glowPulse * 3) * 2;

        let glowColor = '#00ff66';
        let mainColor = '#00ff66';

        if (this.food.type === 'golden') {
            glowColor = '#ffe600';
            mainColor = '#ffe600';
        } else if (this.food.type === 'freeze') {
            glowColor = '#00f0ff';
            mainColor = '#00f0ff';
        } else if (this.food.type === 'multiplier') {
            glowColor = '#a855f7';
            mainColor = '#a855f7';
        } else if (this.food.type === 'shrink') {
            glowColor = '#ff007f';
            mainColor = '#ff007f';
        }

        this.ctx.shadowBlur = 14 + pulse;
        this.ctx.shadowColor = glowColor;

        // Circular Orb Body
        this.ctx.beginPath();
        this.ctx.arc(px, py, radius + pulse * 0.5, 0, Math.PI * 2);
        this.ctx.fillStyle = mainColor;
        this.ctx.fill();

        // Inner Specular Core
        this.ctx.beginPath();
        this.ctx.arc(px - radius * 0.3, py - radius * 0.3, radius * 0.35, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        this.ctx.fill();

        // Golden food countdown ring
        if (this.food.type === 'golden' && this.food.maxTimer > 0) {
            const progress = this.food.timer / this.food.maxTimer;
            this.ctx.beginPath();
            this.ctx.arc(px, py, radius + 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
            this.ctx.strokeStyle = '#ffe600';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    drawSnake() {
        if (this.snake.length === 0) return;

        this.ctx.save();
        const len = this.snake.length;

        // Draw body segments with smooth gradient
        for (let i = len - 1; i >= 0; i--) {
            const seg = this.snake[i];
            const px = seg.x * this.tileSize;
            const py = seg.y * this.tileSize;
            const radius = (this.tileSize / 2) - 1.5;
            const cx = px + this.tileSize / 2;
            const cy = py + this.tileSize / 2;

            const t = i / len; // 0 at head, 1 at tail
            const isHead = (i === 0);

            if (isHead) {
                // Head Glow
                this.ctx.shadowBlur = 18;
                this.ctx.shadowColor = 'var(--primary)';
                this.ctx.fillStyle = '#00f0ff';
                this.ctx.beginPath();
                this.ctx.arc(cx, cy, radius + 1, 0, Math.PI * 2);
                this.ctx.fill();

                // Eyes that look in direction of movement
                const eyeOffset = radius * 0.45;
                const lookDist = radius * 0.25;

                // Perpendicular vector for eye separation
                const perpX = -this.direction.y;
                const perpY = this.direction.x;

                const eye1X = cx + perpX * eyeOffset + this.direction.x * lookDist;
                const eye1Y = cy + perpY * eyeOffset + this.direction.y * lookDist;
                const eye2X = cx - perpX * eyeOffset + this.direction.x * lookDist;
                const eye2Y = cy - perpY * eyeOffset + this.direction.y * lookDist;

                // Eye whites
                this.ctx.shadowBlur = 0;
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.arc(eye1X, eye1Y, 3, 0, Math.PI * 2);
                this.ctx.arc(eye2X, eye2Y, 3, 0, Math.PI * 2);
                this.ctx.fill();

                // Pupils
                this.ctx.fillStyle = '#090a10';
                this.ctx.beginPath();
                this.ctx.arc(eye1X + this.direction.x * 1, eye1Y + this.direction.y * 1, 1.5, 0, Math.PI * 2);
                this.ctx.arc(eye2X + this.direction.x * 1, eye2Y + this.direction.y * 1, 1.5, 0, Math.PI * 2);
                this.ctx.fill();

            } else {
                // Gradient Body Segments
                const alpha = 1 - t * 0.45;
                this.ctx.shadowBlur = 8;
                this.ctx.shadowColor = 'rgba(0, 240, 255, 0.4)';

                // Interpolate hue from cyan to electric magenta
                this.ctx.fillStyle = `rgba(${Math.round(0 + t * 255)}, ${Math.round(240 - t * 200)}, ${Math.round(255 - t * 100)}, ${alpha})`;
                this.ctx.beginPath();
                this.ctx.arc(cx, cy, Math.max(radius - t * 2, 4), 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        this.ctx.restore();
    }

    drawParticles() {
        this.ctx.save();
        for (const p of this.particles) {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.globalAlpha = Math.max(0, p.alpha);
            this.ctx.fillStyle = p.color;
            this.ctx.shadowBlur = 6;
            this.ctx.shadowColor = p.color;
            this.ctx.fill();
        }
        this.ctx.restore();
    }

    drawFloatingTexts() {
        this.ctx.save();
        this.ctx.font = 'bold 13px "JetBrains Mono", monospace';
        this.ctx.textAlign = 'center';

        for (const ft of this.floatingTexts) {
            this.ctx.globalAlpha = Math.max(0, ft.alpha);
            this.ctx.fillStyle = ft.color;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = ft.color;
            this.ctx.fillText(ft.text, ft.x, ft.y);
        }
        this.ctx.restore();
    }

    updateHUD() {
        // Score & High Score
        document.getElementById('hud-score').textContent = this.score;
        document.getElementById('hud-highscore').textContent = this.highScore;

        // Snake Length & Apples
        document.getElementById('hud-length').textContent = this.snake.length;
        document.getElementById('hud-apples').textContent = this.applesEaten;

        // Combo Multiplier & Meter Fill
        const comboEl = document.getElementById('hud-combo');
        if (comboEl) {
            comboEl.textContent = `x${this.combo.toFixed(1)}`;
        }

        const comboFill = document.getElementById('combo-meter-fill');
        if (comboFill) {
            const fillPct = (this.comboTimer / this.comboDuration) * 100;
            comboFill.style.width = `${Math.max(0, fillPct)}%`;
        }

        // Active Buffs Bar
        const buffsContainer = document.getElementById('active-buffs-bar');
        if (buffsContainer) {
            let html = '';
            if (this.activeBuffs.freeze > 0) {
                const s = (this.activeBuffs.freeze / 1000).toFixed(1);
                html += `<div class="buff-badge freeze">❄️ SLOW-MO ${s}s</div>`;
            }
            if (this.activeBuffs.multiplier > 0) {
                const s = (this.activeBuffs.multiplier / 1000).toFixed(1);
                html += `<div class="buff-badge multiplier">⚡ 2X BOOST ${s}s</div>`;
            }
            buffsContainer.innerHTML = html;
        }

        // Border Glow Effect on Wrapper for Freeze
        if (this.wrapper) {
            if (this.activeBuffs.freeze > 0) {
                this.wrapper.classList.add('freeze-active');
            } else {
                this.wrapper.classList.remove('freeze-active');
            }
        }
    }

    updateMuteButton(isMuted) {
        const btn = document.getElementById('mute-btn');
        if (!btn) return;
        btn.setAttribute('aria-label', isMuted ? 'Unmute Sound' : 'Mute Sound');
        btn.innerHTML = isMuted ? `
            <svg viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
        ` : `
            <svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        `;
    }

    initEventListeners() {
        // Keyboard Controls
        window.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
            this.handleKey(e.code);
        });

        // Touch Swipe Gestures on Canvas
        let touchStartX = 0;
        let touchStartY = 0;
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }
        }, { passive: true });

        this.canvas.addEventListener('touchend', (e) => {
            if (e.changedTouches.length > 0) {
                const dx = e.changedTouches[0].clientX - touchStartX;
                const dy = e.changedTouches[0].clientY - touchStartY;
                const absDx = Math.abs(dx);
                const absDy = Math.abs(dy);

                if (Math.max(absDx, absDy) > 25) {
                    if (absDx > absDy) {
                        this.setDirection(dx > 0 ? 1 : -1, 0);
                    } else {
                        this.setDirection(0, dy > 0 ? 1 : -1);
                    }
                }
            }
        }, { passive: true });

        // Virtual On-Screen Neon D-Pad Buttons
        const bindButton = (id, fn) => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    fn();
                });
            }
        };

        bindButton('dpad-up', () => this.setDirection(0, -1));
        bindButton('dpad-down', () => this.setDirection(0, 1));
        bindButton('dpad-left', () => this.setDirection(-1, 0));
        bindButton('dpad-right', () => this.setDirection(1, 0));

        // Start & Play Again Buttons
        bindButton('start-btn', () => this.reset());
        bindButton('restart-btn', () => this.reset());
        bindButton('resume-btn', () => this.resume());
        bindButton('quick-restart-btn', () => this.reset());
        bindButton('pause-toggle-btn', () => {
            if (this.state === 'PLAYING') this.pause();
            else if (this.state === 'PAUSED') this.resume();
        });

        // Mute Button
        const muteBtn = document.getElementById('mute-btn');
        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                const isMuted = window.sound.toggleMute();
                this.updateMuteButton(isMuted);
            });
        }

        // Mode Pill Selectors
        document.querySelectorAll('.mode-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-pill').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.gameMode = btn.dataset.mode;
                if (window.sound) window.sound.playUiClick();
                this.reset();
            });
        });

        // Difficulty Pill Selectors
        document.querySelectorAll('.diff-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.diff-pill').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.difficulty = btn.dataset.diff;
                if (window.sound) window.sound.playUiClick();
            });
        });

        // Theme Selector
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            const savedTheme = localStorage.getItem('cyber_snake_theme') || 'cyber';
            themeSelect.value = savedTheme;
            document.documentElement.setAttribute('data-theme', savedTheme);

            themeSelect.addEventListener('change', (e) => {
                const chosen = e.target.value;
                document.documentElement.setAttribute('data-theme', chosen);
                localStorage.setItem('cyber_snake_theme', chosen);
                if (window.sound) window.sound.playUiClick();
            });
        }

        // Window resize
        window.addEventListener('resize', () => this.initCanvas());
    }
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
    window.game = new CyberSnakeGame();
});
