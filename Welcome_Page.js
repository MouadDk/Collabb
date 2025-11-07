document.addEventListener('DOMContentLoaded', () => {
    // Prevent multiple executions
    if (window.isPageLoaded) return;
    window.isPageLoaded = true;
    
    const navButtons = document.querySelectorAll('.nav-buttons a');
    const loggedInUser = localStorage.getItem('loggedInUser');

    // Handle navigation buttons based on login status
    navButtons.forEach(button => {
        const buttonText = button.textContent.trim();

        if (buttonText === "Commencer maintenant" || buttonText === "Commencer gratuitement") {
            if (loggedInUser) {
                button.href = 'index.html';
                button.textContent = 'Accéder au tableau de bord';
            } else {
                button.href = 'sign_up.html';
            }
        } else if (buttonText === "Se connecter") {
            if (loggedInUser) {
                button.textContent = 'Déconnexion';
                button.href = '#';
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('loggedInUser');
                    window.location.href = 'Login_page.html';
                });
            } else {
                button.href = 'Login_page.html';
            }
        }
    });

    // Typing effect for tagline
    const tagline = document.getElementById('tagline');
    if (tagline) {
        const text = tagline.textContent;
        tagline.textContent = '';
        let index = 0;
        
        function typeWriter() {
            if (index < text.length) {
                tagline.textContent += text.charAt(index);
                index++;
                setTimeout(typeWriter, 80);
            }
        }
        
        setTimeout(typeWriter, 500);
    }

    // Animated counter for statistics
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const animateCounter = (element) => {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target + (element.parentElement.querySelector('.stat-label').textContent.includes('Satisfaction') ? '%' : '+');
            }
        };

        updateCounter();
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(num => {
                    if (!num.classList.contains('animated')) {
                        num.classList.add('animated');
                        animateCounter(num);
                    }
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    // FAQ Accordion functionality
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items
            faqItems.forEach(faq => {
                faq.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // Smooth scroll for scroll indicator
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const featuresSection = document.querySelector('.features-section');
            if (featuresSection) {
                featuresSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Intersection Observer for fade-in animations
    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Apply fade-in animation to sections
    const sections = document.querySelectorAll('.features-section, .services-preview, .testimonials-section, .faq-section, .final-cta');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        fadeInObserver.observe(section);
    });

    // Card hover effect enhancement
    const cards = document.querySelectorAll('.feature-card, .service-card, .testimonial-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });
});