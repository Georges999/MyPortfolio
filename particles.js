// Interactive Particles System
class ParticleSystem {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = null;
    this.particleCount = 3000;
    this.particlesData = [];
    this.positions = [];
    this.colors = [];
    this.sizes = [];
    this.currentShape = 'sphere';
    this.container = document.getElementById('particles-canvas');
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.colorPalettes = [
      { base: new THREE.Color(0x6c63ff), accent: new THREE.Color(0xf50057) }, // Purple & Pink
      { base: new THREE.Color(0x00bcd4), accent: new THREE.Color(0x4caf50) }, // Cyan & Green
      { base: new THREE.Color(0xff9800), accent: new THREE.Color(0xff5722) }, // Orange & Deep Orange
      { base: new THREE.Color(0x2196f3), accent: new THREE.Color(0x3f51b5) }  // Blue & Indigo
    ];
    this.currentPalette = 0;
    this.maxTransformTime = 3.0; // Time to complete a shape transformation
    this.transformTime = 0;
    this.transforming = false;
    this.targetPositions = [];
    this.startPositions = [];
    
    // Initialize only if container exists
    if (this.container) {
      this.init();
      this.setupEventListeners();
    }
  }
  
  init() {
    // Create scene
    this.scene = new THREE.Scene();
    
    // Add camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 30;
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 0);
    this.container.appendChild(this.renderer.domElement);
    
    // Create the particle system
    this.createParticles();
    
    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
    
    // Mouse move interaction
    window.addEventListener('mousemove', (event) => this.onMouseMove(event));
    
    // Start animation loop
    this.animate();
  }
  
  createParticles() {
    // Particle geometry
    const geometry = new THREE.BufferGeometry();
    
    // Create positions, colors and sizes for particles
    this.positions = new Float32Array(this.particleCount * 3);
    this.colors = new Float32Array(this.particleCount * 3);
    this.sizes = new Float32Array(this.particleCount);
    
    const color = this.colorPalettes[this.currentPalette].base;
    const accentColor = this.colorPalettes[this.currentPalette].accent;
    
    for (let i = 0; i < this.particleCount; i++) {
      // Initial shape - sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 10 + Math.random() * 5;
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      const i3 = i * 3;
      this.positions[i3] = x;
      this.positions[i3 + 1] = y;
      this.positions[i3 + 2] = z;
      
      // Store initial particle data
      this.particlesData.push({
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05
        ),
        originalX: x,
        originalY: y,
        originalZ: z
      });
      
      // Random color between base and accent
      const mixFactor = Math.random();
      const particleColor = new THREE.Color().lerpColors(color, accentColor, mixFactor);
      
      this.colors[i3] = particleColor.r;
      this.colors[i3 + 1] = particleColor.g;
      this.colors[i3 + 2] = particleColor.b;
      
      // Random size
      this.sizes[i] = Math.random() * 3 + 1;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
    
    // Material for particles
    const material = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });
    
    // Create the particle system
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }
  
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  onMouseMove(event) {
    // Convert mouse position to normalized device coordinates
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  }
  
  setupEventListeners() {
    // Shape morphing controls
    document.getElementById('shape-sphere').addEventListener('click', () => {
      this.transformToShape('sphere');
    });
    
    document.getElementById('shape-cube').addEventListener('click', () => {
      this.transformToShape('cube');
    });
    
    document.getElementById('shape-helix').addEventListener('click', () => {
      this.transformToShape('helix');
    });
    
    document.getElementById('change-colors').addEventListener('click', () => {
      this.changeColors();
    });
    
    // Dark mode listener
    const themeSwitch = document.querySelector('.theme-switch');
    if (themeSwitch) {
      themeSwitch.addEventListener('click', () => {
        setTimeout(() => {
          this.updateParticleColors();
        }, 100);
      });
    }
  }
  
  calculateTargetPositions(shape) {
    const targetPositions = new Float32Array(this.particleCount * 3);
    
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      
      // Store current position as start position
      this.startPositions[i3] = this.positions[i3];
      this.startPositions[i3 + 1] = this.positions[i3 + 1];
      this.startPositions[i3 + 2] = this.positions[i3 + 2];
      
      // Calculate target position based on shape
      if (shape === 'sphere') {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 12 + Math.random() * 3;
        
        targetPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        targetPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        targetPositions[i3 + 2] = radius * Math.cos(phi);
      } 
      else if (shape === 'cube') {
        // Cube
        targetPositions[i3] = (Math.random() - 0.5) * 20;
        targetPositions[i3 + 1] = (Math.random() - 0.5) * 20;
        targetPositions[i3 + 2] = (Math.random() - 0.5) * 20;
        
        // Project to cube surface
        const maxVal = Math.max(
          Math.abs(targetPositions[i3]),
          Math.abs(targetPositions[i3 + 1]),
          Math.abs(targetPositions[i3 + 2])
        );
        
        if (Math.random() > 0.5) {
          const axis = Math.floor(Math.random() * 3);
          const sign = Math.random() > 0.5 ? 1 : -1;
          
          if (axis === 0) {
            targetPositions[i3] = 10 * sign;
          } else if (axis === 1) {
            targetPositions[i3 + 1] = 10 * sign;
          } else {
            targetPositions[i3 + 2] = 10 * sign;
          }
        }
      } 
      else if (shape === 'helix') {
        // Helix
        const angle = i / this.particleCount * Math.PI * 15;
        const radius = 10;
        const y = (i / this.particleCount * 30) - 15;
        
        targetPositions[i3] = radius * Math.cos(angle);
        targetPositions[i3 + 1] = y;
        targetPositions[i3 + 2] = radius * Math.sin(angle);
      }
    }
    
    return targetPositions;
  }
  
  transformToShape(shape) {
    if (this.transforming) return;
    
    this.currentShape = shape;
    this.targetPositions = this.calculateTargetPositions(shape);
    this.transforming = true;
    this.transformTime = 0;
  }
  
  changeColors() {
    this.currentPalette = (this.currentPalette + 1) % this.colorPalettes.length;
    this.updateParticleColors();
  }
  
  updateParticleColors() {
    const color = this.colorPalettes[this.currentPalette].base;
    const accentColor = this.colorPalettes[this.currentPalette].accent;
    
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      
      // Random mix between base and accent colors
      const mixFactor = Math.random();
      const particleColor = new THREE.Color().lerpColors(color, accentColor, mixFactor);
      
      this.colors[i3] = particleColor.r;
      this.colors[i3 + 1] = particleColor.g;
      this.colors[i3 + 2] = particleColor.b;
    }
    
    this.particles.geometry.attributes.color.needsUpdate = true;
  }
  
  updateParticles(deltaTime) {
    if (this.transforming) {
      // Update transform time
      this.transformTime += deltaTime;
      
      if (this.transformTime >= this.maxTransformTime) {
        this.transforming = false;
        this.transformTime = this.maxTransformTime;
      }
      
      // Calculate progress (with easing)
      const progress = this.easeInOutCubic(this.transformTime / this.maxTransformTime);
      
      // Update positions based on progress
      for (let i = 0; i < this.particleCount; i++) {
        const i3 = i * 3;
        
        this.positions[i3] = this.startPositions[i3] + (this.targetPositions[i3] - this.startPositions[i3]) * progress;
        this.positions[i3 + 1] = this.startPositions[i3 + 1] + (this.targetPositions[i3 + 1] - this.startPositions[i3 + 1]) * progress;
        this.positions[i3 + 2] = this.startPositions[i3 + 2] + (this.targetPositions[i3 + 2] - this.startPositions[i3 + 2]) * progress;
      }
    } else {
      // Add subtle animation to particles
      for (let i = 0; i < this.particleCount; i++) {
        const i3 = i * 3;
        const particleData = this.particlesData[i];
        
        // Apply velocity with damping
        this.positions[i3] += particleData.velocity.x * deltaTime * 2;
        this.positions[i3 + 1] += particleData.velocity.y * deltaTime * 2;
        this.positions[i3 + 2] += particleData.velocity.z * deltaTime * 2;
        
        // Return to original position with spring effect
        const dx = this.positions[i3] - particleData.originalX;
        const dy = this.positions[i3 + 1] - particleData.originalY;
        const dz = this.positions[i3 + 2] - particleData.originalZ;
        
        particleData.velocity.x -= dx * 0.01 * deltaTime;
        particleData.velocity.y -= dy * 0.01 * deltaTime;
        particleData.velocity.z -= dz * 0.01 * deltaTime;
        
        // Apply damping
        particleData.velocity.x *= 0.99;
        particleData.velocity.y *= 0.99;
        particleData.velocity.z *= 0.99;
      }
    }
    
    // React to mouse movement
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.particles);
    
    if (intersects.length > 0) {
      const interaction = new THREE.Vector3().copy(this.raycaster.ray.direction).multiplyScalar(20);
      
      // Push particles away from mouse
      for (let i = 0; i < this.particleCount; i++) {
        const i3 = i * 3;
        const particlePos = new THREE.Vector3(this.positions[i3], this.positions[i3 + 1], this.positions[i3 + 2]);
        const distance = particlePos.distanceTo(this.camera.position.clone().add(interaction)) - 5;
        
        if (distance < 5) {
          const force = Math.max(0, (5 - distance) / 5);
          this.particlesData[i].velocity.x += force * 0.5 * (Math.random() - 0.5);
          this.particlesData[i].velocity.y += force * 0.5 * (Math.random() - 0.5);
          this.particlesData[i].velocity.z += force * 0.5 * (Math.random() - 0.5);
        }
      }
    }
    
    // Update the geometry
    this.particles.geometry.attributes.position.needsUpdate = true;
  }
  
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    const deltaTime = Math.min(0.1, this.clock.getDelta());
    
    // Update particles
    this.updateParticles(deltaTime);
    
    // Rotate the entire particle system for extra effect
    this.particles.rotation.y += 0.001;
    
    // Render
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('load', () => {
    // Initialize the particle system
    const particleSystem = new ParticleSystem();
  });
}); 