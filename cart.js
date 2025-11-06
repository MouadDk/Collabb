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
            const isSoftware = item.id && item.id.startsWith('software-');
            const installationIcon = isSoftware ? `
                <button class="installation-btn" data-id="${item.id}" title="Configurer l'installation">
                    📍
                </button>
            ` : '';
            itemElement.innerHTML = `
                <img src="${item.image || 'https://via.placeholder.com/100x100'}" alt="${item.name}" class="item-image" onerror="this.src='https://via.placeholder.com/100x100'">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>Prix unitaire: ${item.price.toFixed(2)}€</p>
                    ${item.installationInfo ? `<p class="installation-info">✓ Installation configurée</p>` : ''}
                </div>
                <div class="item-quantity">
                    <label>Quantité:</label>
                    <input type="number" value="${item.quantity || 1}" min="1" data-id="${item.id}">
                </div>
                <div class="item-price">
                    ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}€
                </div>
                ${installationIcon}
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
            
            // Installation button handler
            if (e.target.classList.contains('installation-btn')) {
                const itemId = e.target.dataset.id;
                openInstallationModal(itemId);
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

// Installation Modal Functions
function openInstallationModal(itemId) {
    const cart = getCart();
    const item = cart.find(cartItem => cartItem.id === itemId);
    if (!item) return;

    // Get existing installation info if any
    const existingInfo = item.installationInfo || {};

    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'installation-modal-overlay';
    modalOverlay.innerHTML = `
        <div class="installation-modal">
            <div class="modal-header">
                <h2>Configuration de l'Installation</h2>
                <button class="modal-close" onclick="closeInstallationModal()">✕</button>
            </div>
            <div class="modal-body">
                <p class="software-name">${item.name}</p>
                
                <div class="form-group">
                    <label for="installation-address">Adresse d'installation:</label>
                    <input type="text" id="installation-address" placeholder="Entrez l'adresse..." value="${existingInfo.address || ''}">
                    <button type="button" class="btn-locate" onclick="locateOnMap()">📍 Localiser sur la carte</button>
                </div>
                
                <div class="map-container">
                    <div id="installation-map"></div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="installation-date">Date d'installation:</label>
                        <input type="date" id="installation-date" value="${existingInfo.date || ''}" min="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label for="installation-time">Heure d'installation:</label>
                        <input type="time" id="installation-time" value="${existingInfo.time || ''}">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="contact-name">Nom du responsable:</label>
                    <input type="text" id="contact-name" placeholder="Nom complet" value="${existingInfo.contactName || ''}">
                </div>
                
                <div class="form-group">
                    <label for="contact-phone">Numéro de téléphone:</label>
                    <input type="tel" id="contact-phone" placeholder="+33 6 12 34 56 78" value="${existingInfo.contactPhone || ''}">
                </div>
                
                <div class="modal-actions">
                    <button class="btn-cancel" onclick="closeInstallationModal()">Annuler</button>
                    <button class="btn-save" onclick="saveInstallationInfo('${itemId}')">Enregistrer</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalOverlay);
    
    // Initialize map after DOM is ready
    let initAttempts = 0;
    const maxAttempts = 20; // Maximum 4 seconds (20 * 200ms)
    
    const initMap = () => {
        initAttempts++;
        const mapContainer = document.getElementById('installation-map');
        if (!mapContainer) {
            if (initAttempts < maxAttempts) {
                setTimeout(initMap, 100);
            }
            return;
        }
        
        // Ensure map container has height
        if (mapContainer.offsetHeight === 0) {
            mapContainer.style.height = '400px';
        }
        
        // Check if Leaflet is loaded
        if (typeof L === 'undefined') {
            if (initAttempts < maxAttempts) {
                // Wait a bit more for Leaflet to load
                setTimeout(initMap, 200);
                return;
            } else {
                // Leaflet still not loaded after max attempts
                console.error('Leaflet n\'a pas pu être chargé après plusieurs tentatives');
                mapContainer.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 2rem; text-align: center; background: #f8f9fa; border-radius: 15px;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
                        <h3 style="color: #ff4444; margin-bottom: 0.5rem; font-size: 1.3rem;">Erreur de chargement</h3>
                        <p style="color: #666; margin-bottom: 0.5rem;">Leaflet n'a pas pu être chargé</p>
                        <p style="color: #999; font-size: 0.9rem;">Veuillez rafraîchir la page</p>
                    </div>
                `;
                return;
            }
        }
        
        // Try to initialize map (will use Google Maps if available, otherwise Leaflet)
        console.log('Initializing map, Leaflet available:', typeof L !== 'undefined');
        initializeMap(existingInfo.latitude, existingInfo.longitude, existingInfo.address);
    };
    
    // Wait for modal to be fully rendered, then start initialization
    setTimeout(initMap, 300);
    
    // Also listen for Leaflet load event
    window.onLeafletLoaded = function() {
        console.log('Leaflet loaded callback triggered');
        setTimeout(initMap, 100);
    };
}

function closeInstallationModal() {
    const modal = document.querySelector('.installation-modal-overlay');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

let map;
let marker;
let geocoder;

function initializeMap(lat, lng, address) {
    const mapContainer = document.getElementById('installation-map');
    if (!mapContainer) {
        console.error('Map container not found');
        return;
    }

    console.log('Initializing map...', { lat, lng, address });
    console.log('Leaflet available:', typeof L !== 'undefined');
    console.log('Google Maps available:', typeof google !== 'undefined' && google.maps);

    // Default location (Paris, France)
    const defaultLat = lat || 48.8566;
    const defaultLng = lng || 2.3522;

    // Try Google Maps first
    if (typeof google !== 'undefined' && google.maps && google.maps.Map) {
        console.log('Using Google Maps');
        try {
            // Initialize Google Maps
            map = new google.maps.Map(mapContainer, {
                center: { lat: defaultLat, lng: defaultLng },
                zoom: address ? 15 : 10,
                mapTypeControl: true,
                streetViewControl: true,
                fullscreenControl: true
            });

            geocoder = new google.maps.Geocoder();

            // Add marker
            marker = new google.maps.Marker({
                map: map,
                draggable: true,
                position: { lat: defaultLat, lng: defaultLng }
            });

            // Update address when marker is dragged
            marker.addListener('dragend', () => {
                const position = marker.getPosition();
                geocoder.geocode({ location: position }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        document.getElementById('installation-address').value = results[0].formatted_address;
                    }
                });
            });

            // Update marker when address is entered
            const addressInput = document.getElementById('installation-address');
            if (addressInput) {
                addressInput.addEventListener('blur', () => {
                    const address = addressInput.value;
                    if (address) {
                        geocoder.geocode({ address: address }, (results, status) => {
                            if (status === 'OK' && results[0]) {
                                const location = results[0].geometry.location;
                                map.setCenter(location);
                                map.setZoom(15);
                                marker.setPosition(location);
                            }
                        });
                    }
                });
            }

            // If address was provided, geocode it
            if (address) {
                geocoder.geocode({ address: address }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        const location = results[0].geometry.location;
                        map.setCenter(location);
                        map.setZoom(15);
                        marker.setPosition(location);
                    }
                });
            }
            
            window.mapType = 'google';
            console.log('Google Maps initialized successfully');
            return;
        } catch (error) {
            console.error('Error initializing Google Maps:', error);
        }
    }

    // Fallback to Leaflet/OpenStreetMap
    if (typeof L !== 'undefined') {
        console.log('Using Leaflet');
        try {
            // Ensure container has dimensions
            if (mapContainer.offsetHeight === 0) {
                mapContainer.style.height = '400px';
            }
            
            // Clear any existing content
            mapContainer.innerHTML = '';
            
            // Initialize Leaflet map
            map = L.map(mapContainer, {
                center: [defaultLat, defaultLng],
                zoom: address ? 15 : 10,
                zoomControl: true
            });
            
            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(map);

            // Add marker
            marker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map);
            
            // Force map to resize after initialization
            setTimeout(() => {
                if (map && typeof map.invalidateSize === 'function') {
                    map.invalidateSize();
                }
            }, 100);

            // Update address when marker is dragged
            marker.on('dragend', function() {
                const position = marker.getLatLng();
                // Use Nominatim for reverse geocoding (free, no API key needed)
                fetch(`https://nominatim.openstreetmap.org/reverse?lat=${position.lat}&lon=${position.lng}&format=json`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.display_name) {
                            document.getElementById('installation-address').value = data.display_name;
                        }
                    })
                    .catch(err => console.error('Geocoding error:', err));
            });

            // Update marker when address is entered
            const addressInput = document.getElementById('installation-address');
            if (addressInput) {
                addressInput.addEventListener('blur', () => {
                    const address = addressInput.value;
                    if (address) {
                        // Use Nominatim for geocoding
                        fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`)
                            .then(response => response.json())
                            .then(data => {
                                if (data.length > 0) {
                                    const location = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                                    map.setView(location, 15);
                                    marker.setLatLng(location);
                                }
                            })
                            .catch(err => console.error('Geocoding error:', err));
                    }
                });
            }

            // If address was provided, geocode it
            if (address) {
                fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.length > 0) {
                            const location = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                            map.setView(location, 15);
                            marker.setLatLng(location);
                        }
                    })
                    .catch(err => console.error('Geocoding error:', err));
            }
            
            window.mapType = 'leaflet';
            console.log('Leaflet initialized successfully');
            return;
        } catch (error) {
            console.error('Error initializing Leaflet:', error);
            mapContainer.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 2rem; text-align: center; background: #f8f9fa; border-radius: 15px;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                    <h3 style="color: #ff4444; margin-bottom: 0.5rem;">Erreur d'initialisation</h3>
                    <p style="color: #666;">${error.message}</p>
                </div>
            `;
        }
    }

    // If neither map library is available, show error message
    console.error('No map library available');
    mapContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 2rem; text-align: center; background: #f8f9fa; border-radius: 15px;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🗺️</div>
            <h3 style="color: #1a1f2e; margin-bottom: 0.5rem; font-size: 1.3rem;">Carte non disponible</h3>
            <p style="color: #666; margin-bottom: 0.5rem; line-height: 1.6;">Aucune bibliothèque de cartes n'est chargée</p>
            <p style="color: #999; font-size: 0.9rem;">Vérifiez que Leaflet ou Google Maps est correctement chargé</p>
            <p style="color: #999; font-size: 0.8rem; margin-top: 1rem;">Leaflet: ${typeof L !== 'undefined' ? '✓' : '✗'}</p>
            <p style="color: #999; font-size: 0.8rem;">Google Maps: ${typeof google !== 'undefined' && google.maps ? '✓' : '✗'}</p>
        </div>
    `;
}

function locateOnMap() {
    const addressInput = document.getElementById('installation-address');
    const address = addressInput.value;
    
    if (!address) {
        alert('Veuillez entrer une adresse');
        return;
    }

    if (window.mapType === 'google' && geocoder) {
        geocoder.geocode({ address: address }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location;
                map.setCenter(location);
                map.setZoom(15);
                marker.setPosition(location);
            } else {
                alert('Adresse non trouvée. Veuillez vérifier l\'adresse.');
            }
        });
    } else if (window.mapType === 'leaflet' && map && marker) {
        fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const location = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                    map.setView(location, 15);
                    marker.setLatLng(location);
                } else {
                    alert('Adresse non trouvée. Veuillez vérifier l\'adresse.');
                }
            })
            .catch(err => {
                console.error('Geocoding error:', err);
                alert('Erreur lors de la recherche de l\'adresse.');
            });
    }
}

function saveInstallationInfo(itemId) {
    const address = document.getElementById('installation-address').value;
    const date = document.getElementById('installation-date').value;
    const time = document.getElementById('installation-time').value;
    const contactName = document.getElementById('contact-name').value;
    const contactPhone = document.getElementById('contact-phone').value;

    // Validation
    if (!address || !date || !time || !contactName || !contactPhone) {
        alert('Veuillez remplir tous les champs');
        return;
    }

    // Get marker position
    let latitude, longitude;
    if (window.mapType === 'google' && marker) {
        const position = marker.getPosition();
        latitude = position.lat();
        longitude = position.lng();
    } else if (window.mapType === 'leaflet' && marker) {
        const position = marker.getLatLng();
        latitude = position.lat;
        longitude = position.lng;
    } else {
        // Default to Paris if no map
        latitude = 48.8566;
        longitude = 2.3522;
    }

    // Update cart item
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === itemId);
    
    if (itemIndex > -1) {
        cart[itemIndex].installationInfo = {
            address: address,
            date: date,
            time: time,
            contactName: contactName,
            contactPhone: contactPhone,
            latitude: latitude,
            longitude: longitude
        };
        saveCart(cart);
        closeInstallationModal();
        alert('Informations d\'installation enregistrées avec succès!');
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('installation-modal-overlay')) {
        closeInstallationModal();
    }
});
