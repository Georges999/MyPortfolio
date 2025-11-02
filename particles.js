// Enhanced Particles System
class ParticleSystem {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = null;
    this.isMobile = window.innerWidth < 768; // Check if mobile device
    this.particleCount = 2000; // Keep the same particle count
    this.positions = [];
    this.colors = [];
    this.sizes = [];
    this.currentShape = 'ribbon'; // Default shape is now ribbon instead of wave
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
    // Adjust Y offset based on device for better mobile positioning
    this.yOffset = this.isMobile ? 7 : 6; // Decreased to 3 on mobile to center the shape in our adjusted layout
    this.scale = this.isMobile ? 1 : 1.7; // Keep 1 for mobile, 1.8 for desktop // Increased scale factor to make shapes even larger
    
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
    
    // Initialize with ribbon shape instead of wave
    setTimeout(() => {
      this.transformToShape('ribbon');
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
      this.transformToShape('bug');
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
      if (shape === 'bug') {
        // Computer bug shape pattern
        
        // Determine which part of the bug this particle belongs to
        const bugParts = {
          body: 0.4,      // 40% for the body
          head: 0.1,      // 10% for the head
          legs: 0.3,      // 30% for legs
          antennae: 0.1,  // 10% for antennae
          details: 0.1    // 10% for additional details
        };
        
        // Random value to determine which part
        const partSelector = Math.random();
        
        // Sizes and positioning variables
        const bodyLength = 10 * this.scale;
        const bodyWidth = 5 * this.scale;
        const bodyHeight = 3 * this.scale;
        
        // Default particle size - will be adjusted based on part
        let particleSize = 0.6;
        
        // Position variables
        let x, y, z;
        
        // BODY SECTION - Ellipsoid shape
        if (partSelector < bugParts.body) {
          // Create an ellipsoid for the bug body
          const u = Math.random() * Math.PI * 2;
          const v = Math.random() * Math.PI;
          
          // Layered ellipsoid for segments
          const segmentCount = 5;
          const segment = Math.floor(Math.random() * segmentCount);
          
          // Each segment is slightly smaller
          const segmentRatio = 0.8 + (segment / segmentCount) * 0.2;
          
          // Position on ellipsoid
          x = Math.cos(u) * Math.sin(v) * bodyWidth * 0.5 * segmentRatio;
          y = Math.cos(v) * bodyHeight * 0.5 * segmentRatio + this.yOffset;
          z = Math.sin(u) * Math.sin(v) * bodyLength * 0.5 * segmentRatio;
          
          // Shift position based on segment to create segmented body
          z -= (segment - segmentCount/2) * bodyLength * 0.1;
          
          // Particle size varies slightly within the body
          particleSize = Math.random() * 0.3 + 0.6;
        }
        // HEAD SECTION
        else if (partSelector < bugParts.body + bugParts.head) {
          // Create a spherical head at the front of the body
          const u = Math.random() * Math.PI * 2;
          const v = Math.random() * Math.PI;
          const headRadius = bodyHeight * 0.6;
          
          // Position on sphere
          x = Math.cos(u) * Math.sin(v) * headRadius;
          y = Math.cos(v) * headRadius + this.yOffset;
          z = Math.sin(u) * Math.sin(v) * headRadius + bodyLength * 0.5;
          
          // Eyes (small cluster of particles)
          if (Math.random() > 0.7) {
            const eyeOffset = headRadius * 0.7;
            const eyeSize = headRadius * 0.3;
            x = (Math.random() - 0.5) * eyeSize + (Math.random() > 0.5 ? eyeOffset : -eyeOffset);
            y = eyeSize + this.yOffset + headRadius * 0.2;
            z = bodyLength * 0.5 + headRadius * 0.7;
            
            // Eyes are smaller particles
            particleSize = Math.random() * 0.2 + 0.3;
          }
        }
        // LEGS SECTION
        else if (partSelector < bugParts.body + bugParts.head + bugParts.legs) {
          // Create 6 legs (3 on each side)
          
          // Determine which leg this particle belongs to
          const legCount = 6;
          const legIndex = Math.floor(Math.random() * legCount);
          const leftSide = legIndex < 3; // First 3 legs on left side
          
          // Position along the body for this leg
          const legPosition = (legIndex % 3) - 1; // -1, 0, or 1
          const zOffset = legPosition * (bodyLength * 0.25);
          
          // Base position where leg connects to body
          const baseX = leftSide ? -bodyWidth * 0.5 : bodyWidth * 0.5;
          const baseY = -bodyHeight * 0.2 + this.yOffset;
          const baseZ = zOffset;
          
          // Leg consists of segments with joints
          const segmentCount = 3;
          const segment = Math.floor(Math.random() * segmentCount);
          
          // Create leg with segments and joints
          // Each segment extends outward and downward
          let segmentLength, segmentAngle;
          
          if (segment === 0) {
            // Upper leg segment (connected to body)
            segmentLength = bodyWidth * 0.6;
            segmentAngle = leftSide ? -0.3 : 0.3;
            
            const segmentRatio = Math.random();
            x = baseX + (leftSide ? -1 : 1) * segmentLength * segmentRatio * Math.cos(segmentAngle);
            y = baseY - segmentLength * segmentRatio * Math.sin(segmentAngle);
            z = baseZ;
          } 
          else if (segment === 1) {
            // Middle leg segment
            segmentLength = bodyWidth * 0.7;
            segmentAngle = leftSide ? -0.7 : 0.7;
            
            // Start from end of previous segment
            const prevSegmentLength = bodyWidth * 0.6;
            const prevSegmentAngle = leftSide ? -0.3 : 0.3;
            const jointX = baseX + (leftSide ? -1 : 1) * prevSegmentLength * Math.cos(prevSegmentAngle);
            const jointY = baseY - prevSegmentLength * Math.sin(prevSegmentAngle);
            
            const segmentRatio = Math.random();
            x = jointX + (leftSide ? -1 : 1) * segmentLength * segmentRatio * Math.cos(segmentAngle);
            y = jointY - segmentLength * segmentRatio * Math.sin(segmentAngle);
            z = baseZ;
          }
          else {
            // Lower leg segment (foot)
            segmentLength = bodyWidth * 0.4;
            segmentAngle = leftSide ? -1.2 : 1.2;
            
            // Calculate position based on previous joints
            const midJointX = baseX + (leftSide ? -1 : 1) * bodyWidth * 0.6 * Math.cos(leftSide ? -0.3 : 0.3);
            const midJointY = baseY - bodyWidth * 0.6 * Math.sin(leftSide ? -0.3 : 0.3);
            
            const prevSegmentLength = bodyWidth * 0.7;
            const prevSegmentAngle = leftSide ? -0.7 : 0.7;
            const jointX = midJointX + (leftSide ? -1 : 1) * prevSegmentLength * Math.cos(prevSegmentAngle);
            const jointY = midJointY - prevSegmentLength * Math.sin(prevSegmentAngle);
            
            const segmentRatio = Math.random();
            x = jointX + (leftSide ? -1 : 1) * segmentLength * segmentRatio * Math.cos(segmentAngle);
            y = jointY - segmentLength * segmentRatio * Math.sin(segmentAngle);
            z = baseZ;
          }
          
          // Legs have smaller particles
          particleSize = Math.random() * 0.2 + 0.4;
        }
        // ANTENNAE SECTION
        else if (partSelector < bugParts.body + bugParts.head + bugParts.legs + bugParts.antennae) {
          // Create a pair of antennae on the head
          const leftAntenna = Math.random() > 0.5;
          
          // Base position on top of head
          const baseX = leftAntenna ? -bodyHeight * 0.3 : bodyHeight * 0.3;
          const baseY = bodyHeight * 0.7 + this.yOffset;
          const baseZ = bodyLength * 0.5 + bodyHeight * 0.5; // Front of head
          
          // Antennae with curve
          const t = Math.random(); // Position along antenna
          const antennaLength = bodyLength * 0.7;
          
          // Create a curved path for the antenna
          const curveX = baseX + (leftAntenna ? -1 : 1) * t * bodyWidth * 0.3;
          const curveY = baseY + Math.sin(t * Math.PI) * bodyHeight * 0.8;
          const curveZ = baseZ + t * antennaLength;
          
          // Add random movement near the antenna path
          const spreadFactor = t * 0.5; // More spread at the tip
          x = curveX + (Math.random() - 0.5) * spreadFactor;
          y = curveY + (Math.random() - 0.5) * spreadFactor;
          z = curveZ + (Math.random() - 0.5) * spreadFactor;
          
          // Antennae have small particles that get smaller toward tip
          particleSize = (1 - t) * 0.3 + 0.1;
        }
        // ADDITIONAL DETAILS
        else {
          // Wings, features, etc.
          const detail = Math.random();
          
          if (detail < 0.7) {
            // Wings on top/back of the body
            const leftWing = Math.random() > 0.5;
            
            // Wing base position
            const wingOffset = bodyWidth * 0.3;
            const wingLength = bodyLength * 0.6;
            const wingWidth = bodyWidth * 0.8;
            
            // Position on wing
            const u = Math.random(); // along length
            const v = Math.random(); // along width
            
            // Create wing shape
            x = (leftWing ? -1 : 1) * (wingOffset + v * wingWidth * 0.8 * Math.sin(u * Math.PI));
            y = bodyHeight * 0.5 + this.yOffset + Math.sin(v * Math.PI) * bodyHeight * 0.1;
            z = -bodyLength * 0.2 + u * wingLength;
            
            // Wings have translucent smaller particles
            particleSize = Math.random() * 0.3 + 0.2;
          } 
          else {
            // Small details like mandibles, textures
            // Mandibles in front of head
            const leftMandible = Math.random() > 0.5;
            
            const mandibleLength = bodyHeight * 0.4;
            const t = Math.random(); // Position along mandible
            
            x = (leftMandible ? -1 : 1) * bodyHeight * 0.3 * (1 - t);
            y = -bodyHeight * 0.2 * t + this.yOffset;
            z = bodyLength * 0.5 + bodyHeight * 0.5 + mandibleLength * t;
            
            // Small detailed particles
            particleSize = Math.random() * 0.2 + 0.2;
          }
        }
        
        // Set the final position and size
        targetPositions[i3] = x;
        targetPositions[i3 + 1] = y;
        targetPositions[i3 + 2] = z;
        this.sizes[i] = particleSize;
      }
      else if (shape === 'ribbon') {
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
      } else if (shape === 'bug') {
        // Animate the bug with subtle movements
        const time = this.clock.getElapsedTime();
        
        for (let i = 0; i < this.particleCount; i++) {
          const i3 = i * 3;
          
          // Get base position
          const x = this.targetPositions[i3];
          const y = this.targetPositions[i3 + 1];
          const z = this.targetPositions[i3 + 2];
          
          // Determine which part this is based on position and size
          const isBody = Math.abs(x) < 3 * this.scale && Math.abs(z) < 6 * this.scale && this.sizes[i] > 0.5;
          const isLeg = y < this.yOffset && this.sizes[i] < 0.5;
          const isAntenna = z > 7 * this.scale && this.sizes[i] < 0.3;
          const isWing = Math.abs(x) > 3 * this.scale && Math.abs(z) < 4 * this.scale && y > this.yOffset;
          
          // Different animation for different parts
          if (isBody) {
            // Subtle body pulsing - simulating breathing
            const breathCycle = Math.sin(time * 1.5) * 0.03 + 1;
            this.positions[i3] = x * breathCycle;
            this.positions[i3 + 1] = y;
            this.positions[i3 + 2] = z;
            
            // Slight body movement
            const bodyMovement = Math.sin(time * 0.8) * 0.05;
            this.positions[i3 + 1] += bodyMovement;
          } 
          else if (isLeg) {
            // Leg movement - walking motion
            const legSpeed = 2;
            const legMovement = Math.cos(time * legSpeed + x * 2) * 0.1;
            
            // Move legs back and forth in z direction
            this.positions[i3] = x;
            this.positions[i3 + 1] = y;
            this.positions[i3 + 2] = z + legMovement;
          } 
          else if (isAntenna) {
            // Antenna wiggling
            const antennaWiggle = Math.sin(time * 3 + z) * 0.15 * (z / (7 * this.scale));
            this.positions[i3] = x + antennaWiggle;
            this.positions[i3 + 1] = y;
            this.positions[i3 + 2] = z;
          } 
          else if (isWing) {
            // Wing fluttering occasionally
            const flutterFrequency = 5;
            const flutterStrength = 0.12;
            
            // Only flutter occasionally
            const flutterCycle = Math.floor(time * 0.3) % 3; // 0, 1, 2
            
            if (flutterCycle === 0) {
              // Flutter wings
              const flutter = Math.sin(time * flutterFrequency) * flutterStrength;
              this.positions[i3] = x;
              this.positions[i3 + 1] = y + flutter;
              this.positions[i3 + 2] = z;
            } else {
              // Wings at rest
              this.positions[i3] = x;
              this.positions[i3 + 1] = y;
              this.positions[i3 + 2] = z;
            }
          } else {
            // Other parts - small random movements
            const detailMovement = 0.02;
            this.positions[i3] = x + (Math.random() - 0.5) * detailMovement;
            this.positions[i3 + 1] = y + (Math.random() - 0.5) * detailMovement;
            this.positions[i3 + 2] = z + (Math.random() - 0.5) * detailMovement;
          }
        }
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