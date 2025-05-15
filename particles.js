// Enhanced Particles System
class ParticleSystem {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = null;
    this.particleCount = 2000;
    this.positions = [];
    this.colors = [];
    this.sizes = [];
    this.currentShape = 'wave'; // Default shape is wave
    this.container = document.getElementById('particles-canvas');
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.colorPalettes = [
      { base: new THREE.Color(0x6c63ff), accent: new THREE.Color(0xf50057) }, // Purple & Pink - Primary theme color
      { base: new THREE.Color(0x00bcd4), accent: new THREE.Color(0x4caf50) }, // Cyan & Green
      { base: new THREE.Color(0xff9800), accent: new THREE.Color(0xff5722) }, // Orange & Deep Orange
      { base: new THREE.Color(0x2196f3), accent: new THREE.Color(0x3f51b5) }, // Blue & Indigo
    ];
    this.currentPalette = 0; // Using the default primary color palette
    this.maxTransformTime = 2.0; // Time to complete a shape transformation
    this.transformTime = 0;
    this.transforming = false;
    this.targetPositions = null;
    this.startPositions = null;
    this.velocities = [];
    this.yOffset = 6; // Positive offset to position shapes higher
    this.scale = 1.1; // Increased scale factor to make shapes even larger
    
    // Mouse rotation control
    this.isMouseDown = false;
    this.rotationSpeed = 0.5;
    this.targetRotationX = 0;
    this.targetRotationY = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    
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
    
    // Start animation loop
    this.animate();
    
    // Initialize with wave shape
    setTimeout(() => {
      this.transformToShape('wave');
    }, 100);
  }
  
  createParticles() {
    // Particle geometry
    const geometry = new THREE.BufferGeometry();
    
    // Arrays to store particle data
    this.positions = new Float32Array(this.particleCount * 3);
    this.colors = new Float32Array(this.particleCount * 3);
    this.sizes = new Float32Array(this.particleCount);
    this.startPositions = new Float32Array(this.particleCount * 3);
    this.targetPositions = new Float32Array(this.particleCount * 3);
    this.velocities = new Float32Array(this.particleCount * 3);
    
    const color = this.colorPalettes[this.currentPalette].base;
    const accentColor = this.colorPalettes[this.currentPalette].accent;
    
    // Initial positions - spread out randomly before transforming to wave
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      
      // Random initial position
      this.positions[i3] = (Math.random() - 0.5) * 30;
      this.positions[i3 + 1] = (Math.random() - 0.5) * 30 + this.yOffset;
      this.positions[i3 + 2] = (Math.random() - 0.5) * 30;
      
      // Random color between base and accent
      const mixFactor = Math.random();
      const particleColor = new THREE.Color().lerpColors(color, accentColor, mixFactor);
      
      this.colors[i3] = particleColor.r;
      this.colors[i3 + 1] = particleColor.g;
      this.colors[i3 + 2] = particleColor.b;
      
      // Random size - slightly larger particles
      this.sizes[i] = Math.random() * 2.0 + 0.5;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
    
    // Enhanced particle material
    const material = new THREE.PointsMaterial({
      size: 1.0, // Larger default size
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
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
  
  setupEventListeners() {
    // Shape morphing controls
    document.getElementById('shape-sphere').addEventListener('click', () => {
      this.transformToShape('constellation');
    });
    
    document.getElementById('shape-cube').addEventListener('click', () => {
      this.transformToShape('wave');
    });
    
    document.getElementById('shape-helix').addEventListener('click', () => {
      this.transformToShape('helix');
    });
    
    // Add listener for the new shape
    const ribbonButton = document.getElementById('shape-ribbon');
    if (ribbonButton) {
      ribbonButton.addEventListener('click', () => {
        this.transformToShape('ribbon');
      });
    }
    
    // Dark mode listener
    const themeSwitch = document.querySelector('.theme-switch');
    if (themeSwitch) {
      themeSwitch.addEventListener('click', () => {
        setTimeout(() => {
          this.updateParticleColors();
        }, 100);
      });
    }
    
    // Mouse interaction for rotation
    this.container.addEventListener('mousedown', (event) => this.onMouseDown(event));
    document.addEventListener('mousemove', (event) => this.onMouseMove(event));
    document.addEventListener('mouseup', () => this.onMouseUp());
    
    // Touch events for mobile
    this.container.addEventListener('touchstart', (event) => this.onTouchStart(event));
    document.addEventListener('touchmove', (event) => this.onTouchMove(event));
    document.addEventListener('touchend', () => this.onTouchEnd());
  }
  
  // Mouse and touch event handlers
  onMouseDown(event) {
    event.preventDefault();
    this.isMouseDown = true;
    
    const rect = this.container.getBoundingClientRect();
    this.mouseX = event.clientX - rect.left;
    this.mouseY = event.clientY - rect.top;
    this.lastMouseX = this.mouseX;
    this.lastMouseY = this.mouseY;
    
    // Change cursor to indicate dragging
    document.body.style.cursor = 'grabbing';
    this.container.style.cursor = 'grabbing';
  }
  
  onMouseMove(event) {
    if (!this.isMouseDown) return;
    
    const rect = this.container.getBoundingClientRect();
    this.mouseX = event.clientX - rect.left;
    this.mouseY = event.clientY - rect.top;
    
    // Calculate rotation delta
    const deltaX = this.mouseX - this.lastMouseX;
    const deltaY = this.mouseY - this.lastMouseY;
    
    this.lastMouseX = this.mouseX;
    this.lastMouseY = this.mouseY;
    
    // Apply rotation based on mouse movement
    this.targetRotationY += deltaX * 0.01 * this.rotationSpeed;
    this.targetRotationX += deltaY * 0.01 * this.rotationSpeed;
    
    // Limit vertical rotation to avoid flipping
    this.targetRotationX = Math.max(Math.min(this.targetRotationX, Math.PI / 2), -Math.PI / 2);
  }
  
  onMouseUp() {
    this.isMouseDown = false;
    document.body.style.cursor = 'default';
    this.container.style.cursor = 'grab';
  }
  
  // Touch event handlers
  onTouchStart(event) {
    if (event.touches.length === 1) {
      event.preventDefault();
      this.isMouseDown = true;
      
      const rect = this.container.getBoundingClientRect();
      this.mouseX = event.touches[0].clientX - rect.left;
      this.mouseY = event.touches[0].clientY - rect.top;
      this.lastMouseX = this.mouseX;
      this.lastMouseY = this.mouseY;
    }
  }
  
  onTouchMove(event) {
    if (this.isMouseDown && event.touches.length === 1) {
      event.preventDefault();
      
      const rect = this.container.getBoundingClientRect();
      this.mouseX = event.touches[0].clientX - rect.left;
      this.mouseY = event.touches[0].clientY - rect.top;
      
      // Calculate rotation delta
      const deltaX = this.mouseX - this.lastMouseX;
      const deltaY = this.mouseY - this.lastMouseY;
      
      this.lastMouseX = this.mouseX;
      this.lastMouseY = this.mouseY;
      
      // Apply rotation based on touch movement
      this.targetRotationY += deltaX * 0.01 * this.rotationSpeed;
      this.targetRotationX += deltaY * 0.01 * this.rotationSpeed;
      
      // Limit vertical rotation to avoid flipping
      this.targetRotationX = Math.max(Math.min(this.targetRotationX, Math.PI / 2), -Math.PI / 2);
    }
  }
  
  onTouchEnd() {
    this.isMouseDown = false;
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
      if (shape === 'ribbon') {
        // Smooth flowing ribbon shape - Möbius strip inspired shape
        const t = i / this.particleCount;
        const ribbonWidth = 10 * this.scale;
        const ribbonHeight = 6 * this.scale;
        const twists = 1; // Number of twists in the ribbon
        
        // Main ribbon path - follows a figure 8 / infinity pattern
        const u = t * Math.PI * 2;
        const majorRadius = ribbonWidth * 0.8;
        const minorRadius = ribbonHeight * 0.5;
        
        // Create figure-8 base path
        const figure8X = Math.sin(u) * majorRadius;
        const figure8Y = Math.sin(u * 2) * minorRadius;
        const figure8Z = Math.cos(u) * majorRadius * 0.5;
        
        // Add width to the ribbon
        const ribbonThickness = 0.1;
        const ribbonOffset = (Math.random() - 0.5) * ribbonWidth * ribbonThickness;
        
        // Calculate the cross-section of the ribbon
        // This creates the width/thickness of the ribbon
        const crossSection = Math.random();
        const sectionWidth = ribbonWidth * 0.2;
        
        // Create the twist effect as the ribbon progresses
        const twistAmount = u * twists;
        const twistX = Math.cos(twistAmount) * ribbonOffset * crossSection;
        const twistZ = Math.sin(twistAmount) * ribbonOffset * crossSection;
        
        // Apply a smooth flowing ribbon shape with some randomness
        targetPositions[i3] = figure8X + twistX;
        targetPositions[i3 + 1] = figure8Y + this.yOffset;
        targetPositions[i3 + 2] = figure8Z + twistZ;
        
        // Vary particle size based on position on the ribbon
        this.sizes[i] = Math.random() * 1.5 + 0.5;
      }
      else if (shape === 'constellation') {
        // Create an artistic constellation pattern
        // Divide particles into stars and connecting lines
        if (i < this.particleCount * 0.15) {
          // Main constellation stars (15% of particles)
          // Create clusters of stars in 3D space
          
          // Determine which cluster this star belongs to
          const clusterCount = 7; // Number of main star clusters
          const clusterId = Math.floor(i / (this.particleCount * 0.15) * clusterCount);
          
          // Each cluster has a base position
          const clusterCenters = [
            { x: 6, y: 3, z: 3 },
            { x: -7, y: 5, z: -1 },
            { x: 2, y: -4, z: 5 },
            { x: -4, y: -6, z: -2 },
            { x: 8, y: 7, z: -4 },
            { x: -5, y: 8, z: 4 },
            { x: 0, y: -2, z: -6 }
          ];
          
          // Position stars around their cluster center with some randomness
          const center = clusterCenters[clusterId];
          const clusterRadius = 2.5 * this.scale;
          
          targetPositions[i3] = center.x * this.scale + (Math.random() - 0.5) * clusterRadius;
          targetPositions[i3 + 1] = center.y * this.scale + (Math.random() - 0.5) * clusterRadius + this.yOffset;
          targetPositions[i3 + 2] = center.z * this.scale + (Math.random() - 0.5) * clusterRadius;
          
          // These are larger "stars"
          this.sizes[i] = Math.random() * 2.5 + 1.5;
        } 
        else if (i < this.particleCount * 0.5) {
          // Connecting lines and dust between stars (35% of particles)
          // Create lines that connect the main constellation stars
          
          // Pick two random cluster centers to connect
          const clusterCount = 7;
          const cluster1 = Math.floor(Math.random() * clusterCount);
          let cluster2 = Math.floor(Math.random() * clusterCount);
          while (cluster2 === cluster1) {
            cluster2 = Math.floor(Math.random() * clusterCount);
          }
          
          const clusterCenters = [
            { x: 6, y: 3, z: 3 },
            { x: -7, y: 5, z: -1 },
            { x: 2, y: -4, z: 5 },
            { x: -4, y: -6, z: -2 },
            { x: 8, y: 7, z: -4 },
            { x: -5, y: 8, z: 4 },
            { x: 0, y: -2, z: -6 }
          ];
          
          const from = clusterCenters[cluster1];
          const to = clusterCenters[cluster2];
          
          // Position along the line with some noise
          const t = Math.random();
          const noiseAmount = 1.0 * this.scale;
          
          targetPositions[i3] = (from.x + (to.x - from.x) * t) * this.scale + (Math.random() - 0.5) * noiseAmount;
          targetPositions[i3 + 1] = (from.y + (to.y - from.y) * t) * this.scale + (Math.random() - 0.5) * noiseAmount + this.yOffset;
          targetPositions[i3 + 2] = (from.z + (to.z - from.z) * t) * this.scale + (Math.random() - 0.5) * noiseAmount;
          
          // These are smaller "dust" particles
          this.sizes[i] = Math.random() * 0.8 + 0.2;
        } 
        else {
          // Background stars (50% of particles) - create a cosmic feel
          // Distributed spherically but with more interesting patterns
          
          // Spiral galaxy-like distribution
          const arm = Math.floor(Math.random() * 3); // 3 spiral arms
          const armAngle = arm * (Math.PI * 2 / 3);
          const distFromCenter = Math.random() * 12 * this.scale;
          const spiralTightness = 0.3;
          
          const spiralAngle = distFromCenter * spiralTightness + armAngle;
          let x = Math.cos(spiralAngle) * distFromCenter;
          let z = Math.sin(spiralAngle) * distFromCenter;
          
          // Add some vertical dimension
          const y = (Math.random() - 0.5) * 6 * this.scale;
          
          // Flatten the spiral slightly
          if (Math.random() > 0.2) {
            const flattenAmount = 0.8;
            x *= flattenAmount;
            z *= flattenAmount;
          }
          
          targetPositions[i3] = x;
          targetPositions[i3 + 1] = y + this.yOffset;
          targetPositions[i3 + 2] = z;
          
          // Varied sizes for background stars
          this.sizes[i] = Math.random() * 1.0 + 0.3;
        }
      } 
      else if (shape === 'wave') {
        // Wave shape - fluid, aesthetic design
        const u = Math.random();
        const v = Math.random();
        
        const amplitude = 3 * this.scale;
        const frequency = 3;
        const phaseShift = Math.PI / 2;
        
        const x = (u * 2 - 1) * 10 * this.scale;
        const z = (v * 2 - 1) * 10 * this.scale;
        
        // Create a wave pattern along the x-z plane
        const y = amplitude * Math.sin(frequency * x + phaseShift) * 
                 Math.cos(frequency * z) + this.yOffset;
        
        targetPositions[i3] = x;
        targetPositions[i3 + 1] = y;
        targetPositions[i3 + 2] = z;
      } 
      else if (shape === 'helix') {
        // Enhanced helix
        const angle = i / this.particleCount * Math.PI * 8;
        const radius = 7 * this.scale;
        const y = (i / this.particleCount * 20 - 10) * this.scale + this.yOffset;
        
        targetPositions[i3] = radius * Math.cos(angle);
        targetPositions[i3 + 1] = y;
        targetPositions[i3 + 2] = radius * Math.sin(angle);
      }
    }
    
    // Update size attribute
    this.particles.geometry.attributes.size.needsUpdate = true;
    
    return targetPositions;
  }
  
  transformToShape(shape) {
    if (this.transforming) return;
    
    this.currentShape = shape;
    this.targetPositions = this.calculateTargetPositions(shape);
    this.transforming = true;
    this.transformTime = 0;
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
      
      // Calculate progress (with improved easing for smoother transitions)
      const progress = this.easeInOutQuint(this.transformTime / this.maxTransformTime);
      
      // Update positions based on progress
      for (let i = 0; i < this.particleCount; i++) {
        const i3 = i * 3;
        
        this.positions[i3] = this.startPositions[i3] + (this.targetPositions[i3] - this.startPositions[i3]) * progress;
        this.positions[i3 + 1] = this.startPositions[i3 + 1] + (this.targetPositions[i3 + 1] - this.startPositions[i3 + 1]) * progress;
        this.positions[i3 + 2] = this.startPositions[i3 + 2] + (this.targetPositions[i3 + 2] - this.startPositions[i3 + 2]) * progress;
      }
    } else {
      // Animation for shapes
      const shape = this.currentShape;
      
      if (shape === 'helix') {
        // Gentle animation without rotation
        for (let i = 0; i < this.particleCount; i++) {
          const i3 = i * 3;
          
          // Small oscillation based on position
          const time = this.clock.getElapsedTime();
          const factor = Math.sin(time * 0.5 + this.positions[i3] * 0.1) * 0.05;
          
          // Add subtle movement
          this.positions[i3] += (Math.random() - 0.5) * 0.01;
          this.positions[i3 + 1] += factor + (Math.random() - 0.5) * 0.01;
          this.positions[i3 + 2] += (Math.random() - 0.5) * 0.01;
          
          // Pull back to original position to maintain shape
          const dx = this.positions[i3] - this.targetPositions[i3];
          const dy = this.positions[i3 + 1] - this.targetPositions[i3 + 1];
          const dz = this.positions[i3 + 2] - this.targetPositions[i3 + 2];
          
          this.positions[i3] -= dx * 0.03;
          this.positions[i3 + 1] -= dy * 0.03;
          this.positions[i3 + 2] -= dz * 0.03;
        }
      } else if (shape === 'ribbon') {
        // Flowing ribbon animation
        const time = this.clock.getElapsedTime();
        
        for (let i = 0; i < this.particleCount; i++) {
          const i3 = i * 3;
          
          // Get base position and add flowing movement
          const x = this.targetPositions[i3];
          const y = this.targetPositions[i3 + 1];
          const z = this.targetPositions[i3 + 2];
          
          // Calculate flow offsets
          const flowOffsetX = Math.sin(time * 0.5 + i * 0.01) * 0.05;
          const flowOffsetY = Math.cos(time * 0.4 + i * 0.01) * 0.05;
          const flowOffsetZ = Math.sin(time * 0.3 + i * 0.01) * 0.05;
          
          // Apply flowing movement
          this.positions[i3] = x + flowOffsetX;
          this.positions[i3 + 1] = y + flowOffsetY;
          this.positions[i3 + 2] = z + flowOffsetZ;
          
          // Gently pull back to maintain overall shape
          const pullStrength = 0.01;
          const dx = this.positions[i3] - this.targetPositions[i3];
          const dy = this.positions[i3 + 1] - this.targetPositions[i3 + 1];
          const dz = this.positions[i3 + 2] - this.targetPositions[i3 + 2];
          
          this.positions[i3] -= dx * pullStrength;
          this.positions[i3 + 1] -= dy * pullStrength;
          this.positions[i3 + 2] -= dz * pullStrength;
          
          // Subtle size pulsation for flowing effect
          const sizePulse = Math.sin(time + i * 0.1) * 0.2 + 1.0;
          this.sizes[i] = (Math.random() * 0.5 + 0.5) * sizePulse;
        }
        
        // Update sizes
        this.particles.geometry.attributes.size.needsUpdate = true;
      } else if (shape === 'constellation') {
        // Animated constellation
        const time = this.clock.getElapsedTime();
        
        for (let i = 0; i < this.particleCount; i++) {
          const i3 = i * 3;
          
          if (i < this.particleCount * 0.15) {
            // Main stars: subtle pulsing effect
            const pulseFactor = Math.sin(time + i * 0.1) * 0.05 + 1.0;
            
            // Small random movement
            this.positions[i3] += (Math.random() - 0.5) * 0.01;
            this.positions[i3 + 1] += (Math.random() - 0.5) * 0.01;
            this.positions[i3 + 2] += (Math.random() - 0.5) * 0.01;
            
            // Pulsing size effect
            this.sizes[i] = (Math.random() * 1.5 + 1.5) * pulseFactor;
          } 
          else if (i < this.particleCount * 0.5) {
            // Connecting lines: gentle flowing motion
            const flowSpeed = 0.3;
            const flowAmount = 0.1;
            
            this.positions[i3] += Math.sin(time * flowSpeed + i * 0.1) * flowAmount * 0.01;
            this.positions[i3 + 1] += Math.cos(time * flowSpeed + i * 0.2) * flowAmount * 0.01;
            this.positions[i3 + 2] += Math.sin(time * flowSpeed + i * 0.3) * flowAmount * 0.01;
          } 
          else {
            // Background stars: subtle twinkling and slow rotation
            const twinkle = Math.sin(time * 2 + i) * 0.3 + 0.7;
            this.sizes[i] = (Math.random() * 0.5 + 0.3) * twinkle;
            
            // Very slow rotation around y-axis
            const angle = deltaTime * 0.05;
            const x = this.positions[i3];
            const z = this.positions[i3 + 2];
            
            this.positions[i3] = x * Math.cos(angle) - z * Math.sin(angle);
            this.positions[i3 + 2] = x * Math.sin(angle) + z * Math.cos(angle);
          }
        }
        
        // Update size attribute for twinkling effect
        this.particles.geometry.attributes.size.needsUpdate = true;
      } else if (shape === 'wave') {
        // Animated wave
        const time = this.clock.getElapsedTime();
        
        for (let i = 0; i < this.particleCount; i++) {
          const i3 = i * 3;
          
          // Get original x and z
          const x = this.positions[i3];
          const z = this.positions[i3 + 2];
          
          // Animate the wave over time
          const amplitude = 3 * this.scale;
          const frequency = 3;
          const speed = 1.5;
          
          // Calculate new y position with time-based animation
          const y = amplitude * Math.sin(frequency * x + time * speed) * 
                   Math.cos(frequency * z + time * speed * 0.7) + this.yOffset;
          
          // Apply new position
          this.positions[i3 + 1] = y;
        }
      }
    }
    
    // Update the geometry
    this.particles.geometry.attributes.position.needsUpdate = true;
    
    // Apply rotation based on user interaction
    if (!this.isMouseDown) {
      // Automatic very slow rotation when not being dragged
      this.particles.rotation.y += 0.001;
    } else {
      // Apply user-controlled rotation
      this.particles.rotation.x += (this.targetRotationX - this.particles.rotation.x) * 0.1;
      this.particles.rotation.y += (this.targetRotationY - this.particles.rotation.y) * 0.1;
    }
  }
  
  // Improved easing functions for smoother animations
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  easeInOutQuint(t) {
    return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
  }
  
  easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    const deltaTime = Math.min(0.1, this.clock.getDelta());
    
    // Update particles
    this.updateParticles(deltaTime);
    
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