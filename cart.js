function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Only update cart display if we're on the cart page
    if (document.getElementById('cart-items')) {
        updateCartDisplay();
    }
    
    // Dispatch custom event for other pages to listen to
    window.dispatchEvent(new CustomEvent('cartUpdated'));
}

function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const currentCart = getCart();
    const count = currentCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    cartCountElements.forEach(element => {
        if (count > 0) {
            element.textContent = `(${count})`;
            element.style.display = 'inline';
        } else {
            element.textContent = '';
            element.style.display = 'none';
        }
    });
    console.log('Cart count updated to:', count);
}

function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cartSubtotalElement = document.getElementById('cart-subtotal');
    const cartTaxElement = document.getElementById('cart-tax');
    const emptyCartContainer = document.getElementById('empty-cart-container');
    const cartSummary = document.getElementById('cart-summary');

    if (!cartItemsContainer) {
        return; // Exit if cart display elements are not present
    }

    const cart = getCart();
    cartItemsContainer.innerHTML = '';
    let subtotal = 0;

    if (cart.length === 0) {
        if (emptyCartContainer) emptyCartContainer.style.display = 'block';
        cartItemsContainer.style.display = 'none';
        if (cartSummary) cartSummary.style.display = 'none';
    } else {
        if (emptyCartContainer) emptyCartContainer.style.display = 'none';
        cartItemsContainer.style.display = 'flex';
        if (cartSummary) cartSummary.style.display = 'block';

        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <img src="${item.image || 'https://via.placeholder.com/100x100'}" alt="${item.name}" class="item-image" onerror="this.src='https://via.placeholder.com/100x100'">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>Prix unitaire: ${item.price.toFixed(2)}€</p>
                </div>
                <div class="item-quantity">
                    <label>Quantité:</label>
                    <input type="number" value="${item.quantity || 1}" min="1" data-id="${item.id}">
                </div>
                <div class="item-price">
                    ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}€
                </div>
                <button class="remove-item" data-id="${item.id}">✕ Supprimer</button>
            `;
            cartItemsContainer.appendChild(itemElement);
            subtotal += (item.price || 0) * (item.quantity || 1);
        });
    }

    // Calculate tax and total
    const tax = subtotal * 0.20; // 20% VAT
    const total = subtotal + tax;

    if (cartSubtotalElement) cartSubtotalElement.textContent = subtotal.toFixed(2) + '€';
    if (cartTaxElement) cartTaxElement.textContent = tax.toFixed(2) + '€';
    if (cartTotalElement) cartTotalElement.textContent = total.toFixed(2) + '€';
}

// Function to add items to cart from other pages
function addToCart(item) {
    console.log('addToCart function called with item:', item);
    
    if (!item || !item.id || !item.name) {
        console.error('Invalid item data:', item);
        alert('Erreur: données de l\'article invalides');
        return;
    }

    let cart = getCart();
    const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
    } else {
        cart.push({ 
            id: item.id,
            name: item.name,
            price: item.price || 0,
            image: item.image || 'https://via.placeholder.com/100x100',
            quantity: 1 
        });
    }
    
    saveCart(cart);
    console.log('Item added to cart:', item);
    console.log('Cart after adding item:', cart);
    
    // Show feedback to user
    showAddToCartFeedback(item.name);
}

function showAddToCartFeedback(itemName) {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ffd700, #ffed4e);
        color: #1a1f2e;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        font-weight: 600;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = `✓ ${itemName} ajouté au panier!`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// Add slide animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(-100px);
        }
    }
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired in cart.js');
    
    // Initial update of cart count and display
    updateCartCount();
    updateCartDisplay();

    // Cart page specific functionality
    const cartItemsContainer = document.getElementById('cart-items');
    if (cartItemsContainer) {
        // Quantity change handler
        cartItemsContainer.addEventListener('change', (e) => {
            if (e.target.tagName === 'INPUT' && e.target.type === 'number') {
                const itemId = e.target.dataset.id;
                const newQuantity = parseInt(e.target.value);
                let cart = getCart();
                const itemIndex = cart.findIndex(item => item.id === itemId);

                if (itemIndex > -1 && newQuantity > 0) {
                    cart[itemIndex].quantity = newQuantity;
                    saveCart(cart);
                } else if (newQuantity <= 0) {
                    cart.splice(itemIndex, 1);
                    saveCart(cart);
                    
                    // Add animation when removing
                    const cartItem = e.target.closest('.cart-item');
                    if (cartItem) {
                        cartItem.style.animation = 'slideOut 0.3s ease';
                        setTimeout(() => {
                            updateCartDisplay();
                        }, 300);
                    }
                }
            }
        });

        // Remove item handler
        cartItemsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item')) {
                const itemId = e.target.dataset.id;
                let cart = getCart();
                cart = cart.filter(item => item.id !== itemId);
                saveCart(cart);
                
                // Add animation when removing
                const cartItem = e.target.closest('.cart-item');
                if (cartItem) {
                    cartItem.style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => {
                        updateCartDisplay();
                    }, 300);
                }
            }
        });
    }

    // Checkout button handler
    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            const cart = getCart();
            if (cart.length > 0) {
                const totalElement = document.getElementById('cart-total');
                const total = totalElement ? totalElement.textContent : 'N/A';
                alert('Fonctionnalité de paiement à venir! Total: ' + total);
            } else {
                alert('Votre panier est vide!');
            }
        });
    }

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
    } else if (!loggedInUser && window.location.pathname.includes('cart.html')) {
        // Only redirect if on cart page and not logged in
        // Other pages handle their own redirects
    }
});

// Listen for cart updates from other tabs/pages
window.addEventListener('storage', (e) => {
    if (e.key === 'cart') {
        updateCartCount();
        if (document.getElementById('cart-items')) {
            updateCartDisplay();
        }
    }
});

// Listen for custom cart update events
window.addEventListener('cartUpdated', () => {
    updateCartCount();
    if (document.getElementById('cart-items')) {
        updateCartDisplay();
    }
});
