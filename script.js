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
  const roles = ['Web Developer', 'UI/UX Designer', 'Problem Solver', 'Creative Thinker'];
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
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active class from all buttons
      filterBtns.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      const filterValue = this.getAttribute('data-filter');
      
      projectCards.forEach(card => {
        if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 100);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

// Skill Bars Animation
function initSkillAnimation() {
  const skillLevels = document.querySelectorAll('.skill-level');
  
  function animateSkills() {
    skillLevels.forEach(level => {
      const width = level.getAttribute('style').match(/width: (\d+)%/)[1];
      level.style.width = '0%';
      
      setTimeout(() => {
        level.style.width = width + '%';
      }, 200);
    });
  }
  
  // Animate skills when they come into view
  const skillsSection = document.querySelector('.skills');
  
  if (skillsSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateSkills();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(skillsSection);
  }
}

// Animations on scroll
function initAnimations() {
  const animatedElements = document.querySelectorAll('.hero-content, .about-content, .section-header, .projects-grid, .timeline, .contact-content');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeIn 1s ease forwards';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  animatedElements.forEach(element => {
    element.style.opacity = '0';
    observer.observe(element);
  });
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