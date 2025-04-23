/**
 * Advanced Animations for DevCraft
 */

// We'll initialize these functions from layout.ejs
// to ensure they're called after all DOM elements are loaded

/**
 * Initialize scroll reveal animations
 */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');

    function checkReveal() {
        const windowHeight = window.innerHeight;
        const revealPoint = 150;

        revealElements.forEach(element => {
            const revealTop = element.getBoundingClientRect().top;

            if (revealTop < windowHeight - revealPoint) {
                element.classList.add('active');
            } else {
                element.classList.remove('active');
            }
        });
    }

    window.addEventListener('scroll', checkReveal);
    window.addEventListener('resize', checkReveal);

    // Check on initial load
    checkReveal();
}

/**
 * Initialize particle animation
 */
function initParticles() {
    const particlesContainer = document.querySelector('.particles');

    if (particlesContainer) {
        const numberOfParticles = 50;

        for (let i = 0; i < numberOfParticles; i++) {
            createParticle(particlesContainer);
        }
    }
}

/**
 * Create a single particle
 */
function createParticle(container) {
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

    container.appendChild(particle);
}

/**
 * Initialize animated counters
 */
function initCounters() {
    const counters = document.querySelectorAll('.counter');

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = parseInt(counter.getAttribute('data-duration') || 2000);
        const increment = target / (duration / 16); // 60fps

        let current = 0;

        function updateCounter() {
            current += increment;

            if (current < target) {
                counter.textContent = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(counter);
    });
}

/**
 * Initialize staggered animations for lists
 */
function initStaggeredAnimations() {
    const staggeredLists = document.querySelectorAll('.staggered-list');

    staggeredLists.forEach(list => {
        const items = list.querySelectorAll('.staggered-item');

        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    items.forEach(item => {
                        item.classList.add('fade-in');
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(list);
    });
}

/**
 * Initialize parallax effect
 */
function initParallax() {
    const parallaxElements = document.querySelectorAll('.parallax');

    function updateParallax() {
        parallaxElements.forEach(element => {
            const speed = element.getAttribute('data-parallax-speed') || 0.5;
            const scrollPosition = window.pageYOffset;
            element.style.transform = `translateY(${scrollPosition * speed}px)`;
        });
    }

    window.addEventListener('scroll', updateParallax);

    // Initial update
    updateParallax();
}

/**
 * Initialize typing effect
 */
function initTypingEffect() {
    const typingElements = document.querySelectorAll('.typing-effect');

    typingElements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        element.classList.add('typing');

        let i = 0;
        const speed = element.getAttribute('data-typing-speed') || 100;

        function typeWriter() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            }
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    typeWriter();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(element);
    });
}

/**
 * Create shapes for background decoration
 */
function createShapes(container, count = 5) {
    const shapes = ['circle', 'blob', 'triangle', 'square', 'hexagon'];

    for (let i = 0; i < count; i++) {
        const shape = document.createElement('div');
        const shapeType = shapes[Math.floor(Math.random() * shapes.length)];

        shape.classList.add('shape', `shape-${shapeType}`);

        // Random size between 50px and 200px
        const size = Math.random() * 150 + 50;
        shape.style.width = `${size}px`;
        shape.style.height = `${size}px`;

        // Random position
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        shape.style.left = `${posX}%`;
        shape.style.top = `${posY}%`;

        // Random color
        const colors = [
            'rgba(124, 58, 237, 0.1)',  // Purple
            'rgba(59, 130, 246, 0.1)',  // Blue
            'rgba(16, 185, 129, 0.1)',  // Green
            'rgba(245, 158, 11, 0.1)',  // Yellow
            'rgba(239, 68, 68, 0.1)'    // Red
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        shape.style.backgroundColor = color;

        // Random rotation
        const rotation = Math.random() * 360;
        shape.style.transform = `rotate(${rotation}deg)`;

        // Random animation
        const animations = ['spin-slow', 'float', 'pulse'];
        const animation = animations[Math.floor(Math.random() * animations.length)];
        shape.classList.add(animation);

        container.appendChild(shape);
    }
}

/**
 * Initialize FAQ accordions
 */
function initFaqAccordions() {
    const faqToggles = document.querySelectorAll('.faq-toggle');

    if (faqToggles.length > 0) {
        faqToggles.forEach(toggle => {
            toggle.addEventListener('click', function() {
                const content = this.nextElementSibling;
                const icon = this.querySelector('i');
                content.classList.toggle('hidden');
                icon.classList.toggle('transform');
                icon.classList.toggle('rotate-180');
            });
        });
    }
}

// Export functions for external use
window.DevCraftAnimations = {
    createShapes,
    createParticle,
    initScrollReveal,
    initParticles,
    initCounters,
    initStaggeredAnimations,
    initParallax,
    initTypingEffect,
    initFaqAccordions
};
