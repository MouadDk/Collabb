document.addEventListener('DOMContentLoaded', () => {
    // Filter functionality
    const filterBtns = document.querySelectorAll('.filter-btn');
    const serviceCards = document.querySelectorAll('.service-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            serviceCards.forEach(card => {
                if (filter === 'all') {
                    card.classList.remove('hidden');
                    setTimeout(() => {
                        card.style.animation = 'fadeIn 0.6s ease';
                    }, 10);
                } else {
                    const category = card.getAttribute('data-category');
                    if (category === filter) {
                        card.classList.remove('hidden');
                        setTimeout(() => {
                            card.style.animation = 'fadeIn 0.6s ease';
                        }, 10);
                    } else {
                        card.classList.add('hidden');
                    }
                }
            });
        });
    });

    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const sections = document.querySelectorAll('.why-services, .cta-services');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        fadeInObserver.observe(section);
    });

    // User menu functionality
    const userNameSpan = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');
    const loggedInUser = localStorage.getItem('loggedInUser');

    if (loggedInUser && userNameSpan) {
        userNameSpan.textContent = loggedInUser;
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('loggedInUser');
                window.location.href = 'Login_page.html';
            });
        }
    } else if (!loggedInUser) {
        window.location.href = 'Login_page.html';
    }

    // Update cart count
    function updateCartCount() {
        const cartCountElements = document.querySelectorAll('.cart-count');
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        cartCountElements.forEach(element => {
            if (count > 0) {
                element.textContent = `(${count})`;
                element.style.display = 'inline';
            } else {
                element.textContent = '';
                element.style.display = 'none';
            }
        });
    }

    // Initialize cart count
    updateCartCount();

    // Update cart count when storage changes (other tabs)
    window.addEventListener('storage', (e) => {
        if (e.key === 'cart') {
            updateCartCount();
        }
    });

    // Update cart count when cart is updated (same tab)
    window.addEventListener('cartUpdated', () => {
        updateCartCount();
    });
});