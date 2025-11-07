// Checkout Page JavaScript
let currentStep = 1;
let orderData = null;

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
});

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

        itemElement.innerHTML = `
            <img src="${item.image || 'https://via.placeholder.com/100x100'}" alt="${item.name}" class="checkout-item-image" onerror="this.src='https://via.placeholder.com/100x100'">
            <div class="checkout-item-details">
                <h4>${item.name}</h4>
                <p>Quantité: ${item.quantity || 1}</p>
                <p>Prix unitaire: ${item.price.toFixed(2)}€</p>
            </div>
            <div class="checkout-item-price">${itemTotal.toFixed(2)}€</div>
        `;
        cartItemsContainer.appendChild(itemElement);
    });

    // Calculate totals
    const tax = subtotal * 0.20;
    const total = subtotal + tax;

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
    const tax = subtotal * 0.20;
    const total = subtotal + tax;

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
            installationInfo: item.installationInfo
        })),
        subtotal: subtotal,
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
                        <td>${item.name}</td>
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

// Download receipt
function downloadReceipt() {
    if (!orderData) return;

    // Use jsPDF if available
    if (typeof window.jspdf !== 'undefined') {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Company name and date
        doc.setFontSize(20);
        doc.text('AMK IT Services', 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Date: ${orderData.date}`, 105, 30, { align: 'center' });
        doc.text(`Numéro de commande: ${orderData.orderNumber}`, 105, 37, { align: 'center' });

        // Customer info
        doc.setFontSize(14);
        doc.text(`Client: ${orderData.customerName}`, 20, 50);

        // Table header
        let yPos = 65;
        doc.setFontSize(10);
        doc.setFillColor(26, 31, 46);
        doc.rect(20, yPos - 5, 170, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text('Article', 22, yPos);
        doc.text('Qté', 100, yPos);
        doc.text('Prix unit.', 120, yPos);
        doc.text('Total', 160, yPos);

        // Table rows
        doc.setTextColor(0, 0, 0);
        yPos += 8;
        orderData.items.forEach(item => {
            doc.text(item.name.substring(0, 30), 22, yPos);
            doc.text(item.quantity.toString(), 100, yPos);
            doc.text(item.price.toFixed(2) + '€', 120, yPos);
            doc.text(item.total.toFixed(2) + '€', 160, yPos);
            yPos += 7;
        });

        // Totals
        yPos += 5;
        doc.setFontSize(11);
        doc.text('Sous-total:', 120, yPos);
        doc.text(orderData.subtotal.toFixed(2) + '€', 160, yPos);
        yPos += 7;
        doc.text('TVA (20%):', 120, yPos);
        doc.text(orderData.tax.toFixed(2) + '€', 160, yPos);
        yPos += 7;
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Total:', 120, yPos);
        doc.text(orderData.total.toFixed(2) + '€', 160, yPos);

        // Installation addresses
        const installationItems = orderData.items.filter(item => item.installationInfo);
        if (installationItems.length > 0) {
            yPos += 15;
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text('Adresses d\'installation:', 20, yPos);
            yPos += 7;
            doc.setFont(undefined, 'normal');
            installationItems.forEach(item => {
                doc.setFontSize(10);
                doc.text(`${item.name}:`, 22, yPos);
                yPos += 5;
                doc.text(item.installationInfo.address, 25, yPos);
                yPos += 8;
            });
        }

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text('AMK IT Services - 123 Avenue de l\'Innovation, 75001 Paris, France', 105, 280, { align: 'center' });
        doc.text('Email: contact@amkit.com - Tél: +33 1 23 45 67 89', 105, 285, { align: 'center' });

        // Save PDF
        doc.save(`Reçu_${orderData.orderNumber}.pdf`);
    } else {
        // Fallback: create text receipt
        let receiptText = `AMK IT SERVICES\n`;
        receiptText += `========================\n\n`;
        receiptText += `Date: ${orderData.date}\n`;
        receiptText += `Numéro de commande: ${orderData.orderNumber}\n`;
        receiptText += `Client: ${orderData.customerName}\n\n`;
        receiptText += `ARTICLES:\n`;
        receiptText += `------------------------\n`;
        orderData.items.forEach(item => {
            receiptText += `${item.name} - Qté: ${item.quantity} - Prix unitaire: ${item.price.toFixed(2)}€ - Total: ${item.total.toFixed(2)}€\n`;
        });
        receiptText += `\nSous-total: ${orderData.subtotal.toFixed(2)}€\n`;
        receiptText += `TVA (20%): ${orderData.tax.toFixed(2)}€\n`;
        receiptText += `TOTAL: ${orderData.total.toFixed(2)}€\n\n`;
        
        if (orderData.items.some(item => item.installationInfo)) {
            receiptText += `ADRESSES D'INSTALLATION:\n`;
            receiptText += `------------------------\n`;
            orderData.items.filter(item => item.installationInfo).forEach(item => {
                receiptText += `${item.name}: ${item.installationInfo.address}\n`;
            });
        }

        // Create blob and download
        const blob = new Blob([receiptText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reçu_${orderData.orderNumber}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }
}


