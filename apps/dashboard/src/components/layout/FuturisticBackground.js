"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FuturisticBackground = FuturisticBackground;
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
function FuturisticBackground() {
    const canvasRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        // Particle system
        class Particle {
            x;
            y;
            vx;
            vy;
            radius;
            color;
            opacity;
            width;
            height;
            ctx;
            constructor(width, height, context) {
                this.width = width;
                this.height = height;
                this.ctx = context;
                this.x = Math.random() * this.width;
                this.y = Math.random() * this.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = Math.random() * 2 + 0.5;
                const colors = ['#DC2626', '#F59E0B', '#059669', '#3B82F6', '#8B5CF6'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.opacity = Math.random() * 0.5 + 0.1;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                // Wrap around edges
                if (this.x < 0)
                    this.x = this.width;
                if (this.x > this.width)
                    this.x = 0;
                if (this.y < 0)
                    this.y = this.height;
                if (this.y > this.height)
                    this.y = 0;
                // Subtle opacity pulsing
                this.opacity += (Math.random() - 0.5) * 0.01;
                this.opacity = Math.max(0.05, Math.min(0.6, this.opacity));
            }
            draw() {
                this.ctx.save();
                this.ctx.globalAlpha = this.opacity;
                this.ctx.fillStyle = this.color;
                this.ctx.shadowColor = this.color;
                this.ctx.shadowBlur = 10;
                this.ctx.beginPath();
                this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
        }
        // Create particles
        const particles = [];
        const particleCount = Math.min(100, Math.floor((canvas.width * canvas.height) / 10000));
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(canvas.width, canvas.height, ctx));
        }
        // Animation loop
        let animationId;
        const animate = () => {
            // Clear canvas with subtle fade effect
            ctx.fillStyle = 'rgba(12, 12, 15, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Update and draw particles
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            // Draw connections between nearby particles
            particles.forEach((particle, i) => {
                particles.slice(i + 1).forEach(otherParticle => {
                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 120) {
                        ctx.save();
                        ctx.globalAlpha = (120 - distance) / 120 * 0.1;
                        ctx.strokeStyle = '#ffffff';
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.stroke();
                        ctx.restore();
                    }
                });
            });
            animationId = requestAnimationFrame(animate);
        };
        animate();
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationId);
        };
    }, []);
    return (<>
      {/* Animated particle canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" style={{ background: 'transparent' }}/>
      
      {/* Gradient overlays for depth */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Primary gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800/80 to-dark-700/60"/>
        
        {/* Radial highlights */}
        <framer_motion_1.motion.div animate={{
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.2, 1]
        }} transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
        }} className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"/>
        
        <framer_motion_1.motion.div animate={{
            opacity: [0.1, 0.25, 0.1],
            scale: [1.2, 1, 1.2]
        }} transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
        }} className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl"/>
        
        <framer_motion_1.motion.div animate={{
            opacity: [0.05, 0.2, 0.05],
            scale: [1, 1.5, 1]
        }} transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
        }} className="absolute top-2/3 left-1/2 w-72 h-72 bg-accent-500/8 rounded-full blur-3xl"/>
      </div>
      
      {/* Subtle grid pattern overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]">
        <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px'
        }}/>
      </div>
      
      {/* Vignette effect */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="w-full h-full" style={{
            background: `radial-gradient(ellipse at center, transparent 0%, rgba(12,12,15,0.4) 100%)`
        }}/>
      </div>
    </>);
}
//# sourceMappingURL=FuturisticBackground.js.map