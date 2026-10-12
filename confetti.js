// High-performance Canvas Confetti engine
class ConfettiEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationId = null;
        this.isActive = false;
    }

    init(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    trigger(primaryColor = '#00f2fe', secondaryColor = '#ff007f') {
        this.resize();
        this.particles = [];
        this.isActive = true;

        const colors = [
            primaryColor,
            secondaryColor,
            '#ffd700',
            '#a855f7',
            '#38ef7d',
            '#ffffff'
        ];

        const particleCount = 120;
        for (let i = 0; i < particleCount; i++) {
            // Spawn from center and spread outwards
            const angle = Math.random() * Math.PI * 2;
            const speed = 4 + Math.random() * 9;
            this.particles.push({
                x: this.canvas.width * (0.35 + Math.random() * 0.3),
                y: this.canvas.height * (0.35 + Math.random() * 0.3),
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 4,
                size: 6 + Math.random() * 8,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 12,
                wobble: Math.random() * Math.PI,
                wobbleSpeed: 0.05 + Math.random() * 0.08,
                alpha: 1,
                decay: 0.006 + Math.random() * 0.009,
                shape: Math.random() > 0.4 ? 'rect' : 'circle'
            });
        }

        if (!this.animationId) {
            this.loop();
        }
    }

    loop() {
        if (!this.isActive || !this.ctx) {
            this.animationId = null;
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        let activeCount = 0;
        const gravity = 0.22;
        const drag = 0.985;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            if (p.alpha <= 0.01) continue;
            activeCount++;

            p.vx *= drag;
            p.vy *= drag;
            p.vy += gravity;

            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotationSpeed;
            p.wobble += p.wobbleSpeed;
            p.alpha -= p.decay;

            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, p.alpha);
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);

            const scaleX = Math.cos(p.wobble);
            this.ctx.scale(scaleX, 1);

            this.ctx.fillStyle = p.color;
            this.ctx.shadowColor = p.color;
            this.ctx.shadowBlur = 6;

            if (p.shape === 'circle') {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            }

            this.ctx.restore();
        }

        if (activeCount > 0) {
            this.animationId = requestAnimationFrame(() => this.loop());
        } else {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.isActive = false;
            this.animationId = null;
        }
    }

    stop() {
        this.isActive = false;
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}

window.confettiEngine = new ConfettiEngine();
