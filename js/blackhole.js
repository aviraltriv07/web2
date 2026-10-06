class BlackHoleBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.particles = [];
        this.stars = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;
        
        this.init();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.targetMouseX = (e.clientX - window.innerWidth / 2) * 0.05;
            this.targetMouseY = (e.clientY - window.innerHeight / 2) * 0.05;
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = this.canvas.parentElement.offsetHeight || window.innerHeight;
    }

    init() {
        this.resize();
        // Create accretion disk particles
        for (let i = 0; i < 800; i++) {
            this.particles.push({
                angle: Math.random() * Math.PI * 2,
                radius: Math.random() * 400 + 80, // Distance from center
                speed: (Math.random() * 0.003 + 0.001) * (Math.random() > 0.5 ? 1 : 1),
                size: Math.random() * 2.5 + 0.5,
                hue: Math.floor(Math.random() * 40 + 15), // 15 to 55 (Orange to Yellow)
                alpha: Math.random() * 0.8 + 0.2
            });
        }

        // Create background stars
        for (let i = 0; i < 300; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 1.5,
                speed: Math.random() * 0.15 + 0.05
            });
        }
    }

    animate() {
        // Smooth mouse movement
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

        // Dark fade for motion blur
        this.ctx.fillStyle = 'rgba(3, 7, 18, 0.2)'; 
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const centerX = this.canvas.width / 2 + this.mouseX;
        const centerY = this.canvas.height / 2 + this.mouseY;

        // Draw background stars
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.stars.forEach(star => {
            this.ctx.beginPath();
            this.ctx.arc(star.x + this.mouseX*0.5, star.y + this.mouseY*0.5, star.size, 0, Math.PI * 2);
            this.ctx.fill();
            star.x -= star.speed;
            if (star.x < 0) {
                star.x = this.canvas.width;
                star.y = Math.random() * this.canvas.height;
            }
        });

        const bhRadius = Math.min(this.canvas.width, this.canvas.height) * 0.15; // Responsive radius
        
        // Gravitational Lensing effect (Glow)
        const gradient = this.ctx.createRadialGradient(centerX, centerY, bhRadius * 0.9, centerX, centerY, bhRadius * 4);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(0.1, 'rgba(255, 100, 20, 0.15)');
        gradient.addColorStop(0.4, 'rgba(120, 50, 255, 0.05)');
        gradient.addColorStop(1, 'rgba(3, 7, 18, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, bhRadius * 5, 0, Math.PI * 2);
        this.ctx.fill();

        // The Void (Black Hole)
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, bhRadius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0; // Reset
        
        // Accretion disk
        this.particles.forEach(p => {
            // Speed increases as it gets closer
            const speedMultiplier = Math.max(0.5, (500 / p.radius));
            p.angle -= p.speed * speedMultiplier;
            
            // Warp perspective (ellipse)
            const x = centerX + Math.cos(p.angle) * p.radius;
            // Squish Y and tilt slightly
            const y = centerY + Math.sin(p.angle) * (p.radius * 0.25) - Math.cos(p.angle) * (p.radius * 0.05); 
            
            // Z-sorting simulation: darker when "behind"
            const z = Math.sin(p.angle); 
            
            if (z > -0.2 || p.radius > bhRadius * 1.2) { 
                const opacity = Math.max(0.1, (z + 1) / 2) * p.alpha;
                // Add a glow effect based on speed/closeness
                const intensity = Math.min(100, (bhRadius * 200) / p.radius);
                this.ctx.fillStyle = `hsla(${p.hue}, 100%, ${intensity}%, ${opacity})`;
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, p.size * (opacity + 0.5), 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BlackHoleBackground('spaceCanvas');
});
