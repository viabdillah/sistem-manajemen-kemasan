import { useEffect, useRef } from 'react';

// Class Particle (Di luar komponen)
class Particle {
  constructor(x, y, directionX, directionY, size, color) {
    this.x = x;
    this.y = y;
    this.directionX = directionX;
    this.directionY = directionY;
    this.size = size; // Ukuran seragam
    this.color = color;
    this.maxSpeed = 1; // Batasan kecepatan agar tidak terlalu liar
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 5;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Update sekarang menerima parameter mouse kembali
  update(ctx, canvas, mouse) { 
    // Logika Melingkar (Wrapping/Flowing)
    if (this.x > canvas.width) this.x = 0;
    if (this.x < 0) this.x = canvas.width;
    if (this.y > canvas.height) this.y = 0;
    if (this.y < 0) this.y = canvas.height;

    // --- LOGIKA EFEK MAGNET (ATTRACT) ---
    let dx = mouse.x - this.x;
    let dy = mouse.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < mouse.radius) {
        // Normalisasi vektor arah
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;

        // Terapkan Gaya Tarik (Pull Force) ke velocity (direction)
        const pullStrength = 0.08; // Kekuatan tarikan
        this.directionX += forceDirectionX * pullStrength;
        this.directionY += forceDirectionY * pullStrength;
    }
    // ------------------------------------

    // Batasi kecepatan total
    if (Math.abs(this.directionX) > this.maxSpeed) {
        this.directionX = Math.sign(this.directionX) * this.maxSpeed;
    }
    if (Math.abs(this.directionY) > this.maxSpeed) {
        this.directionY = Math.sign(this.directionY) * this.maxSpeed;
    }

    // Gerak Terus Menerus
    this.x += this.directionX;
    this.y += this.directionY;

    this.draw(ctx);
  }
}

const ParticlesAuth = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particlesArray = [];
    const numberOfParticles = 150; 
    
    // Palet Warna Cerah
    const colors = [
      '#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'
    ];
    
    // Objek Mouse (Posisi dan Radius Tarikan)
    let mouse = {
      x: null,
      y: null,
      radius: 150 // Jarak efektif tarikan (pixel)
    }

    // --- REINTRODUKSI EVENT LISTENER MOUSE ---
    const handleMouseMove = (event) => {
      mouse.x = event.x;
      mouse.y = event.y;
    };
    
    const handleMouseOut = () => {
        mouse.x = undefined;
        mouse.y = undefined;
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut); // Untuk menghilangkan efek magnet saat mouse keluar
    window.addEventListener('resize', handleResize);

    function init() {
      particlesArray = [];
      for (let i = 0; i < numberOfParticles; i++) {
        let size = 2; // UKURAN SERAGAM (2px)
        let x = (Math.random() * ((canvas.width - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((canvas.height - size * 2) - (size * 2)) + size * 2);
        
        // Kecepatan gerak awal
        let directionX = (Math.random() * 1) - 0.5; 
        let directionY = (Math.random() * 1) - 0.5; 
        
        let color = colors[Math.floor(Math.random() * colors.length)];

        particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
      }
    }

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particlesArray.length; i++) {
        // Kirim objek mouse ke update
        particlesArray[i].update(ctx, canvas, mouse); 
      }
      connect();
    }

    function connect() {
      let opacityValue = 1;
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x))
            + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
          
          if (distance < (canvas.width/7) * (canvas.height/7)) {
            opacityValue = 1 - (distance/20000);
            ctx.strokeStyle = 'rgba(100, 116, 139, ' + opacityValue * 0.3 + ')'; 
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
    }

    init();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full z-0 bg-white" 
    />
  );
};

export default ParticlesAuth;