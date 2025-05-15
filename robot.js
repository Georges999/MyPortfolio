// 3D Robot Module
class Robot3D {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.robot = null;
    this.mixer = null;
    this.clock = new THREE.Clock();
    this.animations = {};
    this.currentAnimation = null;
    this.controls = null;
    this.container = document.getElementById('robot-canvas');
    this.colors = [
      new THREE.Color(0x6c63ff), // Purple
      new THREE.Color(0xf50057), // Pink
      new THREE.Color(0x00bcd4), // Cyan
      new THREE.Color(0x4caf50), // Green
      new THREE.Color(0xff9800)  // Orange
    ];
    this.currentColorIndex = 0;
    
    // Initialize only if container exists
    if (this.container) {
      this.init();
      this.setupEventListeners();
    }
  }
  
  init() {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);
    this.scene.transparent = true;
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
    
    // Add camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 1.5, 4);
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);
    
    // Add controls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 6;
    this.controls.maxPolarAngle = Math.PI / 2;
    
    // Check if we're in dark mode and adjust background
    if (document.body.classList.contains('dark-mode')) {
      this.scene.background = new THREE.Color(0x121212);
    }
    
    // Load robot model
    this.loadRobotModel();
    
    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
    
    // Start animation loop
    this.animate();
  }
  
  loadRobotModel() {
    // Show loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'robot-loading';
    loadingDiv.textContent = 'Loading Robot...';
    this.container.appendChild(loadingDiv);
    
    // Simple robot geometry (as a placeholder for actual GLTF model)
    this.createSimpleRobot();
    
    // Remove loading indicator
    setTimeout(() => {
      if (loadingDiv.parentNode) {
        loadingDiv.parentNode.removeChild(loadingDiv);
      }
    }, 1000);
  }
  
  createSimpleRobot() {
    // Create a group for the robot
    this.robot = new THREE.Group();
    this.scene.add(this.robot);
    
    // Materials
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: this.colors[this.currentColorIndex],
      flatShading: true
    });
    
    const eyeMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      flatShading: true
    });
    
    const jointMaterial = new THREE.MeshPhongMaterial({
      color: 0x333333,
      flatShading: true
    });
    
    // Body parts
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.75, 0.75),
      bodyMaterial
    );
    head.position.y = 2;
    
    // Eyes
    const leftEye = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      eyeMaterial
    );
    leftEye.position.set(-0.2, 0.15, 0.38);
    
    const rightEye = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      eyeMaterial
    );
    rightEye.position.set(0.2, 0.15, 0.38);
    
    // Antenna
    const antenna = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.3, 16),
      jointMaterial
    );
    antenna.position.y = 0.5;
    
    const antennaTop = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 16, 16),
      bodyMaterial
    );
    antennaTop.position.y = 0.2;
    
    antenna.add(antennaTop);
    head.add(leftEye, rightEye, antenna);
    
    // Torso
    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1.5, 0.6),
      bodyMaterial
    );
    torso.position.y = 0.75;
    
    // Neck joint
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16),
      jointMaterial
    );
    neck.position.y = 1.5;
    torso.add(neck);
    
    // Arms
    const leftArm = this.createLimb(bodyMaterial, jointMaterial, 0.2, 0.6);
    leftArm.position.set(-0.6, 1.2, 0);
    leftArm.rotation.z = Math.PI / 16;
    
    const rightArm = this.createLimb(bodyMaterial, jointMaterial, 0.2, 0.6);
    rightArm.position.set(0.6, 1.2, 0);
    rightArm.rotation.z = -Math.PI / 16;
    
    // Legs
    const leftLeg = this.createLimb(bodyMaterial, jointMaterial, 0.25, 0.8);
    leftLeg.position.set(-0.3, 0, 0);
    
    const rightLeg = this.createLimb(bodyMaterial, jointMaterial, 0.25, 0.8);
    rightLeg.position.set(0.3, 0, 0);
    
    // Store limbs for animations
    this.leftArm = leftArm;
    this.rightArm = rightArm;
    this.leftLeg = leftLeg;
    this.rightLeg = rightLeg;
    this.head = head;
    
    // Add everything to the robot
    this.robot.add(head, torso, leftArm, rightArm, leftLeg, rightLeg);
    
    // Center the robot
    this.robot.position.y = -1;
  }
  
  createLimb(bodyMaterial, jointMaterial, width, height) {
    const limb = new THREE.Group();
    
    // Joint
    const joint = new THREE.Mesh(
      new THREE.SphereGeometry(width, 16, 16),
      jointMaterial
    );
    limb.add(joint);
    
    // Limb segment
    const segment = new THREE.Mesh(
      new THREE.CylinderGeometry(width * 0.7, width * 0.5, height, 16),
      bodyMaterial
    );
    segment.position.y = -height / 2;
    limb.add(segment);
    
    return limb;
  }
  
  onWindowResize() {
    if (!this.container) return;
    
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }
  
  setupEventListeners() {
    // Wave animation
    const waveBtn = document.getElementById('robot-wave');
    if (waveBtn) {
      waveBtn.addEventListener('click', () => this.wave());
    }
    
    // Dance animation
    const danceBtn = document.getElementById('robot-dance');
    if (danceBtn) {
      danceBtn.addEventListener('click', () => this.dance());
    }
    
    // Change color
    const colorBtn = document.getElementById('robot-color');
    if (colorBtn) {
      colorBtn.addEventListener('click', () => this.changeColor());
    }
    
    // Dark mode listener
    const themeSwitch = document.querySelector('.theme-switch');
    if (themeSwitch) {
      themeSwitch.addEventListener('click', () => {
        setTimeout(() => {
          // Update scene background based on dark mode
          if (document.body.classList.contains('dark-mode')) {
            this.scene.background = new THREE.Color(0x121212);
          } else {
            this.scene.background = new THREE.Color(0xffffff);
          }
        }, 50);
      });
    }
  }
  
  wave() {
    if (!this.robot) return;
    
    // Stop any current animation
    this.stopAnimations();
    
    // Start wave animation
    this.isWaving = true;
    this.waveStartTime = this.clock.getElapsedTime();
  }
  
  dance() {
    if (!this.robot) return;
    
    // Stop any current animation
    this.stopAnimations();
    
    // Start dance animation
    this.isDancing = true;
    this.danceStartTime = this.clock.getElapsedTime();
  }
  
  stopAnimations() {
    this.isWaving = false;
    this.isDancing = false;
    
    // Reset positions
    if (this.leftArm) {
      this.leftArm.rotation.z = Math.PI / 16;
      this.leftArm.rotation.x = 0;
    }
    
    if (this.rightArm) {
      this.rightArm.rotation.z = -Math.PI / 16;
      this.rightArm.rotation.x = 0;
    }
    
    if (this.robot) {
      this.robot.position.y = -1;
      this.robot.rotation.y = 0;
    }
    
    if (this.leftLeg) {
      this.leftLeg.rotation.x = 0;
    }
    
    if (this.rightLeg) {
      this.rightLeg.rotation.x = 0;
    }
    
    if (this.head) {
      this.head.rotation.y = 0;
    }
  }
  
  changeColor() {
    if (!this.robot) return;
    
    // Cycle through colors
    this.currentColorIndex = (this.currentColorIndex + 1) % this.colors.length;
    
    // Apply color to all body parts
    this.robot.traverse((child) => {
      if (child.isMesh && child.material && child.material.color && 
          child.material.type === 'MeshPhongMaterial' && 
          child.material.color.getHex() !== 0xffffff && 
          child.material.color.getHex() !== 0x333333) {
        
        child.material.color.copy(this.colors[this.currentColorIndex]);
      }
    });
  }
  
  updateWaveAnimation() {
    if (!this.isWaving || !this.rightArm) return;
    
    const elapsed = this.clock.getElapsedTime() - this.waveStartTime;
    const duration = 2; // Animation duration in seconds
    
    if (elapsed > duration) {
      this.isWaving = false;
      this.rightArm.rotation.z = -Math.PI / 16;
      this.rightArm.rotation.x = 0;
      return;
    }
    
    // Wave the right arm
    this.rightArm.rotation.z = -Math.PI / 3;
    this.rightArm.rotation.x = Math.sin(elapsed * 8) * 0.5;
  }
  
  updateDanceAnimation() {
    if (!this.isDancing) return;
    
    const elapsed = this.clock.getElapsedTime() - this.danceStartTime;
    const duration = 3; // Animation duration in seconds
    
    if (elapsed > duration) {
      this.isDancing = false;
      this.stopAnimations();
      return;
    }
    
    // Make the robot bounce
    if (this.robot) {
      this.robot.position.y = -1 + Math.abs(Math.sin(elapsed * 8) * 0.2);
      this.robot.rotation.y = Math.sin(elapsed * 4) * 0.5;
    }
    
    // Move the arms
    if (this.leftArm) {
      this.leftArm.rotation.z = Math.PI / 16 + Math.sin(elapsed * 8) * 0.5;
      this.leftArm.rotation.x = Math.sin(elapsed * 8) * 0.3;
    }
    
    if (this.rightArm) {
      this.rightArm.rotation.z = -Math.PI / 16 - Math.sin(elapsed * 8) * 0.5;
      this.rightArm.rotation.x = -Math.sin(elapsed * 8) * 0.3;
    }
    
    // Move the legs
    if (this.leftLeg) {
      this.leftLeg.rotation.x = Math.sin(elapsed * 8) * 0.2;
    }
    
    if (this.rightLeg) {
      this.rightLeg.rotation.x = -Math.sin(elapsed * 8) * 0.2;
    }
    
    // Move the head
    if (this.head) {
      this.head.rotation.y = Math.sin(elapsed * 4) * 0.3;
    }
  }
  
  animate() {
    if (!this.renderer) return;
    
    requestAnimationFrame(() => this.animate());
    
    // Update controls
    if (this.controls) {
      this.controls.update();
    }
    
    // Update robot animations
    this.updateWaveAnimation();
    this.updateDanceAnimation();
    
    // Auto-rotate the robot slightly when not animating
    if (!this.isWaving && !this.isDancing && this.robot) {
      this.robot.rotation.y += 0.003;
    }
    
    // Render the scene
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

// Initialize robot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Add robot initialization to the window load event to ensure Three.js is loaded
  window.addEventListener('load', () => {
    // Initialize the robot
    const robot = new Robot3D();
  });
}); 