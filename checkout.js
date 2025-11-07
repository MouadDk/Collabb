// Checkout Page JavaScript
let currentStep = 1;
let orderData = null;
let appliedPromo = null;

// Promo codes
const promoCodes = {
    'WELCOME10': { discount: 0.10, description: '10% de réduction' },
    'SAVE20': { discount: 0.20, description: '20% de réduction' },
    'FIRST50': { discount: 50, description: '50€ de réduction', type: 'fixed' },
    'VIP15': { discount: 0.15, description: '15% de réduction' }
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        window.location.href = 'Login_page.html';
        return;
    }

    // Update user info
    const userNameSpan = document.getElementById('userName');
    if (userNameSpan) {
        userNameSpan.textContent = loggedInUser;
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('loggedInUser');
            window.location.href = 'Login_page.html';
        });
    }

    // Update cart count
    updateCartCount();

    // Check if cart is empty
    const cart = getCart();
    if (cart.length === 0) {
        alert('Votre panier est vide!');
        window.location.href = 'cart.html';
        return;
    }

    // Initialize step 1
    loadStep1();

    // Payment method change handler
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    paymentMethods.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'card') {
                document.getElementById('card-form').style.display = 'block';
                document.getElementById('paypal-form').style.display = 'none';
            } else {
                document.getElementById('card-form').style.display = 'none';
                document.getElementById('paypal-form').style.display = 'block';
            }
        });
    });

    // Format card number input
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }

    // Format expiry date input
    const expiryInput = document.getElementById('card-expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }

    // Format CVV input (numbers only)
    const cvvInput = document.getElementById('card-cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }

    // Card type detection
    const cardNumberInput2 = document.getElementById('card-number');
    if (cardNumberInput2) {
        cardNumberInput2.addEventListener('input', (e) => {
            detectCardType(e.target.value);
        });
    }
});

// Detect card type
function detectCardType(cardNumber) {
    const cardTypeIcon = document.getElementById('card-type-icon');
    if (!cardTypeIcon) return;

    const number = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(number)) {
        cardTypeIcon.textContent = 'VISA';
        cardTypeIcon.className = 'card-type-icon visa';
    } else if (/^5[1-5]/.test(number)) {
        cardTypeIcon.textContent = 'MC';
        cardTypeIcon.className = 'card-type-icon mastercard';
    } else if (/^3[47]/.test(number)) {
        cardTypeIcon.textContent = 'AMEX';
        cardTypeIcon.className = 'card-type-icon amex';
    } else {
        cardTypeIcon.textContent = '';
        cardTypeIcon.className = 'card-type-icon';
    }
}

// Apply promo code
function applyPromoCode() {
    const promoInput = document.getElementById('promo-code');
    const promoMessage = document.getElementById('promo-message');
    const code = promoInput.value.trim().toUpperCase();

    if (!code) {
        promoMessage.textContent = 'Veuillez entrer un code promo';
        promoMessage.className = 'promo-message error';
        return;
    }

    if (promoCodes[code]) {
        appliedPromo = { code: code, ...promoCodes[code] };
        promoMessage.textContent = `✓ Code appliqué: ${appliedPromo.description}`;
        promoMessage.className = 'promo-message success';
        promoInput.disabled = true;
        
        // Recalculate totals
        loadStep1();
    } else {
        promoMessage.textContent = '✗ Code promo invalide';
        promoMessage.className = 'promo-message error';
        appliedPromo = null;
    }
}

// Get cart from localStorage
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

// Update cart count
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const cart = getCart();
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

// Load Step 1: Cart Review
function loadStep1() {
    const cart = getCart();
    const cartItemsContainer = document.getElementById('checkout-cart-items');
    
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'checkout-cart-item';
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        subtotal += itemTotal;

        // Display icon if available, otherwise use image
        const displayIcon = item.icon ? `
            <div class="checkout-item-icon">${item.icon}</div>
        ` : `
            <img src="${item.image || 'https://via.placeholder.com/100x100'}" alt="${item.name}" class="checkout-item-image" onerror="this.src='https://via.placeholder.com/100x100'">
        `;

        itemElement.innerHTML = `
            ${displayIcon}
            <div class="checkout-item-details">
                <h4>${item.name}</h4>
                <p>Quantité: ${item.quantity || 1}</p>
                <p>Prix unitaire: ${item.price.toFixed(2)}€</p>
            </div>
            <div class="checkout-item-price">${itemTotal.toFixed(2)}€</div>
        `;
        cartItemsContainer.appendChild(itemElement);
    });

    // Apply promo code discount
    let discount = 0;
    if (appliedPromo) {
        if (appliedPromo.type === 'fixed') {
            discount = appliedPromo.discount;
        } else {
            discount = subtotal * appliedPromo.discount;
        }
        
        const discountRow = document.getElementById('discount-row');
        const discountCode = document.getElementById('discount-code');
        const discountAmount = document.getElementById('checkout-discount');
        
        if (discountRow && discountCode && discountAmount) {
            discountRow.style.display = 'flex';
            discountCode.textContent = appliedPromo.code;
            discountAmount.textContent = `-${discount.toFixed(2)}€`;
        }
    }

    const discountedSubtotal = subtotal - discount;
    const tax = discountedSubtotal * 0.20;
    const total = discountedSubtotal + tax;

    document.getElementById('checkout-subtotal').textContent = subtotal.toFixed(2) + '€';
    document.getElementById('checkout-tax').textContent = tax.toFixed(2) + '€';
    document.getElementById('checkout-total').textContent = total.toFixed(2) + '€';

    // Load installation addresses
    loadInstallationAddresses();
}

// Load installation addresses
function loadInstallationAddresses() {
    const cart = getCart();
    const installationList = document.getElementById('installation-list');
    const installationAddresses = document.getElementById('installation-addresses');
    
    if (!installationList) return;

    const softwareItems = cart.filter(item => item.id && item.id.startsWith('software-') && item.installationInfo);

    if (softwareItems.length === 0) {
        installationAddresses.style.display = 'none';
        return;
    }

    installationAddresses.style.display = 'block';
    installationList.innerHTML = '';

    softwareItems.forEach(item => {
        const installationElement = document.createElement('div');
        installationElement.className = 'installation-item';
        installationElement.innerHTML = `
            <h4>${item.name}</h4>
            <p><strong>Adresse:</strong> ${item.installationInfo.address}</p>
            <p><strong>Date:</strong> ${formatDate(item.installationInfo.date)}</p>
            <p><strong>Heure:</strong> ${item.installationInfo.time}</p>
            <p><strong>Contact:</strong> ${item.installationInfo.contactName} - ${item.installationInfo.contactPhone}</p>
        `;
        installationList.appendChild(installationElement);
    });
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Go to step
function goToStep(step) {
    // Validate step 1 before proceeding
    if (step === 2 && currentStep === 1) {
        const cart = getCart();
        const softwareItems = cart.filter(item => item.id && item.id.startsWith('software-'));
        const softwareWithoutInstallation = softwareItems.filter(item => !item.installationInfo);
        
        if (softwareWithoutInstallation.length > 0) {
            alert('Veuillez configurer l\'adresse d\'installation pour tous les logiciels avant de continuer.');
            return;
        }
    }

    // Hide current step
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    
    // Update progress indicators
    const currentStepElement = document.querySelector(`.step[data-step="${currentStep}"] .step-number`);
    if (currentStepElement && currentStep < step) {
        currentStepElement.classList.remove('active');
        currentStepElement.classList.add('completed');
    }

    // Update step lines
    if (currentStep < step) {
        const stepLines = document.querySelectorAll('.step-line');
        for (let i = currentStep - 1; i < step - 1; i++) {
            if (stepLines[i]) {
                stepLines[i].classList.add('completed');
            }
        }
    }

    // Show new step
    currentStep = step;
    document.getElementById(`step-${currentStep}`).classList.add('active');
    
    // Update progress indicator
    const newStepElement = document.querySelector(`.step[data-step="${currentStep}"] .step-number`);
    if (newStepElement) {
        newStepElement.classList.add('active');
    }
}

// Process payment
function processPayment() {
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    
    if (paymentMethod === 'card') {
        // Validate card form
        const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
        const cardExpiry = document.getElementById('card-expiry').value;
        const cardCVV = document.getElementById('card-cvv').value;
        const cardName = document.getElementById('card-name').value;

        if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19) {
            alert('Veuillez entrer un numéro de carte valide.');
            return;
        }

        if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
            alert('Veuillez entrer une date d\'expiration valide (MM/AA).');
            return;
        }

        if (!cardCVV || cardCVV.length < 3 || cardCVV.length > 4) {
            alert('Veuillez entrer un CVV valide.');
            return;
        }

        if (!cardName) {
            alert('Veuillez entrer le nom sur la carte.');
            return;
        }
    }

    // Simulate payment processing
    const processBtn = document.getElementById('process-payment-btn');
    processBtn.disabled = true;
    processBtn.textContent = 'Traitement en cours...';

    // Simulate API call
    setTimeout(() => {
        completeOrder();
    }, 2000);
}

// Process PayPal payment
function processPayPalPayment() {
    const processBtn = document.querySelector('.btn-paypal');
    processBtn.disabled = true;
    processBtn.textContent = 'Redirection vers PayPal...';

    // Simulate PayPal redirect
    setTimeout(() => {
        completeOrder();
    }, 2000);
}

// Complete order
function completeOrder() {
    const cart = getCart();
    const loggedInUser = localStorage.getItem('loggedInUser');
    
    // Generate order number
    const orderNumber = 'CMD-' + Date.now();
    
    // Calculate totals
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += (item.price || 0) * (item.quantity || 1);
    });
    
    // Apply discount
    let discount = 0;
    if (appliedPromo) {
        if (appliedPromo.type === 'fixed') {
            discount = appliedPromo.discount;
        } else {
            discount = subtotal * appliedPromo.discount;
        }
    }
    
    const discountedSubtotal = subtotal - discount;
    const tax = discountedSubtotal * 0.20;
    const total = discountedSubtotal + tax;

    // Store order data
    orderData = {
        orderNumber: orderNumber,
        customerName: loggedInUser,
        date: new Date().toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity || 1,
            price: item.price,
            total: (item.price || 0) * (item.quantity || 1),
            icon: item.icon || null,
            installationInfo: item.installationInfo
        })),
        subtotal: subtotal,
        discount: discount,
        promoCode: appliedPromo ? appliedPromo.code : null,
        tax: tax,
        total: total
    };

    // Clear cart
    localStorage.removeItem('cart');
    updateCartCount();

    // Go to confirmation step
    goToStep(3);
    loadStep3();
}

// Load Step 3: Confirmation
function loadStep3() {
    if (!orderData) return;

    // Display order number
    document.getElementById('order-number').textContent = orderData.orderNumber;

    // Display order summary
    const orderSummary = document.getElementById('order-summary');
    orderSummary.innerHTML = `
        <h3>Détails de la commande</h3>
        <table>
            <thead>
                <tr>
                    <th>Article</th>
                    <th>Quantité</th>
                    <th>Prix unitaire</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${orderData.items.map(item => `
                    <tr>
                        <td>
                            <div class="order-item-name">
                                ${item.icon ? `<span class="order-item-icon">${item.icon}</span>` : ''}
                                <span>${item.name}</span>
                            </div>
                        </td>
                        <td>${item.quantity}</td>
                        <td>${item.price.toFixed(2)}€</td>
                        <td>${item.total.toFixed(2)}€</td>
                    </tr>
                `).join('')}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3"><strong>Sous-total</strong></td>
                    <td><strong>${orderData.subtotal.toFixed(2)}€</strong></td>
                </tr>
                ${orderData.discount > 0 ? `
                <tr class="discount-row">
                    <td colspan="3"><strong>Réduction (${orderData.promoCode})</strong></td>
                    <td class="discount-amount"><strong>-${orderData.discount.toFixed(2)}€</strong></td>
                </tr>
                ` : ''}
                <tr>
                    <td colspan="3"><strong>TVA (20%)</strong></td>
                    <td><strong>${orderData.tax.toFixed(2)}€</strong></td>
                </tr>
                <tr>
                    <td colspan="3"><strong>Total</strong></td>
                    <td><strong>${orderData.total.toFixed(2)}€</strong></td>
                </tr>
            </tfoot>
        </table>
        ${orderData.items.some(item => item.installationInfo) ? `
            <div style="margin-top: 2rem;">
                <h4 style="color: #1a1f2e; margin-bottom: 1rem;">Adresses d'installation:</h4>
                ${orderData.items.filter(item => item.installationInfo).map(item => `
                    <div style="background: white; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #ffd700;">
                        <strong>${item.name}</strong><br>
                        ${item.installationInfo.address}
                    </div>
                `).join('')}
            </div>
        ` : ''}
    `;
}

// Download receipt with enhanced features
function downloadReceipt() {
    if (!orderData) return;

    // Use jsPDF if available
    if (typeof window.jspdf !== 'undefined') {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add company branding header with background
        doc.setFillColor(26, 31, 46);
        doc.rect(0, 0, 210, 45, 'F');
        
        // Company name
        doc.setFontSize(24);
        doc.setTextColor(255, 215, 0);
        doc.setFont(undefined, 'bold');
        doc.text('AMK IT Services', 105, 20, { align: 'center' });
        
        // Receipt title
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'normal');
        doc.text('REÇU DE PAIEMENT', 105, 30, { align: 'center' });
        
        // Order number and date
        doc.setFontSize(10);
        doc.text(`N° ${orderData.orderNumber}`, 105, 38, { align: 'center' });

        // Reset text color
        doc.setTextColor(0, 0, 0);

        // Customer and order info section
        let yPos = 55;
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('Informations client:', 20, yPos);
        doc.setFont(undefined, 'normal');
        yPos += 7;
        doc.setFontSize(10);
        doc.text(`Client: ${orderData.customerName}`, 20, yPos);
        yPos += 6;
        doc.text(`Date: ${orderData.date}`, 20, yPos);
        yPos += 6;
        doc.text(`Statut: Payé`, 20, yPos);
        
        // Payment method
        yPos += 6;
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value || 'card';
        doc.text(`Méthode de paiement: ${paymentMethod === 'card' ? 'Carte bancaire' : 'PayPal'}`, 20, yPos);

        // Items table
        yPos += 15;
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('Détails de la commande:', 20, yPos);
        
        yPos += 8;
        doc.setFontSize(9);
        doc.setFillColor(240, 240, 240);
        doc.rect(20, yPos - 5, 170, 7, 'F');
        doc.setTextColor(26, 31, 46);
        doc.text('Article', 22, yPos);
        doc.text('Qté', 110, yPos);
        doc.text('Prix unit.', 130, yPos);
        doc.text('Total', 165, yPos);

        // Table rows
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        yPos += 8;
        
        orderData.items.forEach((item, index) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            
            const itemName = item.name.substring(0, 35);
            doc.text(itemName, 22, yPos);
            doc.text(item.quantity.toString(), 110, yPos);
            doc.text(item.price.toFixed(2) + '€', 130, yPos);
            doc.text(item.total.toFixed(2) + '€', 165, yPos);
            yPos += 6;
            
            // Add subtle line between items
            if (index < orderData.items.length - 1) {
                doc.setDrawColor(230, 230, 230);
                doc.line(20, yPos, 190, yPos);
                yPos += 2;
            }
        });

        // Totals section
        yPos += 8;
        doc.setDrawColor(26, 31, 46);
        doc.setLineWidth(0.5);
        doc.line(120, yPos, 190, yPos);
        yPos += 7;
        
        doc.setFontSize(10);
        doc.text('Sous-total:', 130, yPos);
        doc.text(orderData.subtotal.toFixed(2) + '€', 165, yPos);
        yPos += 6;
        
        // Show discount if applied
        if (orderData.discount > 0) {
            doc.setTextColor(0, 168, 107);
            doc.text(`Réduction (${orderData.promoCode}):`, 130, yPos);
            doc.text(`-${orderData.discount.toFixed(2)}€`, 165, yPos);
            doc.setTextColor(0, 0, 0);
            yPos += 6;
        }
        
        doc.text('TVA (20%):', 130, yPos);
        doc.text(orderData.tax.toFixed(2) + '€', 165, yPos);
        yPos += 8;
        
        // Total with highlight
        doc.setFillColor(255, 215, 0);
        doc.rect(120, yPos - 5, 70, 10, 'F');
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(26, 31, 46);
        doc.text('TOTAL:', 130, yPos);
        doc.text(orderData.total.toFixed(2) + '€', 165, yPos);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');

        // Installation addresses
        const installationItems = orderData.items.filter(item => item.installationInfo);
        if (installationItems.length > 0) {
            yPos += 15;
            if (yPos > 240) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text('Adresses d\'installation:', 20, yPos);
            yPos += 8;
            doc.setFont(undefined, 'normal');
            doc.setFontSize(9);
            
            installationItems.forEach(item => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                
                doc.setFont(undefined, 'bold');
                doc.text(`${item.name}:`, 22, yPos);
                yPos += 5;
                doc.setFont(undefined, 'normal');
                doc.text(`Adresse: ${item.installationInfo.address}`, 25, yPos);
                yPos += 5;
                doc.text(`Date: ${formatDate(item.installationInfo.date)} à ${item.installationInfo.time}`, 25, yPos);
                yPos += 5;
                doc.text(`Contact: ${item.installationInfo.contactName} - ${item.installationInfo.contactPhone}`, 25, yPos);
                yPos += 8;
            });
        }

        // Add QR code placeholder (text-based for now)
        yPos += 10;
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.text('Code de suivi:', 20, yPos);
        yPos += 6;
        doc.setFont(undefined, 'normal');
        doc.setFillColor(240, 240, 240);
        doc.rect(20, yPos - 4, 80, 10, 'F');
        doc.setFontSize(10);
        doc.text(orderData.orderNumber, 22, yPos);

        // Terms and conditions
        yPos += 15;
        if (yPos > 260) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.text('Conditions générales:', 20, yPos);
        yPos += 5;
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        const terms = [
            '• Garantie satisfait ou remboursé de 30 jours',
            '• Support technique disponible 24/7',
            '• Tous les prix incluent la TVA',
            '• Paiement sécurisé et crypté'
        ];
        terms.forEach(term => {
            doc.text(term, 20, yPos);
            yPos += 4;
        });

        // Footer with company info
        doc.setFillColor(26, 31, 46);
        doc.rect(0, 280, 210, 17, 'F');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text('AMK IT Services - 123 Avenue de l\'Innovation, 75001 Paris, France', 105, 287, { align: 'center' });
        doc.text('Email: contact@amkit.com - Tél: +33 1 23 45 67 89', 105, 292, { align: 'center' });

        // Save PDF
        doc.save(`Reçu_${orderData.orderNumber}.pdf`);
        
        // Show success message
        showNotification('✓ Reçu téléchargé avec succès!', 'success');
    } else {
        // Enhanced fallback: create detailed text receipt
        let receiptText = `╔════════════════════════════════════════════════════════╗\n`;
        receiptText += `║           AMK IT SERVICES - REÇU DE PAIEMENT          ║\n`;
        receiptText += `╚════════════════════════════════════════════════════════╝\n\n`;
        receiptText += `Date: ${orderData.date}\n`;
        receiptText += `Numéro de commande: ${orderData.orderNumber}\n`;
        receiptText += `Client: ${orderData.customerName}\n`;
        receiptText += `Statut: Payé\n\n`;
        receiptText += `════════════════════════════════════════════════════════\n`;
        receiptText += `ARTICLES:\n`;
        receiptText += `════════════════════════════════════════════════════════\n\n`;
        
        orderData.items.forEach(item => {
            const itemName = item.icon ? `${item.icon} ${item.name}` : item.name;
            receiptText += `${itemName}\n`;
            receiptText += `  Quantité: ${item.quantity} x ${item.price.toFixed(2)}€ = ${item.total.toFixed(2)}€\n\n`;
        });
        
        receiptText += `────────────────────────────────────────────────────────\n`;
        receiptText += `Sous-total: ${orderData.subtotal.toFixed(2)}€\n`;
        
        if (orderData.discount > 0) {
            receiptText += `Réduction (${orderData.promoCode}): -${orderData.discount.toFixed(2)}€\n`;
        }
        
        receiptText += `TVA (20%): ${orderData.tax.toFixed(2)}€\n`;
        receiptText += `════════════════════════════════════════════════════════\n`;
        receiptText += `TOTAL: ${orderData.total.toFixed(2)}€\n`;
        receiptText += `════════════════════════════════════════════════════════\n\n`;
        
        if (orderData.items.some(item => item.installationInfo)) {
            receiptText += `ADRESSES D'INSTALLATION:\n`;
            receiptText += `────────────────────────────────────────────────────────\n`;
            orderData.items.filter(item => item.installationInfo).forEach(item => {
                receiptText += `\n${item.name}:\n`;
                receiptText += `  Adresse: ${item.installationInfo.address}\n`;
                receiptText += `  Date: ${formatDate(item.installationInfo.date)}\n`;
                receiptText += `  Heure: ${item.installationInfo.time}\n`;
                receiptText += `  Contact: ${item.installationInfo.contactName}\n`;
                receiptText += `  Téléphone: ${item.installationInfo.contactPhone}\n`;
            });
            receiptText += `\n`;
        }
        
        receiptText += `\n════════════════════════════════════════════════════════\n`;
        receiptText += `Merci pour votre confiance!\n`;
        receiptText += `AMK IT Services - contact@amkit.com - +33 1 23 45 67 89\n`;
        receiptText += `════════════════════════════════════════════════════════\n`;

        // Create blob and download
        const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reçu_${orderData.orderNumber}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        showNotification('✓ Reçu téléchargé avec succès!', 'success');
    }
}

// Print receipt
function printReceipt() {
    if (!orderData) return;
    
    // Create a printable version
    const printWindow = window.open('', '_blank');
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Reçu - ${orderData.orderNumber}</title>
            <style>
                @media print {
                    @page { margin: 1cm; }
                    body { margin: 0; }
                }
                body {
                    font-family: 'Arial', sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    color: #1a1f2e;
                }
                .header {
                    background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }
                .header h1 {
                    margin: 0;
                    color: #ffd700;
                    font-size: 28px;
                }
                .header h2 {
                    margin: 10px 0 0 0;
                    font-size: 16px;
                    font-weight: normal;
                }
                .order-info {
                    background: #f8f9fa;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 8px;
                }
                .order-info p {
                    margin: 8px 0;
                }
                .order-info strong {
                    color: #1a1f2e;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                thead {
                    background: #1a1f2e;
                    color: white;
                }
                th, td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #e0e0e0;
                }
                th {
                    font-weight: 600;
                }
                .totals {
                    margin-top: 20px;
                    text-align: right;
                }
                .totals p {
                    margin: 8px 0;
                    font-size: 14px;
                }
                .total-final {
                    background: #ffd700;
                    padding: 15px;
                    border-radius: 8px;
                    font-size: 18px;
                    font-weight: bold;
                    color: #1a1f2e;
                    margin-top: 10px;
                }
                .installation-section {
                    margin: 30px 0;
                    padding: 20px;
                    background: #f0f9ff;
                    border-left: 4px solid #ffd700;
                    border-radius: 8px;
                }
                .installation-item {
                    margin: 15px 0;
                }
                .footer {
                    margin-top: 40px;
                    padding: 20px;
                    background: #1a1f2e;
                    color: white;
                    text-align: center;
                    border-radius: 0 0 10px 10px;
                    font-size: 12px;
                }
                .terms {
                    margin: 30px 0;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    font-size: 12px;
                    color: #666;
                }
                .terms ul {
                    margin: 10px 0;
                    padding-left: 20px;
                }
                .terms li {
                    margin: 5px 0;
                }
                .discount-row {
                    color: #00a86b;
                }
                @media print {
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>AMK IT Services</h1>
                <h2>REÇU DE PAIEMENT</h2>
                <p style="margin-top: 10px;">N° ${orderData.orderNumber}</p>
            </div>
            
            <div class="order-info">
                <p><strong>Client:</strong> ${orderData.customerName}</p>
                <p><strong>Date:</strong> ${orderData.date}</p>
                <p><strong>Statut:</strong> <span style="color: #00a86b;">✓ Payé</span></p>
            </div>
            
            <h3>Détails de la commande</h3>
            <table>
                <thead>
                    <tr>
                        <th>Article</th>
                        <th>Quantité</th>
                        <th>Prix unitaire</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${orderData.items.map(item => `
                        <tr>
                            <td>${item.icon ? item.icon + ' ' : ''}${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>${item.price.toFixed(2)}€</td>
                            <td>${item.total.toFixed(2)}€</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="totals">
                <p>Sous-total: <strong>${orderData.subtotal.toFixed(2)}€</strong></p>
                ${orderData.discount > 0 ? `
                    <p class="discount-row">Réduction (${orderData.promoCode}): <strong>-${orderData.discount.toFixed(2)}€</strong></p>
                ` : ''}
                <p>TVA (20%): <strong>${orderData.tax.toFixed(2)}€</strong></p>
                <div class="total-final">
                    TOTAL: ${orderData.total.toFixed(2)}€
                </div>
            </div>
            
            ${orderData.items.some(item => item.installationInfo) ? `
                <div class="installation-section">
                    <h3>Adresses d'installation</h3>
                    ${orderData.items.filter(item => item.installationInfo).map(item => `
                        <div class="installation-item">
                            <p><strong>${item.name}</strong></p>
                            <p>Adresse: ${item.installationInfo.address}</p>
                            <p>Date: ${formatDate(item.installationInfo.date)} à ${item.installationInfo.time}</p>
                            <p>Contact: ${item.installationInfo.contactName} - ${item.installationInfo.contactPhone}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <div class="terms">
                <h4>Conditions générales</h4>
                <ul>
                    <li>Garantie satisfait ou remboursé de 30 jours</li>
                    <li>Support technique disponible 24/7</li>
                    <li>Tous les prix incluent la TVA</li>
                    <li>Paiement sécurisé et crypté</li>
                </ul>
            </div>
            
            <div class="footer">
                <p>AMK IT Services - 123 Avenue de l'Innovation, 75001 Paris, France</p>
                <p>Email: contact@amkit.com - Tél: +33 1 23 45 67 89</p>
                <p style="margin-top: 10px;">Merci pour votre confiance!</p>
            </div>
            
            <div class="no-print" style="text-align: center; margin: 20px 0;">
                <button onclick="window.print()" style="padding: 12px 24px; background: #ffd700; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px;">
                    🖨️ Imprimer
                </button>
                <button onclick="window.close()" style="padding: 12px 24px; background: #e0e0e0; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin-left: 10px; font-size: 14px;">
                    Fermer
                </button>
            </div>
        </body>
        </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
}

// Email receipt
function emailReceipt() {
    if (!orderData) return;
    
    showNotification('📧 Un reçu a été envoyé à votre adresse email', 'success');
    
    // Simulate email sending
    setTimeout(() => {
        alert(`Reçu envoyé avec succès!\n\nNuméro de commande: ${orderData.orderNumber}\nUn email de confirmation a été envoyé à l'adresse associée à votre compte.`);
    }, 500);
}

// Share receipt
function shareReceipt() {
    if (!orderData) return;
    
    const shareText = `Commande AMK IT Services\nN° ${orderData.orderNumber}\nTotal: ${orderData.total.toFixed(2)}€\nDate: ${orderData.date}`;
    
    // Check if Web Share API is available
    if (navigator.share) {
        navigator.share({
            title: 'Reçu AMK IT Services',
            text: shareText,
            url: window.location.href
        }).then(() => {
            showNotification('✓ Reçu partagé avec succès!', 'success');
        }).catch((error) => {
            console.log('Error sharing:', error);
            fallbackShare(shareText);
        });
    } else {
        fallbackShare(shareText);
    }
}

// Fallback share method
function fallbackShare(text) {
    // Copy to clipboard
    navigator.clipboard.writeText(text).then(() => {
        showNotification('✓ Détails de la commande copiés dans le presse-papiers!', 'success');
    }).catch(() => {
        // Show share modal if clipboard fails
        showShareModal(text);
    });
}

// Show share modal
function showShareModal(text) {
    const modal = document.createElement('div');
    modal.className = 'tracking-modal-overlay';
    modal.innerHTML = `
        <div class="tracking-modal" style="max-width: 500px;">
            <div class="modal-header">
                <h2>Partager le reçu</h2>
                <button class="modal-close" onclick="this.closest('.tracking-modal-overlay').remove()">✕</button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 15px; color: #666;">Partagez les détails de votre commande:</p>
                <textarea readonly style="width: 100%; height: 150px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-family: monospace; font-size: 12px; resize: none;">${text}</textarea>
                <div style="display: flex; gap: 10px; margin-top: 15px; justify-content: center;">
                    <button onclick="copyShareText(this)" class="btn-primary" style="flex: 1;">
                        📋 Copier
                    </button>
                    <button onclick="this.closest('.tracking-modal-overlay').remove()" class="btn-secondary" style="flex: 1;">
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Copy share text
function copyShareText(button) {
    const textarea = button.closest('.modal-body').querySelector('textarea');
    textarea.select();
    document.execCommand('copy');
    showNotification('✓ Copié dans le presse-papiers!', 'success');
    button.closest('.tracking-modal-overlay').remove();
}

// Show notification helper
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #00d4ff, #00b8d4)' : 'linear-gradient(135deg, #ffd700, #ffed4e)'};
        color: ${type === 'success' ? 'white' : '#1a1f2e'};
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        font-weight: 600;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Track order
function trackOrder() {
    if (!orderData) return;
    
    // Create a simple tracking modal
    const modal = document.createElement('div');
    modal.className = 'tracking-modal-overlay';
    modal.innerHTML = `
        <div class="tracking-modal">
            <div class="modal-header">
                <h2>Suivi de commande</h2>
                <button class="modal-close" onclick="this.closest('.tracking-modal-overlay').remove()">✕</button>
            </div>
            <div class="modal-body">
                <p class="tracking-order-number">Commande: <strong>${orderData.orderNumber}</strong></p>
                <div class="tracking-timeline">
                    <div class="tracking-step completed">
                        <div class="tracking-icon">✓</div>
                        <div class="tracking-info">
                            <h4>Commande confirmée</h4>
                            <p>${orderData.date}</p>
                        </div>
                    </div>
                    <div class="tracking-step active">
                        <div class="tracking-icon">📦</div>
                        <div class="tracking-info">
                            <h4>En préparation</h4>
                            <p>Votre commande est en cours de traitement</p>
                        </div>
                    </div>
                    <div class="tracking-step">
                        <div class="tracking-icon">🚚</div>
                        <div class="tracking-info">
                            <h4>En livraison</h4>
                            <p>Bientôt disponible</p>
                        </div>
                    </div>
                    <div class="tracking-step">
                        <div class="tracking-icon">✓</div>
                        <div class="tracking-info">
                            <h4>Livrée</h4>
                            <p>En attente</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}


