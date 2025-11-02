// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Loading screen
  const loading = document.createElement('div');
  loading.classList.add('loading');
  const spinner = document.createElement('div');
  spinner.classList.add('loading-spinner');
  loading.appendChild(spinner);
  document.body.appendChild(loading);

  // Hide loading screen after 1.5 seconds
  setTimeout(function() {
    loading.classList.add('hidden');
    setTimeout(function() {
      loading.remove();
      
      // Initialize animations when page is loaded
      initAnimations();
    }, 500);
  }, 1500);

  // Initialize all functions
  initMobileMenu();
  initDarkMode();
  initCustomCursor();
  initScrollEvents();
  initTypingEffect();
  initProjectFilter();
  initSkillAnimation();
  initContactCopy();
  initLightbox();
  initAmbientParticles();
});

// Mobile Menu Toggle
function initMobileMenu() {
  const mobileMenu = document.querySelector('.mobile-menu');
  const navLinks = document.querySelector('.nav-links');

  if (mobileMenu) {
    mobileMenu.addEventListener('click', function() {
      mobileMenu.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
      link.addEventListener('click', function() {
        mobileMenu.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }
}

// Dark Mode Toggle
function initDarkMode() {
  const themeSwitch = document.querySelector('.theme-switch');
  const moonIcon = document.querySelector('.theme-switch i');
  
  // Check for saved theme preference or respect OS preference
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
    document.body.classList.add('dark-mode');
    moonIcon.classList.remove('fa-moon');
    moonIcon.classList.add('fa-sun');
  }
  
  themeSwitch.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
      localStorage.setItem('theme', 'dark');
      moonIcon.classList.remove('fa-moon');
      moonIcon.classList.add('fa-sun');
    } else {
      localStorage.setItem('theme', 'light');
      moonIcon.classList.remove('fa-sun');
      moonIcon.classList.add('fa-moon');
    }
  });
}

// Custom Cursor
function initCustomCursor() {
  // No cursor functionality to avoid white flash effect
}

// Scroll Events
function initScrollEvents() {
  const header = document.querySelector('header');
  const backToTop = document.querySelector('.back-to-top');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // Header scroll effect
  window.addEventListener('scroll', function() {
    if (window.scrollY > 100) {
      header.classList.add('scrolled');
      backToTop.classList.add('visible');
    } else {
      header.classList.remove('scrolled');
      backToTop.classList.remove('visible');
    }
    
    // Highlight active nav link based on scroll position
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      
      if (window.scrollY >= sectionTop - 200) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').substring(1) === current) {
        link.classList.add('active');
      }
    });
  });
  
  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Back to top button
  backToTop.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Typing Effect
function initTypingEffect() {
  const typedTextElement = document.querySelector('.typed-text');
  const roles = ['Software Engineering Student', 'Cybersecurity Enthusiast', 'App Developer', 'Game Developer'];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;
  
  function type() {
    const currentRole = roles[roleIndex];
    
    if (isDeleting) {
      typedTextElement.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;
    } else {
      typedTextElement.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 150;
    }
    
    if (!isDeleting && charIndex === currentRole.length) {
      isDeleting = true;
      typingSpeed = 1500; // Pause at the end
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingSpeed = 500; // Pause before typing next role
    }
    
    setTimeout(type, typingSpeed);
  }
  
  // Start typing effect
  if (typedTextElement) {
    setTimeout(type, 1000);
  }
}

// Project Image Navigation and Dynamic Cards
function initProjectFilter() {
  // Initialize dynamic project cards
  initDynamicProjectCards();
  
  // Initialize project image navigation
  initProjectImageNavigation();
}

// Initialize project image navigation
function initProjectImageNavigation() {
  const projectCards = document.querySelectorAll('.project-card');

  projectCards.forEach(card => {
    const slides = card.querySelector('.project-img-slides');
    if (!slides) return; // Skip if no slides container

    const images = slides.querySelectorAll('img');
    if (images.length <= 1) return; // Skip if only one image

    const prevBtn = card.querySelector('.prev-img');
    const nextBtn = card.querySelector('.next-img');
    const counter = card.querySelector('.img-nav-counter');
    
    let currentIndex = 0;
    const totalImages = images.length;

    // Update counter text
    if (counter) {
      counter.textContent = `1 / ${totalImages}`;
    }

    // Initialize slide width after images load
    let slideWidth = 0;
    
    // Wait for images to load to get proper dimensions
    Promise.all(Array.from(images).map(img => {
      return new Promise(resolve => {
        if (img.complete) {
          resolve();
        } else {
          img.addEventListener('load', resolve);
        }
      });
    })).then(() => {
      updateNavigation();
    });

    function updateSlidePosition() {
      slides.style.transform = `translateX(${-currentIndex * 100}%)`;
    }

    function updateNavigation() {
      // Update counter text
      if (counter) {
        counter.textContent = `${currentIndex + 1} / ${totalImages}`;
      }

      // Disable/enable buttons based on position
      if (prevBtn) {
        if (currentIndex === 0) {
          prevBtn.classList.add('disabled');
        } else {
          prevBtn.classList.remove('disabled');
        }
      }

      if (nextBtn) {
        if (currentIndex === totalImages - 1) {
          nextBtn.classList.add('disabled');
        } else {
          nextBtn.classList.remove('disabled');
        }
      }
    }

    // Previous button click event
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentIndex > 0) {
          currentIndex--;
          updateSlidePosition();
          updateNavigation();
        }
      });
    }

    // Next button click event
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentIndex < totalImages - 1) {
          currentIndex++;
          updateSlidePosition();
          updateNavigation();
        }
      });
    }

    // Initialize
    updateNavigation();
  });
}

// Initialize dynamic project cards
function initDynamicProjectCards() {
  const projectCards = document.querySelectorAll('.project-card');
  
  projectCards.forEach(card => {
    // Simple card effects for better usability
    const isKeylogger = !card.querySelector('.project-img');
    
    if (isKeylogger) {
      const icon = card.querySelector('.project-icon');
      if (icon) {
        // Simple hover effect for icon
        card.addEventListener('mouseenter', () => {
          icon.style.transform = 'scale(1.05)';
        });
        
        card.addEventListener('mouseleave', () => {
          icon.style.transform = 'scale(1)';
        });
      }
    }
  });
}

// Interactive Skills Visualization with performance optimization
function initSkillAnimation() {
  const skillFlowContainer = document.getElementById('skill-flow');
  if (!skillFlowContainer) return;
  
  const skillTags = document.querySelectorAll('.skill-tag');
  
  // Create canvas element
  const canvas = document.createElement('canvas');
  skillFlowContainer.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  
  // Get primary and secondary colors from CSS variables
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
  const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim();
  
  // Set canvas size
  function resizeCanvas() {
    const rect = skillFlowContainer.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Detect system capabilities for performance optimization
  const performanceLevel = getPerformanceLevel();
  
  // Initialize particle system with dynamic counts based on performance
  const particleCount = performanceLevel.particleCount;
  const maxSpeed = 1;
  const minRadius = 1;
  const maxRadius = performanceLevel.maxRadius;
  const connectionDistance = performanceLevel.connectionDistance;
  const particles = [];
  
  console.log(`Performance optimization: Level ${performanceLevel.level}, Particles: ${particleCount}`);
  
  // Create skill data
  const skills = [];
  skillTags.forEach(tag => {
    skills.push({
      name: tag.getAttribute('data-skill'),
      value: parseInt(tag.getAttribute('data-value')),
      element: tag,
      active: false
    });
  });
  
  // Create particles
  function createParticles() {
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * (maxRadius - minRadius) + minRadius,
        vx: (Math.random() - 0.5) * maxSpeed,
        vy: (Math.random() - 0.5) * maxSpeed,
        color: Math.random() > 0.8 ? secondaryColor : primaryColor,
        alpha: Math.random() * 0.5 + 0.5
      });
    }
  }
  
  // Handle interactions
  let mouseX = -1000;
  let mouseY = -1000;
  let isClicked = false;
  let activeSkill = null;
  
  // Mouse interactions
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });
  
  canvas.addEventListener('mousedown', () => {
    isClicked = true;
    
    // Only add particles if performance level allows
    if (performanceLevel.level >= 2) {
      createExplosiveParticles(mouseX, mouseY, 15);
    } else {
      createExplosiveParticles(mouseX, mouseY, 5);
    }
  });
  
  canvas.addEventListener('mouseup', () => {
    isClicked = false;
  });
  
  canvas.addEventListener('mouseleave', () => {
    mouseX = -1000;
    mouseY = -1000;
    isClicked = false;
  });
  
  // Helper function to create explosive particles
  function createExplosiveParticles(x, y, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      
      particles.push({
        x: x,
        y: y,
        radius: Math.random() * 2 + 1,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: secondaryColor,
        alpha: 1,
        life: 1,
        maxLife: 1
      });
    }
  }
  
  // Touch events for mobile
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.touches[0].clientX - rect.left;
      mouseY = e.touches[0].clientY - rect.top;
      isClicked = true;
      
      if (performanceLevel.level >= 2) {
        createExplosiveParticles(mouseX, mouseY, 10);
      } else {
        createExplosiveParticles(mouseX, mouseY, 3);
      }
    }
    
    e.preventDefault();
  }, { passive: false });
  
  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.touches[0].clientX - rect.left;
      mouseY = e.touches[0].clientY - rect.top;
    }
    
    e.preventDefault();
  }, { passive: false });
  
  canvas.addEventListener('touchend', () => {
    isClicked = false;
  });
  
  // Skill tag interactions - performance optimized
  let lastInteractionTime = 0;
  const interactionDelay = 500; // Limit interactions to every 500ms
  
  skillTags.forEach((tag, index) => {
    tag.addEventListener('mouseenter', () => {
      const now = Date.now();
      if (now - lastInteractionTime < interactionDelay) return;
      lastInteractionTime = now;
      
      activeSkill = skills[index];
      activeSkill.active = true;
      
      // Add particles for skills, optimized based on performance
      const skillValue = activeSkill.value;
      const particlesToAdd = Math.floor(skillValue / 20) * performanceLevel.particleFactor;
      
      if (particlesToAdd > 0) {
        for (let i = 0; i < particlesToAdd; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 1,
            vx: (Math.random() - 0.5) * maxSpeed * 2,
            vy: (Math.random() - 0.5) * maxSpeed * 2,
            color: secondaryColor,
            alpha: 0.8,
            life: 1,
            maxLife: 1,
            skillParticle: true
          });
        }
      }
      
      tag.classList.add('active');
    });
    
    tag.addEventListener('mouseleave', () => {
      if (activeSkill === skills[index]) {
        activeSkill.active = false;
        activeSkill = null;
      }
      tag.classList.remove('active');
    });
    
    tag.addEventListener('click', () => {
      const now = Date.now();
      if (now - lastInteractionTime < interactionDelay) return;
      lastInteractionTime = now;
      
      // Clear all active states
      skillTags.forEach((t, i) => {
        t.classList.remove('active');
        skills[i].active = false;
      });
      
      // Set this skill as active
      tag.classList.add('active');
      activeSkill = skills[index];
      activeSkill.active = true;
      
      // Only create wave effect if performance allows
      if (performanceLevel.level >= 2) {
        createSkillWave(tag, 30);
      } else if (performanceLevel.level === 1) {
        createSkillWave(tag, 15);
      } else {
        createSkillWave(tag, 5);
      }
    });
  });
  
  // Create wave effect, optimized
  function createSkillWave(tag, count) {
    const rect = tag.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    
    const centerX = (rect.left + rect.right) / 2 - canvasRect.left;
    const centerY = rect.bottom - canvasRect.top + 20;
    
    // Create fewer particles with staggered effect
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 80 + 40;
      const delay = Math.random() * 10;
      
      setTimeout(() => {
        particles.push({
          x: centerX,
          y: centerY,
          targetX: centerX + Math.cos(angle) * distance,
          targetY: centerY + Math.sin(angle) * distance,
          radius: Math.random() * 2 + 1,
          vx: 0,
          vy: 0,
          color: secondaryColor,
          alpha: 0.9,
          life: 1,
          maxLife: 1,
          skillParticle: true,
          wave: true
        });
      }, delay * 50);
    }
  }
  
  // Animation functions - optimized
  let lastDrawConnectionsTime = 0;
  const connectionFrameInterval = performanceLevel.connectionInterval;
  
  function drawParticleConnections(timestamp) {
    // Only draw connections at intervals based on performance
    if (timestamp - lastDrawConnectionsTime < connectionFrameInterval) return;
    lastDrawConnectionsTime = timestamp;
    
    ctx.lineWidth = 0.5;
    
    // Create spatial hash grid for faster proximity checks
    const gridSize = connectionDistance;
    const grid = {};
    
    // Place particles in grid
    particles.forEach((p, i) => {
      const cellX = Math.floor(p.x / gridSize);
      const cellY = Math.floor(p.y / gridSize);
      const cellKey = `${cellX},${cellY}`;
      
      if (!grid[cellKey]) {
        grid[cellKey] = [];
      }
      
      grid[cellKey].push(i);
    });
    
    // Check only nearby particles using grid
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      const cellX = Math.floor(p1.x / gridSize);
      const cellY = Math.floor(p1.y / gridSize);
      
      // Check adjacent cells only
      for (let nx = -1; nx <= 1; nx++) {
        for (let ny = -1; ny <= 1; ny++) {
          const neighborKey = `${cellX + nx},${cellY + ny}`;
          const neighbors = grid[neighborKey];
          
          if (!neighbors) continue;
          
          for (let j = 0; j < neighbors.length; j++) {
            const neighborIndex = neighbors[j];
            
            // Skip if same particle or already checked
            if (neighborIndex <= i) continue;
            
            const p2 = particles[neighborIndex];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < connectionDistance) {
              const opacity = (1 - distance / connectionDistance) * 0.4 * p1.alpha * p2.alpha;
              
              ctx.strokeStyle = `rgba(108, 99, 255, ${opacity})`;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }
    }
  }
  
  function drawMouseConnections() {
    // Draw connections from mouse to nearby particles
    if (mouseX > 0 && mouseY > 0) {
      const mouseRadius = isClicked ? 150 : 100;
      const mouseRadiusSq = mouseRadius * mouseRadius;
      
      // Limit number of connections based on performance
      let connectionCount = 0;
      const maxConnections = performanceLevel.mouseConnections;
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const distanceSq = dx * dx + dy * dy;
        
        if (distanceSq < mouseRadiusSq) {
          // Limit connections
          if (connectionCount < maxConnections) {
            const distance = Math.sqrt(distanceSq);
            const opacity = (1 - distance / mouseRadius) * p.alpha * 0.5;
            
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(mouseX, mouseY);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
            
            connectionCount++;
          }
          
          // Create attraction to mouse - this is cheap so we keep it for all particles
          if (isClicked) {
            p.vx += dx * 0.02;
            p.vy += dy * 0.02;
          } else {
            p.vx -= dx * 0.001;
            p.vy -= dy * 0.001;
          }
        }
      }
      
      // Draw mouse indicator if performance allows
      if (performanceLevel.mouseGlow) {
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
          mouseX, mouseY, 0,
          mouseX, mouseY, isClicked ? 30 : 20
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.arc(mouseX, mouseY, isClicked ? 30 : 20, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  
  // Simplified flow field for better performance
  const flowGridSize = 40;  // Larger grid = fewer calculations
  let flowField = [];
  let flowTime = 0;
  
  function createSimplifiedFlowField() {
    // Only update flow field periodically
    flowTime += 0.001;
    
    // Create or update flow field
    if (flowField.length === 0) {
      const cols = Math.ceil(canvas.width / flowGridSize);
      const rows = Math.ceil(canvas.height / flowGridSize);
      
      flowField = new Array(cols * rows);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const angle = Math.sin(x * 0.1 + flowTime) * Math.cos(y * 0.1 + flowTime) * Math.PI * 2;
          flowField[y * cols + x] = angle;
        }
      }
      
      return { flowField, cols, rows, gridSize: flowGridSize };
    } else {
      const cols = Math.ceil(canvas.width / flowGridSize);
      const rows = Math.ceil(canvas.height / flowGridSize);
      
      // Update every 4th cell for performance
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if ((x + y) % 4 === 0) {  // Only update a subset of cells each frame
            const angle = Math.sin(x * 0.1 + flowTime) * Math.cos(y * 0.1 + flowTime) * Math.PI * 2;
            flowField[y * cols + x] = angle;
          }
        }
      }
      
      return { flowField, cols, rows, gridSize: flowGridSize };
    }
  }
  
  function applyFlowFieldForces(flow) {
    const { flowField, cols, gridSize } = flow;
    
    // Apply flow field forces to particles
    particles.forEach(p => {
      // Find the flow grid cell
      const x = Math.floor(p.x / gridSize);
      const y = Math.floor(p.y / gridSize);
      
      if (x >= 0 && x < cols && y >= 0 && y < Math.ceil(canvas.height / gridSize)) {
        const index = y * cols + x;
        if (index < flowField.length) {
          const angle = flowField[index];
          
          // Apply force based on flow angle
          const force = p.wave ? 0.05 : 0.01;
          p.vx += Math.cos(angle) * force;
          p.vy += Math.sin(angle) * force;
        }
      }
    });
  }
  
  function drawParticles() {
    particles.forEach(p => {
      ctx.beginPath();
      
      // Use color based on particle type
      if (p.skillParticle && activeSkill) {
        ctx.fillStyle = `rgba(129, 200, 248, ${p.alpha})`;
      } else {
        const color = p.color || primaryColor;
        ctx.fillStyle = `rgba(${hexToRgb(color)}, ${p.alpha})`;
      }
      
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Add glow effect only for larger particles and if performance allows
      if (p.radius > 2 && performanceLevel.particleGlow) {
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, p.radius * 2
        );
        gradient.addColorStop(0, `rgba(${hexToRgb(p.color || primaryColor)}, 0.2)`);
        gradient.addColorStop(1, `rgba(${hexToRgb(p.color || primaryColor)}, 0)`);
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }
  
  function updateParticles() {
    // Create flow field - simplified for performance
    const flow = createSimplifiedFlowField();
    
    // Apply flow forces
    applyFlowFieldForces(flow);
    
    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      
      // Update position
      p.x += p.vx;
      p.vy += 0.005; // Reduced drift for performance
      p.y += p.vy;
      
      // Apply damping
      p.vx *= 0.99;
      p.vy *= 0.99;
      
      // Handle wave particles
      if (p.wave && p.targetX) {
        p.x += (p.targetX - p.x) * 0.03;
        p.y += (p.targetY - p.y) * 0.03;
      }
      
      // Optimized boundary check - wrap around with buffer
      const buffer = 10;
      if (p.x < -buffer) p.x = canvas.width + buffer;
      if (p.x > canvas.width + buffer) p.x = -buffer;
      if (p.y < -buffer) p.y = canvas.height + buffer;
      if (p.y > canvas.height + buffer) p.y = -buffer;
      
      // Handle life for temporary particles
      if (p.life !== undefined) {
        p.life -= 0.01;
        p.alpha = p.life;
        
        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }
    }
  }
  
  // Performance optimized animation loop with frame throttling
  let lastFrameTime = 0;
  const minFrameInterval = performanceLevel.frameInterval;
  
  function animate(timestamp) {
    // Throttle frames if needed
    if (timestamp - lastFrameTime < minFrameInterval) {
      requestAnimationFrame(animate);
      return;
    }
    
    lastFrameTime = timestamp;
    
    // Clear canvas with slight optimization (only clear visible area)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    updateParticles();
    drawParticleConnections(timestamp);
    drawParticles();
    drawMouseConnections();
    
    // Continue animation
    requestAnimationFrame(animate);
  }
  
  // Helper function to convert HEX to RGB
  function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Convert shorthand (3 digits) to full form (6 digits)
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    
    return `${r}, ${g}, ${b}`;
  }
  
  // Performance detection function
  function getPerformanceLevel() {
    // Check if running on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Check if browser supports performance API
    if (window.performance && window.performance.memory) {
      const memory = window.performance.memory;
      
      if (isMobile) {
        return {
          level: 1, // Low for all mobile devices
          particleCount: 50,
          maxRadius: 2,
          connectionDistance: 60,
          mouseConnections: 5,
          mouseGlow: false,
          particleGlow: false,
          connectionInterval: 100,
          frameInterval: 24,
          particleFactor: 0.5
        };
      }
      
      // Basic heuristics for desktop
      if (memory.jsHeapSizeLimit > 2000000000) {
        return {
          level: 3, // High-end
          particleCount: 100,
          maxRadius: 3,
          connectionDistance: 100,
          mouseConnections: 25,
          mouseGlow: true,
          particleGlow: true,
          connectionInterval: 30,
          frameInterval: 0,
          particleFactor: 1
        };
      } else {
        return {
          level: 2, // Mid-range
          particleCount: 75,
          maxRadius: 2.5,
          connectionDistance: 80,
          mouseConnections: 15,
          mouseGlow: true,
          particleGlow: false,
          connectionInterval: 50,
          frameInterval: 16,
          particleFactor: 0.75
        };
      }
    } else {
      // Fallback if performance API not available
      if (isMobile) {
        return {
          level: 0, // Very low for mobile without detection
          particleCount: 30,
          maxRadius: 2,
          connectionDistance: 50,
          mouseConnections: 3,
          mouseGlow: false,
          particleGlow: false,
          connectionInterval: 150,
          frameInterval: 33,
          particleFactor: 0.3
        };
      } else {
        return {
          level: 1, // Conservative for desktop without detection
          particleCount: 60,
          maxRadius: 2,
          connectionDistance: 70,
          mouseConnections: 10,
          mouseGlow: false,
          particleGlow: false,
          connectionInterval: 80,
          frameInterval: 20,
          particleFactor: 0.5
        };
      }
    }
  }
  
  // Initialize with performance optimizations
  function init() {
    createParticles();
    requestAnimationFrame(animate);
  }
  
  // Start animation when skills section becomes visible
  const skillsSection = document.querySelector('.skills');
  
  if (skillsSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          init();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 }); // Lower threshold for earlier loading
    
    observer.observe(skillsSection);
  } else {
    // Fallback if no observer support
    init();
  }
}

// Initialize animations for elements
function initAnimations() {
  // Common reveal configuration
  const commonReveal = {
    distance: '50px',
    duration: 800,
    delay: 200,
    easing: 'cubic-bezier(0.5, 0, 0, 1)',
    reset: false
  };
  
  // Initialize ScrollReveal
  const sr = ScrollReveal();
  
  // Hero section animations
  sr.reveal('.glitch-text', {
    ...commonReveal,
    origin: 'left',
    delay: 300
  });
  
  sr.reveal('.typing-text', {
    ...commonReveal,
    origin: 'right',
    delay: 600
  });
  
  sr.reveal('.hero-description', {
    ...commonReveal,
    origin: 'bottom',
    delay: 800
  });
  
  sr.reveal('.particles-controls', {
    ...commonReveal,
    origin: 'bottom',
    delay: 1000
  });
  
  sr.reveal('.hero-buttons', {
    ...commonReveal,
    origin: 'bottom',
    delay: 1100
  });
  
  sr.reveal('.social-links', {
    ...commonReveal,
    origin: 'bottom',
    delay: 1200
  });
  
  // Section headers
  sr.reveal('.section-header', {
    ...commonReveal,
    origin: 'top'
  });
  
  // About section
  sr.reveal('.about-image', {
    ...commonReveal,
    origin: 'left',
    distance: '100px'
  });
  
  sr.reveal('.about-text', {
    ...commonReveal,
    origin: 'right',
    distance: '100px'
  });
  
  // Projects section
  sr.reveal('.filter-buttons', {
    ...commonReveal,
    origin: 'top'
  });
  
  // Reveal project cards sequentially
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach((card, index) => {
    sr.reveal(card, {
      ...commonReveal,
      origin: 'bottom',
      interval: 200,
      delay: 300 + (index * 100)
    });
  });
  
  // Experience section - timeline items
  const timelineItems = document.querySelectorAll('.timeline-item');
  timelineItems.forEach((item, index) => {
    sr.reveal(item, {
      ...commonReveal,
      origin: index % 2 === 0 ? 'left' : 'right',
      delay: 300 + (index * 150)
    });
  });
  
  // Contact section
  sr.reveal('.contact-info', {
    ...commonReveal,
    origin: 'left'
  });
  
  sr.reveal('.contact-form', {
    ...commonReveal,
    origin: 'right'
  });
  
  // Animate skill bars after they are revealed
  animateSkills();
}

// Contact Copy to Clipboard
function initContactCopy() {
  const contactCards = document.querySelectorAll('.contact-card[data-copy]');
  const notification = document.querySelector('.copy-notification');
  
  if (!contactCards.length || !notification) return;
  
  contactCards.forEach(card => {
    card.addEventListener('click', async function(e) {
      e.preventDefault();
      
      const textToCopy = this.getAttribute('data-copy');
      
      try {
        // Use modern clipboard API
        await navigator.clipboard.writeText(textToCopy);
        
        // Show notification
        showCopyNotification();
      } catch (err) {
        // Fallback for older browsers
        fallbackCopyTextToClipboard(textToCopy);
      }
    });
  });
  
  function showCopyNotification() {
    notification.classList.add('show');
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 2500);
  }
  
  function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        showCopyNotification();
      }
    } catch (err) {
      console.error('Fallback: Unable to copy', err);
    }
    
    document.body.removeChild(textArea);
  }
}

// Create folder if it doesn't exist
function createAssetsFolders() {
  // This is for informational purposes only - the folders
  // would need to be created server-side or manually
  console.log('Don\'t forget to create the following folder structure:');
  console.log('/assets/');
  console.log('/assets/images/');
  console.log('/assets/resume.pdf');
}

// Call this function to remind about folder creation
createAssetsFolders();

// Initialize lightbox for project images
function initLightbox() {
  const projectImages = document.querySelectorAll('.project-img');
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = document.querySelector('.lightbox-img');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxPrev = document.querySelector('.lightbox-prev');
  const lightboxNext = document.querySelector('.lightbox-next');
  const lightboxCounter = document.querySelector('.lightbox-counter');
  
  let currentProject = null;
  let currentImageIndex = 0;
  let images = [];
  
  // Open lightbox when clicking on project image
  projectImages.forEach(projectImg => {
    projectImg.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Get the project card
      currentProject = projectImg.closest('.project-card');
      
      // Get all images in this project
      images = Array.from(currentProject.querySelectorAll('.project-img-slides img'));
      
      // Get current visible image index
      const projectSlides = currentProject.querySelector('.project-img-slides');
      if (projectSlides) {
        const transform = projectSlides.style.transform || '';
        const match = transform.match(/translateX\(-(\d+)%\)/);
        currentImageIndex = match ? parseInt(match[1]) / 100 : 0;
      } else {
        currentImageIndex = 0;
      }
      
      // Show lightbox with current image
      showLightboxImage();
      lightbox.classList.add('active');
      
      // Prevent scrolling when lightbox is open
      document.body.style.overflow = 'hidden';
    });
  });
  
  // Close lightbox when clicking close button
  if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
  
  // Close lightbox when clicking outside the image
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
  
  // Navigate to previous image
  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', () => {
      if (currentImageIndex > 0) {
        currentImageIndex--;
        showLightboxImage();
      }
    });
  }
  
  // Navigate to next image
  if (lightboxNext) {
    lightboxNext.addEventListener('click', () => {
      if (currentImageIndex < images.length - 1) {
        currentImageIndex++;
        showLightboxImage();
      }
    });
  }
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    } else if (e.key === 'ArrowLeft') {
      if (currentImageIndex > 0) {
        currentImageIndex--;
        showLightboxImage();
      }
    } else if (e.key === 'ArrowRight') {
      if (currentImageIndex < images.length - 1) {
        currentImageIndex++;
        showLightboxImage();
      }
    }
  });
  
  // Function to show the current image in lightbox
  function showLightboxImage() {
    if (images.length === 0) return;
    
    const img = images[currentImageIndex];
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    
    // Update counter
    if (lightboxCounter) {
      lightboxCounter.textContent = `${currentImageIndex + 1} / ${images.length}`;
    }
    
    // Update navigation buttons
    if (lightboxPrev) {
      lightboxPrev.style.visibility = currentImageIndex === 0 ? 'hidden' : 'visible';
    }
    
    if (lightboxNext) {
      lightboxNext.style.visibility = currentImageIndex === images.length - 1 ? 'hidden' : 'visible';
    }
  }
}

// Ambient Particles System
function initAmbientParticles() {
  // Initialize 2D particles in About section
  initAboutParticles();
  
  // Initialize 3D particles in Experience section
  initExperienceParticles();
  
  // Initialize 3D particles in Projects section
  initProjectsParticles();
  
  // Initialize 3D particles in Contact section
  initContactParticles();
}

// 2D Canvas Particles for About Section - Optimized
function initAboutParticles() {
  const canvas = document.getElementById('about-particles');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let width = canvas.offsetWidth;
  let height = canvas.offsetHeight;
  
  canvas.width = width;
  canvas.height = height;
  
  // Center and radii for vertical ellipse
  const centerX = width / 2;
  const centerY = height / 2;
  const baseRadiusX = width * 0.45;
  const baseRadiusY = height * 0.48;
  
  // Reduced particle count for performance
  const particleCount = 60;
  const particles = [];
  const connectionDistance = 100;
  
  // Get colors from CSS
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
  const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim();
  
  // Spatial hash grid for optimized collision detection
  const gridSize = 100;
  const grid = {};
  
  function getGridKey(x, y) {
    const gridX = Math.floor(x / gridSize);
    const gridY = Math.floor(y / gridSize);
    return `${gridX},${gridY}`;
  }
  
  function getNearbyParticles(particle) {
    const keys = [];
    const gridX = Math.floor(particle.x / gridSize);
    const gridY = Math.floor(particle.y / gridSize);
    
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        keys.push(`${gridX + dx},${gridY + dy}`);
      }
    }
    
    const nearby = [];
    keys.forEach(key => {
      if (grid[key]) {
        nearby.push(...grid[key]);
      }
    });
    return nearby;
  }
  
  class Particle2D {
    constructor() {
      this.reset();
    }
    
    reset() {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 0.7;
      this.x = centerX + Math.cos(angle) * baseRadiusX * distance;
      this.y = centerY + Math.sin(angle) * baseRadiusY * distance;
      
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = (Math.random() - 0.5) * 0.8;
      this.radius = Math.random() * 2 + 1;
      this.color = Math.random() > 0.5 ? primaryColor : secondaryColor;
      this.alpha = Math.random() * 0.4 + 0.3;
      this.pulseSpeed = Math.random() * 0.015 + 0.008;
      this.pulsePhase = Math.random() * Math.PI * 2;
    }
    
    update(time, currentRadiusX, currentRadiusY) {
      this.x += this.vx;
      this.y += this.vy;
      
      // Simplified motion
      this.x += Math.sin(time * 0.0005 + this.pulsePhase) * 0.2;
      this.y += Math.cos(time * 0.0005 + this.pulsePhase) * 0.2;
      
      const dx = this.x - centerX;
      const dy = this.y - centerY;
      const normalizedDistance = Math.sqrt(
        (dx * dx) / (currentRadiusX * currentRadiusX) + 
        (dy * dy) / (currentRadiusY * currentRadiusY)
      );
      
      if (normalizedDistance > 0.85) {
        const angle = Math.atan2(dy, dx);
        const force = (normalizedDistance - 0.85) * 0.05;
        this.vx -= Math.cos(angle) * force;
        this.vy -= Math.sin(angle) * force;
      }
      
      if (normalizedDistance > 1) {
        const angle = Math.atan2(dy, dx);
        this.x = centerX + Math.cos(angle) * currentRadiusX * 0.98;
        this.y = centerY + Math.sin(angle) * currentRadiusY * 0.98;
        this.vx *= -0.5;
        this.vy *= -0.5;
      }
      
      this.vx *= 0.98;
      this.vy *= 0.98;
      
      this.currentAlpha = this.alpha + Math.sin(time * this.pulseSpeed) * 0.1;
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = Math.max(0, this.currentAlpha);
      ctx.fill();
    }
  }
  
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle2D());
  }
  
  // Optimized connections using spatial hashing
  function drawConnections() {
    // Clear and rebuild grid
    for (let key in grid) {
      grid[key] = [];
    }
    
    particles.forEach(particle => {
      const key = getGridKey(particle.x, particle.y);
      if (!grid[key]) grid[key] = [];
      grid[key].push(particle);
    });
    
    // Draw connections only for nearby particles
    particles.forEach(particle => {
      const nearby = getNearbyParticles(particle);
      nearby.forEach(other => {
        if (particle === other) return;
        
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < connectionDistance) {
          ctx.beginPath();
          ctx.strokeStyle = particle.color;
          ctx.globalAlpha = (1 - distance / connectionDistance) * 0.2 * particle.currentAlpha;
          ctx.lineWidth = 1;
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      });
    });
  }
  
  let animationStartTime = Date.now();
  let lastFrame = animationStartTime;
  let animationId;
  
  function animate() {
    const currentTime = Date.now();
    const deltaTime = currentTime - lastFrame;
    
    // Frame throttling - only update at ~30fps for performance
    if (deltaTime < 33) {
      animationId = requestAnimationFrame(animate);
      return;
    }
    
    lastFrame = currentTime;
    const elapsedTime = currentTime - animationStartTime;
    
    ctx.clearRect(0, 0, width, height);
    
    const pulseSpeed = 0.0008;
    const pulseAmount = 0.08;
    const currentRadiusX = baseRadiusX + Math.sin(elapsedTime * pulseSpeed) * baseRadiusX * pulseAmount;
    const currentRadiusY = baseRadiusY + Math.sin(elapsedTime * pulseSpeed) * baseRadiusY * pulseAmount;
    
    particles.forEach(particle => {
      particle.update(elapsedTime, currentRadiusX, currentRadiusY);
      particle.draw();
    });
    
    drawConnections();
    
    animationId = requestAnimationFrame(animate);
  }
  
  window.addEventListener('resize', () => {
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;
  });
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  observer.observe(canvas);
}

// 3D Particles for Experience Section - Cool Geometric Shapes
function initExperienceParticles() {
  const container = document.getElementById('experience-ambient-particles');
  if (!container || typeof THREE === 'undefined') return;
  
  const scene = new THREE.Scene();
  
  const camera = new THREE.PerspectiveCamera(
    75,
    container.offsetWidth / container.offsetHeight,
    0.1,
    1000
  );
  camera.position.z = 20;
  
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true 
  });
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);
  
  // Create mixed geometric shapes
  const shapes = [];
  const shapeCount = 25;
  
  // Geometries
  const geometries = [
    new THREE.OctahedronGeometry(0.5),
    new THREE.TetrahedronGeometry(0.6),
    new THREE.IcosahedronGeometry(0.5),
    new THREE.TorusGeometry(0.4, 0.15, 8, 16),
    new THREE.BoxGeometry(0.6, 0.6, 0.6)
  ];
  
  // Materials with wireframe and solid
  const color1 = new THREE.Color(0x6c63ff);
  const color2 = new THREE.Color(0xf50057);
  
  for (let i = 0; i < shapeCount; i++) {
    const geom = geometries[Math.floor(Math.random() * geometries.length)];
    const mixColor = new THREE.Color().lerpColors(color1, color2, Math.random());
    
    const isWireframe = Math.random() > 0.5;
    const material = new THREE.MeshBasicMaterial({
      color: mixColor,
      wireframe: isWireframe,
      transparent: true,
      opacity: isWireframe ? 0.4 : 0.3
    });
    
    const mesh = new THREE.Mesh(geom, material);
    
    // Random position
    mesh.position.x = (Math.random() - 0.5) * 35;
    mesh.position.y = (Math.random() - 0.5) * 25;
    mesh.position.z = (Math.random() - 0.5) * 20;
    
    // Random rotation speeds
    mesh.userData = {
      rotationSpeedX: (Math.random() - 0.5) * 0.02,
      rotationSpeedY: (Math.random() - 0.5) * 0.02,
      rotationSpeedZ: (Math.random() - 0.5) * 0.01,
      floatSpeed: Math.random() * 0.01 + 0.005,
      floatOffset: Math.random() * Math.PI * 2
    };
    
    scene.add(mesh);
    shapes.push(mesh);
  }
  
  // Animation
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    
    time += 0.01;
    
    shapes.forEach((shape, index) => {
      // Rotate shapes
      shape.rotation.x += shape.userData.rotationSpeedX;
      shape.rotation.y += shape.userData.rotationSpeedY;
      shape.rotation.z += shape.userData.rotationSpeedZ;
      
      // Floating motion
      shape.position.y += Math.sin(time + shape.userData.floatOffset) * shape.userData.floatSpeed;
      shape.position.x += Math.cos(time * 0.5 + shape.userData.floatOffset) * 0.01;
      
      // Wrap around
      if (shape.position.y > 15) shape.position.y = -15;
      if (shape.position.y < -15) shape.position.y = 15;
      if (shape.position.x > 20) shape.position.x = -20;
      if (shape.position.x < -20) shape.position.x = 20;
    });
    
    // Gentle scene rotation
    scene.rotation.y += 0.0002;
    
    renderer.render(scene, camera);
  }
  
  window.addEventListener('resize', () => {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
  });
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  observer.observe(container);
}

// 3D Particles for Projects Section - Same as Experience
function initProjectsParticles() {
  const container = document.getElementById('projects-ambient-particles');
  if (!container || typeof THREE === 'undefined') return;
  
  const scene = new THREE.Scene();
  
  const camera = new THREE.PerspectiveCamera(
    75,
    container.offsetWidth / container.offsetHeight,
    0.1,
    1000
  );
  camera.position.z = 20;
  
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true 
  });
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);
  
  // Create mixed geometric shapes (same as Experience section)
  const shapes = [];
  const shapeCount = 25;
  
  // Geometries
  const geometries = [
    new THREE.OctahedronGeometry(0.5),
    new THREE.TetrahedronGeometry(0.6),
    new THREE.IcosahedronGeometry(0.5),
    new THREE.TorusGeometry(0.4, 0.15, 8, 16),
    new THREE.BoxGeometry(0.6, 0.6, 0.6)
  ];
  
  // Materials with wireframe and solid
  const color1 = new THREE.Color(0x6c63ff);
  const color2 = new THREE.Color(0xf50057);
  
  for (let i = 0; i < shapeCount; i++) {
    const geom = geometries[Math.floor(Math.random() * geometries.length)];
    const mixColor = new THREE.Color().lerpColors(color1, color2, Math.random());
    
    const isWireframe = Math.random() > 0.5;
    const material = new THREE.MeshBasicMaterial({
      color: mixColor,
      wireframe: isWireframe,
      transparent: true,
      opacity: isWireframe ? 0.4 : 0.3
    });
    
    const mesh = new THREE.Mesh(geom, material);
    
    // Random position
    mesh.position.x = (Math.random() - 0.5) * 35;
    mesh.position.y = (Math.random() - 0.5) * 25;
    mesh.position.z = (Math.random() - 0.5) * 20;
    
    // Random rotation speeds
    mesh.userData = {
      rotationSpeedX: (Math.random() - 0.5) * 0.02,
      rotationSpeedY: (Math.random() - 0.5) * 0.02,
      rotationSpeedZ: (Math.random() - 0.5) * 0.01,
      floatSpeed: Math.random() * 0.01 + 0.005,
      floatOffset: Math.random() * Math.PI * 2
    };
    
    scene.add(mesh);
    shapes.push(mesh);
  }
  
  // Animation
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    
    time += 0.01;
    
    shapes.forEach((shape, index) => {
      // Rotate shapes
      shape.rotation.x += shape.userData.rotationSpeedX;
      shape.rotation.y += shape.userData.rotationSpeedY;
      shape.rotation.z += shape.userData.rotationSpeedZ;
      
      // Floating motion
      shape.position.y += Math.sin(time + shape.userData.floatOffset) * shape.userData.floatSpeed;
      shape.position.x += Math.cos(time * 0.5 + shape.userData.floatOffset) * 0.01;
      
      // Wrap around
      if (shape.position.y > 15) shape.position.y = -15;
      if (shape.position.y < -15) shape.position.y = 15;
      if (shape.position.x > 20) shape.position.x = -20;
      if (shape.position.x < -20) shape.position.x = 20;
    });
    
    // Gentle scene rotation
    scene.rotation.y += 0.0002;
    
    renderer.render(scene, camera);
  }
  
  window.addEventListener('resize', () => {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
  });
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  observer.observe(container);
}

// 3D Particles for Contact Section - Same as Experience & Projects
function initContactParticles() {
  const container = document.getElementById('contact-ambient-particles');
  if (!container || typeof THREE === 'undefined') return;
  
  const scene = new THREE.Scene();
  
  const camera = new THREE.PerspectiveCamera(
    75,
    container.offsetWidth / container.offsetHeight,
    0.1,
    1000
  );
  camera.position.z = 20;
  
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true 
  });
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);
  
  // Create mixed geometric shapes (same as Experience & Projects sections)
  const shapes = [];
  const shapeCount = 25;
  
  // Geometries
  const geometries = [
    new THREE.OctahedronGeometry(0.5),
    new THREE.TetrahedronGeometry(0.6),
    new THREE.IcosahedronGeometry(0.5),
    new THREE.TorusGeometry(0.4, 0.15, 8, 16),
    new THREE.BoxGeometry(0.6, 0.6, 0.6)
  ];
  
  // Materials with wireframe and solid
  const color1 = new THREE.Color(0x6c63ff);
  const color2 = new THREE.Color(0xf50057);
  
  for (let i = 0; i < shapeCount; i++) {
    const geom = geometries[Math.floor(Math.random() * geometries.length)];
    const mixColor = new THREE.Color().lerpColors(color1, color2, Math.random());
    
    const isWireframe = Math.random() > 0.5;
    const material = new THREE.MeshBasicMaterial({
      color: mixColor,
      wireframe: isWireframe,
      transparent: true,
      opacity: isWireframe ? 0.4 : 0.3
    });
    
    const mesh = new THREE.Mesh(geom, material);
    
    // Random position
    mesh.position.x = (Math.random() - 0.5) * 35;
    mesh.position.y = (Math.random() - 0.5) * 25;
    mesh.position.z = (Math.random() - 0.5) * 20;
    
    // Random rotation speeds
    mesh.userData = {
      rotationSpeedX: (Math.random() - 0.5) * 0.02,
      rotationSpeedY: (Math.random() - 0.5) * 0.02,
      rotationSpeedZ: (Math.random() - 0.5) * 0.01,
      floatSpeed: Math.random() * 0.01 + 0.005,
      floatOffset: Math.random() * Math.PI * 2
    };
    
    scene.add(mesh);
    shapes.push(mesh);
  }
  
  // Animation
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    
    time += 0.01;
    
    shapes.forEach((shape, index) => {
      // Rotate shapes
      shape.rotation.x += shape.userData.rotationSpeedX;
      shape.rotation.y += shape.userData.rotationSpeedY;
      shape.rotation.z += shape.userData.rotationSpeedZ;
      
      // Floating motion
      shape.position.y += Math.sin(time + shape.userData.floatOffset) * shape.userData.floatSpeed;
      shape.position.x += Math.cos(time * 0.5 + shape.userData.floatOffset) * 0.01;
      
      // Wrap around
      if (shape.position.y > 15) shape.position.y = -15;
      if (shape.position.y < -15) shape.position.y = 15;
      if (shape.position.x > 20) shape.position.x = -20;
      if (shape.position.x < -20) shape.position.x = 20;
    });
    
    // Gentle scene rotation
    scene.rotation.y += 0.0002;
    
    renderer.render(scene, camera);
  }
  
  window.addEventListener('resize', () => {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
  });
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  observer.observe(container);
} 