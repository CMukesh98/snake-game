/**
 * Cyber Snake 2077 - High-Performance Canvas Confetti System
 */
class ConfettiCannon {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationId = null;
        this.init();
    }

    init() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'confetti-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100vw';
        this.canvas.style.height = '100vh';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';
        this.canvas.style.display = 'none';
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    fire(durationMs = 3000) {
        if (!this.canvas) return;
        this.resize();
        this.canvas.style.display = 'block';

        const colors = [
            '#00f0ff', '#ff007f', '#ffe600', '#00ff66', '#a855f7', '#ffffff'
        ];

        const particleCount = 120;
        this.particles = [];

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI / 2) + (Math.random() - 0.5) * 1.6;
            const speed = 7 + Math.random() * 12;
            this.particles.push({
                x: window.innerWidth * (0.2 + Math.random() * 0.6),
                y: window.innerHeight * 0.7,
                vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
                vy: -Math.abs(Math.sin(angle)) * speed - 4,
                w: 6 + Math.random() * 8,
                h: 8 + Math.random() * 10,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 12,
                opacity: 1,
                decay: 0.006 + Math.random() * 0.008,
                gravity: 0.35 + Math.random() * 0.2
            });
        }

        if (this.animationId) cancelAnimationFrame(this.animationId);
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            let activeCount = 0;
            for (let p of this.particles) {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity;
                p.vx *= 0.98;
                p.rotation += p.rotationSpeed;
                p.opacity -= p.decay;

                if (p.opacity > 0 && p.y < this.canvas.height + 50) {
                    activeCount++;
                    this.ctx.save();
                    this.ctx.translate(p.x, p.y);
                    this.ctx.rotate((p.rotation * Math.PI) / 180);
                    this.ctx.globalAlpha = Math.max(0, p.opacity);
                    this.ctx.fillStyle = p.color;
                    this.ctx.shadowBlur = 8;
                    this.ctx.shadowColor = p.color;
                    this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                    this.ctx.restore();
                }
            }

            if (activeCount > 0 && elapsed < durationMs) {
                this.animationId = requestAnimationFrame(animate);
            } else {
                this.stop();
            }
        };

        this.animationId = requestAnimationFrame(animate);
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.canvas) {
            this.canvas.style.display = 'none';
            if (this.ctx) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }
        this.particles = [];
    }
}

window.confetti = new ConfettiCannon();
