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
  initContactForm();
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

// Custom Cursorfunction initCustomCursor() {  // Cursor functionality removed to eliminate white flash effect}

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

// Project Filtering
function initProjectFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  
  // Function to filter projects
  function filterProjects(filterValue) {
    console.log("Filtering projects:", filterValue); // Debug
    
    projectCards.forEach((card, index) => {
      const cardCategory = card.getAttribute('data-category');
      console.log("Card category:", cardCategory); // Debug
      
      card.style.transform = 'scale(0.8) translateY(50px)';
      card.style.opacity = '0';
      
      setTimeout(() => {
        if (filterValue === 'all' || cardCategory === filterValue) {
          card.style.display = 'block';
          // Add a staggered delay based on the index
          setTimeout(() => {
            card.style.transform = 'scale(1) translateY(0)';
            card.style.opacity = '1';
          }, 50 * index);
        } else {
          card.style.display = 'none';
        }
      }, 300);
    });
  }
  
  // Set up click events for filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active class from all buttons
      filterBtns.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      const filterValue = this.getAttribute('data-filter');
      filterProjects(filterValue);
    });
  });
  
  // Initialize with "all" filter active
  const activeFilterBtn = document.querySelector('.filter-btn.active');
  if (activeFilterBtn) {
    const initialFilter = activeFilterBtn.getAttribute('data-filter');
    filterProjects(initialFilter);
  }
  
  // Initialize dynamic project cards with 3D tilt effect
  initDynamicProjectCards();
  
  // Initialize project image navigation
  initProjectImageNavigation();
}

// Dynamic Project Cards with 3D Tilt Effect
function initDynamicProjectCards() {
  const projectCards = document.querySelectorAll('.project-card');
  
  projectCards.forEach(card => {
    // Store initial background state
    const projectImg = card.querySelector('.project-img img');
    const initialTransform = projectImg.style.transform;
    
    // Add tilt effect on mouse move
    card.addEventListener('mousemove', (e) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenterX = cardRect.left + cardRect.width / 2;
      const cardCenterY = cardRect.top + cardRect.height / 2;
      
      // Calculate mouse position relative to card center (from -1 to 1)
      const relativeX = (e.clientX - cardCenterX) / (cardRect.width / 2);
      const relativeY = (e.clientY - cardCenterY) / (cardRect.height / 2);
      
      // Apply tilt effect with less intensity for better usability
      const tiltAmount = 5; // Reduced from 10
      card.style.transform = `perspective(1000px) rotateY(${relativeX * tiltAmount}deg) rotateX(${-relativeY * tiltAmount}deg) scale(1.03)`;
      
      // Create parallax effect for the image with subtle movement
      if (projectImg) {
        projectImg.style.transform = `translateX(${relativeX * -10}px) translateY(${relativeY * -10}px) scale(1.1)`;
      }
      
      // Dynamic light reflection effect
      const glare = card.querySelector('.card-glare') || document.createElement('div');
      if (!card.querySelector('.card-glare')) {
        glare.classList.add('card-glare');
        card.appendChild(glare);
      }
      
      // Position the glare based on mouse movement
      glare.style.background = `radial-gradient(circle at ${e.clientX - cardRect.left}px ${e.clientY - cardRect.top}px, 
                              rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)`;
    });
    
    // Reset card on mouse leave
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale(1)';
      if (projectImg) {
        projectImg.style.transform = initialTransform || 'none';
      }
      
      const glare = card.querySelector('.card-glare');
      if (glare) {
        glare.style.opacity = '0';
        setTimeout(() => {
          if (glare.parentElement === card) {
            card.removeChild(glare);
          }
        }, 300);
      }
    });
    
    // Add click animation
    card.addEventListener('mousedown', () => {
      card.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale(0.98)';
    });
    
    card.addEventListener('mouseup', () => {
      card.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale(1.03)';
    });
  });
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
      slideWidth = slides.offsetWidth;
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

    // Handle window resize
    window.addEventListener('resize', () => {
      slideWidth = slides.offsetWidth;
      updateSlidePosition();
    });

    // Initialize
    updateNavigation();
  });
}

// Interactive Skills Visualization
function initSkillAnimation() {
  const canvas = document.getElementById('skills-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const skillTags = document.querySelectorAll('.skill-tag');
  
  // Skills data from the tags
  const skills = [];
  skillTags.forEach(tag => {
    skills.push({
      name: tag.getAttribute('data-skill'),
      value: parseInt(tag.getAttribute('data-value')),
      color: getComputedStyle(document.documentElement).getPropertyValue('--primary-color'),
      accentColor: getComputedStyle(document.documentElement).getPropertyValue('--secondary-color'),
      x: 0,
      y: 0,
      radius: 0,
      targetRadius: 0,
      highlighted: false,
      hovering: false,
    });
  });

  // Set canvas size
  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Position skills
  function positionSkills() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.35;
    
    skills.forEach((skill, i) => {
      const angleStep = (2 * Math.PI) / skills.length;
      const angle = i * angleStep;
      
      // Position in a circle
      skill.x = centerX + Math.cos(angle) * maxRadius * 0.8;
      skill.y = centerY + Math.sin(angle) * maxRadius * 0.8;
      
      // Size based on skill value
      skill.targetRadius = (skill.value / 100) * maxRadius * 0.5 + 20;
      skill.radius = 0; // Start with zero radius for animation
    });
  }
  
  // Mouse interaction
  let mouseX = 0;
  let mouseY = 0;
  
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    
    // Check if mouse is hovering over any skill
    skills.forEach(skill => {
      const dist = Math.hypot(skill.x - mouseX, skill.y - mouseY);
      skill.hovering = dist < skill.radius;
    });
  });
  
  canvas.addEventListener('click', () => {
    // Toggle highlight on click
    skills.forEach(skill => {
      if (skill.hovering) {
        skill.highlighted = !skill.highlighted;
      }
    });
  });
  
  // Handle skill tag clicks
  skillTags.forEach((tag, index) => {
    tag.addEventListener('click', () => {
      skillTags.forEach(t => t.classList.remove('active'));
      tag.classList.add('active');
      
      // Reset all highlights then highlight the selected one
      skills.forEach(s => s.highlighted = false);
      skills[index].highlighted = true;
    });
  });
  
  // Draw the visualization
  function drawSkills() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections between skills
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(108, 99, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < skills.length; i++) {
      for (let j = i + 1; j < skills.length; j++) {
        ctx.moveTo(skills[i].x, skills[i].y);
        ctx.lineTo(skills[j].x, skills[j].y);
      }
    }
    ctx.stroke();
    
    // Draw skills bubbles
    skills.forEach(skill => {
      // Animate radius
      skill.radius += (skill.targetRadius - skill.radius) * 0.1;
      
      // Create gradient
      const gradient = ctx.createRadialGradient(
        skill.x, skill.y, 0,
        skill.x, skill.y, skill.radius
      );
      
      if (skill.highlighted || skill.hovering) {
        // Highlighted state
        gradient.addColorStop(0, skill.accentColor + '99');
        gradient.addColorStop(1, skill.accentColor + '22');
        ctx.shadowBlur = 15;
        ctx.shadowColor = skill.accentColor;
      } else {
        // Normal state
        gradient.addColorStop(0, skill.color + '77');
        gradient.addColorStop(1, skill.color + '11');
        ctx.shadowBlur = 0;
      }
      
      // Draw circle
      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(skill.x, skill.y, skill.radius, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw text
      ctx.font = `${Math.max(12, skill.radius * 0.3)}px Poppins, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = skill.highlighted || skill.hovering ? '#ffffff' : '#333333';
      if (document.body.classList.contains('dark-mode')) {
        ctx.fillStyle = skill.highlighted || skill.hovering ? '#ffffff' : '#f0f0f0';
      }
      ctx.fillText(skill.name, skill.x, skill.y - 10);
      ctx.fillText(`${skill.value}%`, skill.x, skill.y + 10);
    });
    
    // Animate connections to mouse when hovering
    if (skills.some(s => s.hovering)) {
      const hoveringSkill = skills.find(s => s.hovering);
      
      ctx.beginPath();
      ctx.strokeStyle = hoveringSkill.accentColor + '66';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.moveTo(mouseX, mouseY);
      ctx.lineTo(hoveringSkill.x, hoveringSkill.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    requestAnimationFrame(drawSkills);
  }
  
  function animateSkills() {
    positionSkills();
    drawSkills();
  }
  
  // Initialize skills animation
  const skillsSection = document.querySelector('.skills');
  
  if (skillsSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateSkills();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    
    observer.observe(skillsSection);
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

// Contact Form Validation and Submit
function initContactForm() {
  const contactForm = document.querySelector('.contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Basic form validation
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const subject = document.getElementById('subject').value;
      const message = document.getElementById('message').value;
      
      if (!name || !email || !subject || !message) {
        alert('Please fill in all fields');
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
      }
      
      // Simulate form submission (replace with actual form submission)
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      
      setTimeout(() => {
        contactForm.reset();
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
        
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }, 3000);
      }, 2000);
    });
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