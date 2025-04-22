/**
 * DevCraft - Main JavaScript File
 * Version: 2.0.0
 * Description: Enhanced JavaScript functionality for the DevCraft application
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations
    initAnimations();

    // Initialize modals
    initModals();

    // Initialize tabs
    initTabs();

    // Initialize dropdowns
    initDropdowns();

    // Initialize alerts
    initAlerts();
    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    if (sidebarToggle && sidebar && mainContent) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('sidebar-collapsed');
            mainContent.classList.toggle('main-content-expanded');
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Close mobile menu if open
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }

                // Scroll to target
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // FAQ accordion
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

    // Form validation
    const forms = document.querySelectorAll('form');

    if (forms.length > 0) {
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                const requiredFields = form.querySelectorAll('[required]');
                let isValid = true;

                requiredFields.forEach(field => {
                    if (!field.value.trim()) {
                        isValid = false;
                        field.classList.add('border-red-500');

                        // Add error message if it doesn't exist
                        let errorMessage = field.nextElementSibling;
                        if (!errorMessage || !errorMessage.classList.contains('error-message')) {
                            errorMessage = document.createElement('p');
                            errorMessage.classList.add('error-message', 'text-red-500', 'text-xs', 'mt-1');
                            errorMessage.textContent = 'Ce champ est requis';
                            field.parentNode.insertBefore(errorMessage, field.nextSibling);
                        }
                    } else {
                        field.classList.remove('border-red-500');

                        // Remove error message if it exists
                        const errorMessage = field.nextElementSibling;
                        if (errorMessage && errorMessage.classList.contains('error-message')) {
                            errorMessage.remove();
                        }
                    }
                });

                if (!isValid) {
                    e.preventDefault();
                }
            });
        });
    }

    // Password strength meter
    const passwordInputs = document.querySelectorAll('input[type="password"]');

    if (passwordInputs.length > 0) {
        passwordInputs.forEach(input => {
            if (input.id === 'password') {
                input.addEventListener('input', function() {
                    const password = this.value;
                    let strength = 0;

                    // Check password length
                    if (password.length >= 8) {
                        strength += 1;
                    }

                    // Check for lowercase letters
                    if (password.match(/[a-z]/)) {
                        strength += 1;
                    }

                    // Check for uppercase letters
                    if (password.match(/[A-Z]/)) {
                        strength += 1;
                    }

                    // Check for numbers
                    if (password.match(/[0-9]/)) {
                        strength += 1;
                    }

                    // Check for special characters
                    if (password.match(/[^a-zA-Z0-9]/)) {
                        strength += 1;
                    }

                    // Update strength meter if it exists
                    const strengthMeter = document.getElementById('password-strength');
                    if (strengthMeter) {
                        strengthMeter.value = strength;

                        // Update strength text
                        const strengthText = document.getElementById('password-strength-text');
                        if (strengthText) {
                            switch (strength) {
                                case 0:
                                case 1:
                                    strengthText.textContent = 'Faible';
                                    strengthText.className = 'text-red-500 text-xs';
                                    break;
                                case 2:
                                case 3:
                                    strengthText.textContent = 'Moyen';
                                    strengthText.className = 'text-yellow-500 text-xs';
                                    break;
                                case 4:
                                case 5:
                                    strengthText.textContent = 'Fort';
                                    strengthText.className = 'text-green-500 text-xs';
                                    break;
                            }
                        }
                    }
                });
            }
        });
    }

    // Initialize tooltips
    const tooltips = document.querySelectorAll('[data-tooltip]');

    if (tooltips.length > 0) {
        tooltips.forEach(tooltip => {
            tooltip.addEventListener('mouseenter', function() {
                const tooltipText = this.getAttribute('data-tooltip');
                const tooltipElement = document.createElement('div');

                tooltipElement.classList.add('tooltip', 'absolute', 'bg-gray-800', 'text-white', 'text-xs', 'px-2', 'py-1', 'rounded', 'z-50');
                tooltipElement.textContent = tooltipText;

                document.body.appendChild(tooltipElement);

                const rect = this.getBoundingClientRect();
                tooltipElement.style.top = `${rect.top - tooltipElement.offsetHeight - 5}px`;
                tooltipElement.style.left = `${rect.left + (rect.width / 2) - (tooltipElement.offsetWidth / 2)}px`;
            });

            tooltip.addEventListener('mouseleave', function() {
                const tooltipElement = document.querySelector('.tooltip');
                if (tooltipElement) {
                    tooltipElement.remove();
                }
            });
        });
    }

    // Initialize animations
    initAnimations();
});

/**
 * Initialize animations for elements
 */
function initAnimations() {
    // Fade in elements on scroll
    const fadeElements = document.querySelectorAll('.fade-in-on-scroll');

    const fadeInOnScroll = () => {
        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animate-fade-in');
            }
        });
    };

    window.addEventListener('scroll', fadeInOnScroll);
    fadeInOnScroll(); // Check on initial load

    // Slide up elements on scroll
    const slideElements = document.querySelectorAll('.slide-up-on-scroll');

    const slideUpOnScroll = () => {
        slideElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animate-slide-up');
            }
        });
    };

    window.addEventListener('scroll', slideUpOnScroll);
    slideUpOnScroll(); // Check on initial load

    // Staggered animations for lists
    const staggeredLists = document.querySelectorAll('.staggered-list');

    staggeredLists.forEach(list => {
        const items = list.querySelectorAll('.staggered-item');

        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
        });
    });
}

/**
 * Initialize modals
 */
function initModals() {
    const modalTriggers = document.querySelectorAll('[data-modal]');

    modalTriggers.forEach(trigger => {
        const modalId = trigger.getAttribute('data-modal');
        const modal = document.getElementById(modalId);

        if (modal) {
            // Open modal
            trigger.addEventListener('click', () => {
                modal.classList.remove('hidden');
                document.body.classList.add('overflow-hidden');

                // Add animation
                setTimeout(() => {
                    const modalContent = modal.querySelector('.modal-content');
                    if (modalContent) {
                        modalContent.classList.add('modal-content-visible');
                    }
                }, 10);
            });

            // Close modal
            const closeButtons = modal.querySelectorAll('[data-modal-close]');
            closeButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const modalContent = modal.querySelector('.modal-content');
                    if (modalContent) {
                        modalContent.classList.remove('modal-content-visible');
                    }

                    setTimeout(() => {
                        modal.classList.add('hidden');
                        document.body.classList.remove('overflow-hidden');
                    }, 300);
                });
            });

            // Close modal when clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    const modalContent = modal.querySelector('.modal-content');
                    if (modalContent) {
                        modalContent.classList.remove('modal-content-visible');
                    }

                    setTimeout(() => {
                        modal.classList.add('hidden');
                        document.body.classList.remove('overflow-hidden');
                    }, 300);
                }
            });
        }
    });
}

/**
 * Initialize tabs
 */
function initTabs() {
    const tabGroups = document.querySelectorAll('[data-tabs]');

    tabGroups.forEach(tabGroup => {
        const tabs = tabGroup.querySelectorAll('[data-tab]');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                const tabContent = document.getElementById(tabId);

                if (tabContent) {
                    // Deactivate all tabs
                    tabs.forEach(t => t.classList.remove('active-tab'));

                    // Hide all tab contents
                    const tabContents = document.querySelectorAll(`[data-tab-content="${tabGroup.getAttribute('data-tabs')}"]`);
                    tabContents.forEach(content => content.classList.add('hidden'));

                    // Activate current tab
                    tab.classList.add('active-tab');

                    // Show current tab content
                    tabContent.classList.remove('hidden');
                }
            });
        });

        // Activate first tab by default
        const firstTab = tabs[0];
        if (firstTab) {
            firstTab.click();
        }
    });
}

/**
 * Initialize dropdowns
 */
function initDropdowns() {
    const dropdownButtons = document.querySelectorAll('[data-dropdown]');

    dropdownButtons.forEach(button => {
        const dropdownId = button.getAttribute('data-dropdown');
        const dropdown = document.getElementById(dropdownId);

        if (dropdown) {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('hidden');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target) && e.target !== button) {
                    dropdown.classList.add('hidden');
                }
            });
        }
    });
}

/**
 * Initialize alerts
 */
function initAlerts() {
    const alertCloseButtons = document.querySelectorAll('.alert-close');

    alertCloseButtons.forEach(button => {
        button.addEventListener('click', () => {
            const alert = button.closest('.alert');
            if (alert) {
                alert.style.opacity = '0';
                alert.style.transform = 'translateY(-10px)';

                setTimeout(() => {
                    alert.remove();
                }, 300);
            }
        });
    });
}
