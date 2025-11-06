document.addEventListener('DOMContentLoaded', () => {
    // Prevent multiple executions
    if (window.isPageLoaded) return;
    window.isPageLoaded = true;

    // User authentication
    const userNameSpan = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');
    const loggedInUser = localStorage.getItem('loggedInUser');

    if (loggedInUser) {
        userNameSpan.textContent = loggedInUser;
        
        // Logout functionality
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('loggedInUser');
            window.location.href = 'Login_page.html';
        });

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
    } else {
        window.location.href = 'Login_page.html';
    }

    // Interactive Slider
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.nav-dot');
    let currentSlide = 0;
    const slideInterval = 8000; // Change slide every 8 seconds
    let autoSlideTimer = null;

    // Initialize first slide
    slides[0].classList.add('active');

    function showSlide(index, direction = 'next') {
        // Remove active class but keep the old slide temporarily
        const oldSlide = document.querySelector('.slide.active');
        const newSlide = slides[index];
        
        // Remove active class from dots
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Add transition classes based on direction
        if (oldSlide) {
            oldSlide.classList.add(direction === 'next' ? 'slide-exit-left' : 'slide-exit-right');
            oldSlide.classList.remove('active');
        }
        
        newSlide.classList.add('active', direction === 'next' ? 'slide-enter-right' : 'slide-enter-left');
        dots[index].classList.add('active');

        // Clean up transition classes after animation
        setTimeout(() => {
            if (oldSlide) {
                oldSlide.classList.remove('slide-exit-left', 'slide-exit-right');
            }
            newSlide.classList.remove('slide-enter-right', 'slide-enter-left');
        }, 1000);
    }

    function startAutoSlide() {
        if (autoSlideTimer) clearInterval(autoSlideTimer);
        autoSlideTimer = setInterval(() => {
            const nextSlide = (currentSlide + 1) % slides.length;
            showSlide(nextSlide, 'next');
            currentSlide = nextSlide;
        }, slideInterval);
    }

    // Start auto slide
    startAutoSlide();

    // Click handlers for arrows
    const prevArrow = document.querySelector('.prev-arrow');
    const nextArrow = document.querySelector('.next-arrow');

    prevArrow.addEventListener('click', () => {
        const prevSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prevSlide, 'prev');
        currentSlide = prevSlide;
        startAutoSlide(); // Reset timer
    });

    nextArrow.addEventListener('click', () => {
        const nextSlide = (currentSlide + 1) % slides.length;
        showSlide(nextSlide, 'next');
        currentSlide = nextSlide;
        startAutoSlide(); // Reset timer
    });

    // Click handlers for navigation dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (index === currentSlide) return;
            const direction = index > currentSlide ? 'next' : 'prev';
            showSlide(index, direction);
            currentSlide = index;
            startAutoSlide(); // Reset timer
        });
    });

    // Add hover animations for stats
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-10px)';
        });
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateY(0)';
        });
    });

    // Add counter animation for statistics
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(number => {
        const targetNumber = parseFloat(number.textContent);
        let currentNumber = 0;
        const duration = 2000; // 2 seconds
        const steps = 60;
        const increment = targetNumber / steps;
        const interval = duration / steps;

        const counter = setInterval(() => {
            currentNumber += increment;
            if (currentNumber >= targetNumber) {
                currentNumber = targetNumber;
                clearInterval(counter);
            }
            number.textContent = Math.round(currentNumber) + (number.textContent.includes('%') ? '%' : '+');
        }, interval);
    });

    // Map interactivity
    const mapPoints = document.querySelectorAll('.map-point');
    const regions = ['Europe', 'Amériques', 'Asie-Pacifique', 'MENA'];
    let activeRegion = null;

    // Function to highlight points by region
    function highlightRegion(region) {
        mapPoints.forEach(point => {
            if (point.dataset.region === region) {
                point.style.transform = 'scale(1.2)';
                point.style.zIndex = '3';
            } else {
                point.style.transform = 'scale(0.8)';
                point.style.opacity = '0.5';
            }
        });
    }

    // Function to reset points
    function resetPoints() {
        mapPoints.forEach(point => {
            point.style.transform = '';
            point.style.opacity = '';
            point.style.zIndex = '';
        });
    }

    // Add hover effects for legend items
    document.querySelectorAll('.legend-item').forEach(item => {
        item.addEventListener('mouseenter', (e) => {
            const region = e.target.textContent;
            highlightRegion(region);
        });

        item.addEventListener('mouseleave', () => {
            resetPoints();
        });
    });

    // Add hover effects for points
    mapPoints.forEach(point => {
        point.addEventListener('mouseenter', () => {
            point.style.transform = 'scale(1.2)';
            point.style.zIndex = '3';
        });

        point.addEventListener('mouseleave', () => {
            if (!activeRegion) {
                point.style.transform = '';
                point.style.zIndex = '';
            }
        });
    });
});