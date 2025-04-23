/**
 * Debug script for DevCraft
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Debug script loaded');
    
    // Check if CSS files are loaded
    const cssFiles = Array.from(document.styleSheets);
    console.log('CSS files loaded:', cssFiles.map(css => css.href));
    
    // Check if JavaScript files are loaded
    const scripts = Array.from(document.scripts);
    console.log('JavaScript files loaded:', scripts.map(script => script.src));
    
    // Check if animations.js is loaded and functions are available
    if (typeof window.DevCraftAnimations !== 'undefined') {
        console.log('DevCraftAnimations is available:', Object.keys(window.DevCraftAnimations));
    } else {
        console.error('DevCraftAnimations is not available');
    }
    
    // Check if elements with animations exist
    const animatedElements = {
        'reveal': document.querySelectorAll('.reveal'),
        'floating': document.querySelectorAll('.floating'),
        'staggered-item': document.querySelectorAll('.staggered-item'),
        'particles': document.querySelectorAll('.particles'),
        'counter': document.querySelectorAll('.counter'),
        'typewriter': document.querySelectorAll('.typewriter'),
        'background-animate': document.querySelectorAll('.background-animate'),
        'dots-pattern': document.querySelectorAll('.dots-pattern')
    };
    
    console.log('Animated elements found:');
    for (const [className, elements] of Object.entries(animatedElements)) {
        console.log(`${className}: ${elements.length}`);
    }
    
    // Manually activate animations if needed
    setTimeout(function() {
        console.log('Manually activating animations...');
        
        // Activate reveal animations
        document.querySelectorAll('.reveal').forEach(element => {
            element.classList.add('active');
            console.log('Activated reveal element:', element);
        });
        
        // Create particles if needed
        const particlesContainer = document.querySelector('.particles');
        if (particlesContainer && particlesContainer.children.length === 0) {
            console.log('Creating particles manually...');
            for (let i = 0; i < 50; i++) {
                const particle = document.createElement('div');
                particle.classList.add('particle');
                
                // Random size between 5px and 20px
                const size = Math.random() * 15 + 5;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                
                // Random position
                const posX = Math.random() * 100;
                const posY = Math.random() * 100;
                particle.style.left = `${posX}%`;
                particle.style.top = `${posY}%`;
                
                // Random color
                const colors = [
                    'rgba(124, 58, 237, 0.5)',  // Purple
                    'rgba(59, 130, 246, 0.5)',  // Blue
                    'rgba(16, 185, 129, 0.5)',  // Green
                    'rgba(245, 158, 11, 0.5)',  // Yellow
                    'rgba(239, 68, 68, 0.5)'    // Red
                ];
                const color = colors[Math.floor(Math.random() * colors.length)];
                particle.style.backgroundColor = color;
                
                // Random animation duration between 15s and 30s
                const duration = Math.random() * 15 + 15;
                particle.style.animationDuration = `${duration}s`;
                
                // Random animation delay
                const delay = Math.random() * 10;
                particle.style.animationDelay = `${delay}s`;
                
                particlesContainer.appendChild(particle);
            }
        }
        
        // Activate counters
        document.querySelectorAll('.counter').forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            if (counter.textContent === '0' && target > 0) {
                console.log('Manually activating counter:', counter);
                let current = 0;
                const increment = target / 50;
                const interval = setInterval(function() {
                    current += increment;
                    if (current >= target) {
                        counter.textContent = target;
                        clearInterval(interval);
                    } else {
                        counter.textContent = Math.ceil(current);
                    }
                }, 50);
            }
        });
    }, 1000);
});
