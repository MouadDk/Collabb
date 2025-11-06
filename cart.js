document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const checkoutButton = document.getElementById('checkout-button');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
        updateCartCount();
    }

    function updateCartDisplay() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            cartItemsContainer.style.display = 'none';
            checkoutButton.style.display = 'none';
        } else {
            emptyCartMessage.style.display = 'none';
            cartItemsContainer.style.display = 'block';
            checkoutButton.style.display = 'block';

            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('cart-item');
                itemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="item-image">
                    <div class="item-details">
                        <h3>${item.name}</h3>
                        <p>Prix: ${item.price.toFixed(2)}€</p>
                    </div>
                    <div class="item-quantity">
                        <input type="number" value="${item.quantity}" min="1" data-id="${item.id}">
                    </div>
                    <div class="item-price">
                        ${(item.price * item.quantity).toFixed(2)}€
                    </div>
                    <button class="remove-item" data-id="${item.id}">Supprimer</button>
                `;
                cartItemsContainer.appendChild(itemElement);
                total += item.price * item.quantity;
            });
        }

        cartTotalElement.textContent = total.toFixed(2) + '€';
    }

    function updateCartCount() {
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            const count = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = count;
            cartCountElement.style.display = count > 0 ? 'inline-block' : 'none';
        }
    }

    cartItemsContainer.addEventListener('change', (e) => {
        if (e.target.tagName === 'INPUT' && e.target.type === 'number') {
            const itemId = e.target.dataset.id;
            const newQuantity = parseInt(e.target.value);
            const itemIndex = cart.findIndex(item => item.id === itemId);

            if (itemIndex > -1 && newQuantity > 0) {
                cart[itemIndex].quantity = newQuantity;
                saveCart();
            } else if (newQuantity <= 0) {
                cart.splice(itemIndex, 1);
                saveCart();
            }
        }
    });

    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item')) {
            const itemId = e.target.dataset.id;
            cart = cart.filter(item => item.id !== itemId);
            saveCart();
        }
    });

    // Initial display
    updateCartDisplay();
    updateCartCount();
});

// Function to add items to cart from other pages
function addToCart(item) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    // Optionally, update a cart count display in the header if it exists
    // This would require a global function or event
    console.log('Item added to cart:', item);
    alert(`${item.name} a été ajouté au panier !`);
}