function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const currentCart = getCart();
    const count = currentCart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElements.forEach(element => {
        element.textContent = count;
        element.style.display = count > 0 ? 'inline-block' : 'none';
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

<<<<<<< HEAD
    if (!cartItemsContainer || !cartTotalElement || !emptyCartMessage || !checkoutButton) {
=======
    if (!cartItemsContainer) {
>>>>>>> Mouad
        return; // Exit if cart display elements are not present
    }

    const cart = getCart();
    cartItemsContainer.innerHTML = '';
<<<<<<< HEAD
    let total = 0;

    if (cart.length === 0) {
        emptyCartMessage.style.display = 'block';
        cartItemsContainer.style.display = 'none';
        checkoutButton.style.display = 'none';
    } else {
        emptyCartMessage.style.display = 'none';
        cartItemsContainer.style.display = 'block';
        checkoutButton.style.display = 'block';
=======
    let subtotal = 0;

    if (cart.length === 0) {
        if (emptyCartContainer) emptyCartContainer.style.display = 'block';
        cartItemsContainer.style.display = 'none';
        if (cartSummary) cartSummary.style.display = 'none';
    } else {
        if (emptyCartContainer) emptyCartContainer.style.display = 'none';
        cartItemsContainer.style.display = 'flex';
        if (cartSummary) cartSummary.style.display = 'block';
>>>>>>> Mouad

        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
<<<<<<< HEAD
                <img src="${item.image}" alt="${item.name}" class="item-image">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>Prix: ${item.price.toFixed(2)}€</p>
                </div>
                <div class="item-quantity">
=======
                <img src="${item.image}" alt="${item.name}" class="item-image" onerror="this.src='https://via.placeholder.com/100x100'">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>Prix unitaire: ${item.price.toFixed(2)}€</p>
                </div>
                <div class="item-quantity">
                    <label>Quantité:</label>
>>>>>>> Mouad
                    <input type="number" value="${item.quantity}" min="1" data-id="${item.id}">
                </div>
                <div class="item-price">
                    ${(item.price * item.quantity).toFixed(2)}€
                </div>
<<<<<<< HEAD
                <button class="remove-item" data-id="${item.id}">Supprimer</button>
            `;
            cartItemsContainer.appendChild(itemElement);
            total += item.price * item.quantity;
        });
    }

    cartTotalElement.textContent = total.toFixed(2) + '€';
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired in cart.js');
    updateCartCount(); // Initial update of cart count on page load
    updateCartDisplay(); // Initial update of cart display if on cart.html

=======
                <button class="remove-item" data-id="${item.id}">✕ Supprimer</button>
            `;
            cartItemsContainer.appendChild(itemElement);
            subtotal += item.price * item.quantity;
        });
    }

    // Calculate tax and total
    const tax = subtotal * 0.20; // 20% VAT
    const total = subtotal + tax;

    if (cartSubtotalElement) cartSubtotalElement.textContent = subtotal.toFixed(2) + '€';
    if (cartTaxElement) cartTaxElement.textContent = tax.toFixed(2) + '€';
    if (cartTotalElement) cartTotalElement.textContent = total.toFixed(2) + '€';
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired in cart.js');
    updateCartCount(); // Initial update of cart count on page load
    updateCartDisplay(); // Initial update of cart display if on cart.html

>>>>>>> Mouad
    const cartItemsContainer = document.getElementById('cart-items');
    if (cartItemsContainer) { // Only add event listeners if cart elements exist
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
                }
            }
        });

        cartItemsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item')) {
                const itemId = e.target.dataset.id;
                let cart = getCart();
                cart = cart.filter(item => item.id !== itemId);
                saveCart(cart);
<<<<<<< HEAD
=======
                
                // Add animation when removing
                e.target.closest('.cart-item').style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    updateCartDisplay();
                }, 300);
            }
        });
    }

    // Checkout button handler
    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            const cart = getCart();
            if (cart.length > 0) {
                alert('Fonctionnalité de paiement à venir! Total: ' + document.getElementById('cart-total').textContent);
>>>>>>> Mouad
            }
        });
    }
});

// Add slide out animation
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
`;
document.head.appendChild(style);

// Function to add items to cart from other pages
function addToCart(item) {
    console.log('addToCart function called with item:', item);
    let cart = getCart();
    const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    console.log('Cart before adding item:', getCart());
    saveCart(cart); // Use saveCart to update localStorage and cart count
    console.log('Item added to cart:', item);
    console.log('Cart after adding item:', getCart());
}