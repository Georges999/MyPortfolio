# Modern Portfolio Website

A modern, interactive, and responsive portfolio website template designed to showcase your work, skills, and experience in a visually appealing way.

## Features

- **Single Page Design** - Smooth scrolling navigation between sections
- **Responsive Layout** - Looks great on all devices (mobile, tablet, desktop)
- **Dark/Light Mode** - Toggle between dark and light themes
- **Interactive Elements** - Animations, typing effect, skill bars, and more
- **Project Filtering** - Filter projects by category
- **Custom Cursor** - Enhanced cursor experience on desktop
- **Contact Form** - Ready-to-use contact form with validation
- **Timeline Design** - Showcase your experience with a stylish timeline
- **Modern UI** - Clean, modern design with smooth animations
- **Interactive Particle System** - Eye-catching WebGL-powered flowing particles

## Getting Started

### Prerequisites

- A web browser
- Basic knowledge of HTML, CSS, and JavaScript (for customization)
- A code editor (VS Code, Sublime Text, etc.)

### Setup

1. Clone or download this repository
2. Open the project in your code editor
3. Customize the content to make it your own
4. Add your images to the `assets/images` directory
5. Add your resume/CV to the `assets` directory as `resume.pdf`
6. Test the website locally
7. Deploy to your preferred hosting platform

## Customization Guide

### Personal Information

Edit the `index.html` file to update:

- Your name and title
- About me section
- Skills and proficiency levels
- Experience timeline
- Contact information

### Portfolio Projects

In the `index.html` file, find the projects section and:

1. Add your project images to `assets/images/`
2. Update the project cards with:
   - Project title
   - Description
   - Technologies used
   - Links to live demo and source code

### Profile Picture

1. Replace `assets/profile.jpg` with your own photo
2. Ensure the image is square or nearly square for best results

### Resume/CV

Add your resume as `assets/resume.pdf` for the download button to work properly.

### Colors and Styling

To change the color scheme:

1. Open `styles.css`
2. Find the `:root` section at the top
3. Modify the color variables to your preference:
   ```css
   :root {
     --primary-color: #6c63ff; /* Main accent color */
     --secondary-color: #f50057; /* Secondary accent color */
     /* other variables */
   }
   ```

### Typing Effect Text

To modify the typing effect text:

1. Open `script.js`
2. Find the `initTypingEffect` function
3. Update the `roles` array with your own titles:
   ```javascript
   const roles = ['Web Developer', 'UI/UX Designer', 'Your Custom Role'];
   ```

## Advanced Customization

### Adding New Sections

To add a new section:

1. Create a new section in `index.html` following the existing pattern
2. Add appropriate CSS in `styles.css`
3. If needed, add JavaScript functionality in `script.js`
4. Update the navigation links in the header

### Adding Custom Animations

Additional animations can be added by:

1. Adding new keyframes in the CSS
2. Applying them to elements as needed
3. Potentially triggering them with JavaScript

## Browser Support

This template is compatible with all modern browsers:
- Chrome
- Firefox
- Safari
- Edge
- Opera

## License

This project is open source and available for personal and commercial use.

## Acknowledgments

- Font Awesome for icons
- Google Fonts for typography
- Unsplash for demo images (if used)

---

Customize this template to create your dream portfolio and showcase your work to the world!

### Interactive Particle System

The portfolio includes a stunning interactive particle system that adds visual flair to your site:

1. **Shape Transformations**: Watch as thousands of particles morph between different shapes (sphere, cube, helix)
2. **Mouse Interaction**: Particles react to your mouse movements, creating an engaging experience
3. **Color Transitions**: Cycle through different color palettes with a single click
4. **Smooth Animations**: Particles flow naturally with physics-based movement
5. **Dark Mode Compatibility**: The system adapts to your site's dark/light theme

To customize the particle system:
```javascript
// In particles.js:
// Change the color palettes to match your brand
this.colorPalettes = [
  { base: new THREE.Color(0x6c63ff), accent: new THREE.Color(0xf50057) }, // Purple & Pink
  { base: new THREE.Color(0x00bcd4), accent: new THREE.Color(0x4caf50) }, // Cyan & Green
  // Add your own brand colors
];

// Adjust particle count for performance vs visual density
this.particleCount = 3000; // Lower for better performance, higher for more visual impact
```
