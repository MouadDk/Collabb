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

    // Set minimum date for quote request
    const quoteDateInput = document.getElementById('quote-date');
    if (quoteDateInput) {
        const today = new Date();
        today.setDate(today.getDate() + 1); // Tomorrow
        quoteDateInput.min = today.toISOString().split('T')[0];
    }

    // Character counters
    const descTextarea = document.getElementById('quote-description');
    const reqTextarea = document.getElementById('quote-requirements');
    
    if (descTextarea) {
        descTextarea.addEventListener('input', (e) => {
            const count = e.target.value.length;
            document.getElementById('desc-count').textContent = count;
            if (count > 500) {
                e.target.value = e.target.value.substring(0, 500);
                document.getElementById('desc-count').textContent = 500;
            }
        });
    }
    
    if (reqTextarea) {
        reqTextarea.addEventListener('input', (e) => {
            const count = e.target.value.length;
            document.getElementById('req-count').textContent = count;
            if (count > 300) {
                e.target.value = e.target.value.substring(0, 300);
                document.getElementById('req-count').textContent = 300;
            }
        });
    }

    // Form validation
    const quoteForm = document.getElementById('quoteRequestForm');
    if (quoteForm) {
        const inputs = quoteForm.querySelectorAll('input[required], textarea[required], select[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('invalid')) {
                    validateField(input);
                }
            });
        });

        quoteForm.addEventListener('submit', handleQuoteSubmit);
    }
});

// Current quote item
let currentQuoteItem = null;

// Open quote modal
function openQuoteModal(item) {
    currentQuoteItem = item;
    const modal = document.getElementById('quoteModal');
    const itemInfo = document.getElementById('quoteItemInfo');
    
    itemInfo.innerHTML = `
        <div class="quote-item-display">
            <div class="quote-item-icon">${item.icon}</div>
            <div class="quote-item-details">
                <h4>${item.name}</h4>
                <p class="quote-item-type">Demande de devis personnalisé</p>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Reset form
    document.getElementById('quoteRequestForm').reset();
    document.getElementById('desc-count').textContent = '0';
    document.getElementById('req-count').textContent = '0';
    
    // Clear validation
    const inputs = document.querySelectorAll('.form-group input, .form-group textarea, .form-group select');
    inputs.forEach(input => {
        input.classList.remove('valid', 'invalid');
        const icon = input.parentElement.querySelector('.validation-icon');
        if (icon) icon.textContent = '';
    });
}

// Close quote modal
function closeQuoteModal() {
    const modal = document.getElementById('quoteModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentQuoteItem = null;
}

// Validate field
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    
    if (field.hasAttribute('required') && !value) {
        isValid = false;
    } else if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isValid = emailRegex.test(value);
    } else if (field.type === 'tel' && value) {
        const phoneRegex = /^(\+33|0)[1-9](\d{2}){4}$/;
        const cleanPhone = value.replace(/\s/g, '');
        isValid = phoneRegex.test(cleanPhone);
    } else if (field.hasAttribute('minlength') && value) {
        isValid = value.length >= parseInt(field.getAttribute('minlength'));
    }
    
    const icon = field.parentElement.querySelector('.validation-icon');
    if (icon) {
        if (value) {
            field.classList.remove('invalid');
            field.classList.add(isValid ? 'valid' : 'invalid');
            icon.textContent = isValid ? '✓' : '✗';
        } else {
            field.classList.remove('valid', 'invalid');
            icon.textContent = '';
        }
    }
    
    return isValid;
}

// Handle quote submit
function handleQuoteSubmit(e) {
    e.preventDefault();
    
    // Validate all fields
    const form = e.target;
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showNotification('Veuillez remplir tous les champs requis correctement', 'error');
        return;
    }
    
    // Create quote request
    const quoteRequest = {
        id: 'QR-' + Date.now(),
        itemId: currentQuoteItem.id,
        itemName: currentQuoteItem.name,
        itemIcon: currentQuoteItem.icon,
        companyName: document.getElementById('quote-company').value.trim(),
        contactPerson: document.getElementById('quote-contact').value.trim(),
        email: document.getElementById('quote-email').value.trim(),
        phone: document.getElementById('quote-phone').value.trim(),
        companySize: document.getElementById('quote-company-size').value,
        preferredDate: document.getElementById('quote-date').value,
        projectDescription: document.getElementById('quote-description').value.trim(),
        requirements: document.getElementById('quote-requirements').value.trim(),
        budgetRange: document.getElementById('quote-budget').value,
        status: 'pending',
        submittedDate: new Date().toISOString(),
        quotedPrice: null,
        quoteValidUntil: null,
        quoteDocument: null
    };
    
    // Save to localStorage
    let quoteRequests = JSON.parse(localStorage.getItem('quoteRequests')) || [];
    quoteRequests.push(quoteRequest);
    localStorage.setItem('quoteRequests', JSON.stringify(quoteRequests));
    
    // Add to cart with quote status
    const cartItem = {
        id: currentQuoteItem.id,
        name: currentQuoteItem.name,
        price: 0,
        icon: currentQuoteItem.icon,
        quantity: 1,
        isQuote: true,
        quoteRequestId: quoteRequest.id,
        quoteStatus: 'pending'
    };
    
    addToCart(cartItem);
    
    // Close modal
    closeQuoteModal();
    
    // Show success notification
    showNotification('✓ Demande de devis envoyée avec succès!', 'success');
    
    // Show confirmation modal
    setTimeout(() => {
        showQuoteConfirmation(quoteRequest);
    }, 500);
}

// Show quote confirmation
function showQuoteConfirmation(quoteRequest) {
    const modal = document.createElement('div');
    modal.className = 'quote-modal-overlay';
    modal.innerHTML = `
        <div class="quote-modal confirmation-modal">
            <div class="confirmation-header">
                <div class="success-icon">✓</div>
                <h2>Demande de Devis Envoyée!</h2>
            </div>
            <div class="confirmation-body">
                <p class="confirmation-message">Merci pour votre demande. Notre équipe va l'examiner et vous contactera dans les plus brefs délais.</p>
                
                <div class="quote-summary">
                    <h3>Récapitulatif de votre demande</h3>
                    <div class="summary-item">
                        <span class="summary-label">Numéro de demande:</span>
                        <span class="summary-value">${quoteRequest.id}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Service/Logiciel:</span>
                        <span class="summary-value">${quoteRequest.itemIcon} ${quoteRequest.itemName}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Entreprise:</span>
                        <span class="summary-value">${quoteRequest.companyName}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Contact:</span>
                        <span class="summary-value">${quoteRequest.contactPerson}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Email:</span>
                        <span class="summary-value">${quoteRequest.email}</span>
                    </div>
                </div>
                
                <div class="next-steps">
                    <h4>Prochaines étapes:</h4>
                    <ul>
                        <li>📧 Vous recevrez un email de confirmation</li>
                        <li>👥 Notre équipe examinera votre demande sous 24-48h</li>
                        <li>💬 Nous vous contacterons pour discuter des détails</li>
                        <li>📄 Vous recevrez un devis personnalisé</li>
                    </ul>
                </div>
                
                <div class="confirmation-actions">
                    <button class="btn-primary" onclick="this.closest('.quote-modal-overlay').remove(); window.location.href='quote-requests.html'">
                        Voir mes demandes
                    </button>
                    <button class="btn-secondary" onclick="this.closest('.quote-modal-overlay').remove()">
                        Continuer mes achats
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #00d4ff, #00b8d4)' : type === 'error' ? 'linear-gradient(135deg, #ff6b6b, #ff5252)' : 'linear-gradient(135deg, #ffd700, #ffed4e)'};
        color: ${type === 'error' || type === 'success' ? 'white' : '#1a1f2e'};
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        z-index: 10001;
        font-weight: 600;
        animation: slideInRight 0.3s ease;
        max-width: 350px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

// Close modal on outside click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('quote-modal-overlay')) {
        closeQuoteModal();
    }
});

// Override addToCart for quote items
const originalAddToCart = window.addToCart;
window.addToCart = function(item) {
    // Check if this is a quote request (price is 0 and it's a service/software)
    if (item.price === 0 && (item.id.startsWith('service-') || item.id.startsWith('software-'))) {
        openQuoteModal(item);
    } else {
        originalAddToCart(item);
    }
};