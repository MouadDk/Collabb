document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const softwareItems = document.querySelectorAll('.software-item');

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();

            softwareItems.forEach(item => {
                const name = item.getAttribute('data-name').toLowerCase();
                const text = item.textContent.toLowerCase();

                if (name.includes(searchTerm) || text.includes(searchTerm)) {
                    item.classList.remove('hidden');
                    item.style.animation = 'fadeIn 0.6s ease';
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    }

    // Sort functionality
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const sortValue = e.target.value;
            const itemsArray = Array.from(softwareItems);
            const grid = document.querySelector('.software-grid');

            let sortedItems;

            switch (sortValue) {
                case 'price-low':
                    sortedItems = itemsArray.sort((a, b) => {
                        const priceA = parseFloat(a.getAttribute('data-price'));
                        const priceB = parseFloat(b.getAttribute('data-price'));
                        return priceA - priceB;
                    });
                    break;
                case 'price-high':
                    sortedItems = itemsArray.sort((a, b) => {
                        const priceA = parseFloat(a.getAttribute('data-price'));
                        const priceB = parseFloat(b.getAttribute('data-price'));
                        return priceB - priceA;
                    });
                    break;
                case 'name':
                    sortedItems = itemsArray.sort((a, b) => {
                        const nameA = a.getAttribute('data-name').toLowerCase();
                        const nameB = b.getAttribute('data-name').toLowerCase();
                        return nameA.localeCompare(nameB);
                    });
                    break;
                default:
                    sortedItems = itemsArray;
            }

            // Clear and re-append sorted items
            grid.innerHTML = '';
            sortedItems.forEach(item => {
                grid.appendChild(item);
            });
        });
    }

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

    const sections = document.querySelectorAll('.comparison-section');
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