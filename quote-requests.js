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

    // Load quote requests
    loadQuoteRequests();

    // Filter tabs
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const status = tab.getAttribute('data-status');
            filterQuotes(status);
        });
    });
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

// Load quote requests
function loadQuoteRequests(filterStatus = 'all') {
    const quoteRequests = JSON.parse(localStorage.getItem('quoteRequests')) || [];
    const quotesList = document.getElementById('quotesList');
    const emptyState = document.getElementById('emptyState');

    if (quoteRequests.length === 0) {
        emptyState.style.display = 'block';
        quotesList.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    quotesList.style.display = 'block';

    // Filter quotes
    let filteredQuotes = quoteRequests;
    if (filterStatus !== 'all') {
        filteredQuotes = quoteRequests.filter(q => q.status === filterStatus);
    }

    // Sort by date (newest first)
    filteredQuotes.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));

    // Render quotes
    quotesList.innerHTML = filteredQuotes.map(quote => renderQuoteCard(quote)).join('');

    // Show empty message if no quotes match filter
    if (filteredQuotes.length === 0) {
        quotesList.innerHTML = `
            <div class="no-results">
                <p>Aucune demande de devis avec ce statut</p>
            </div>
        `;
    }
}

// Render quote card
function renderQuoteCard(quote) {
    const statusInfo = getStatusInfo(quote.status);
    const date = new Date(quote.submittedDate);
    const formattedDate = date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `
        <div class="quote-card" data-id="${quote.id}">
            <div class="quote-card-header">
                <div class="quote-item-info">
                    <span class="quote-icon">${quote.itemIcon}</span>
                    <div>
                        <h3>${quote.itemName}</h3>
                        <p class="quote-id">Demande #${quote.id}</p>
                    </div>
                </div>
                <span class="status-badge ${quote.status}">${statusInfo.label}</span>
            </div>
            
            <div class="quote-card-body">
                <div class="quote-details">
                    <div class="detail-row">
                        <span class="detail-label">Entreprise:</span>
                        <span class="detail-value">${quote.companyName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Contact:</span>
                        <span class="detail-value">${quote.contactPerson}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date de soumission:</span>
                        <span class="detail-value">${formattedDate}</span>
                    </div>
                    ${quote.quotedPrice ? `
                        <div class="detail-row highlight">
                            <span class="detail-label">Prix proposé:</span>
                            <span class="detail-value price">${quote.quotedPrice}€</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="quote-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${getProgressWidth(quote.status)}%"></div>
                    </div>
                    <p class="progress-text">${statusInfo.message}</p>
                </div>
            </div>
            
            <div class="quote-card-actions">
                <button class="btn-view" onclick="viewQuoteDetails('${quote.id}')">
                    <span>👁️</span>
                    <span>Voir détails</span>
                </button>
                ${quote.status === 'quote_sent' && quote.quotedPrice ? `
                    <button class="btn-accept" onclick="acceptQuote('${quote.id}')">
                        <span>✓</span>
                        <span>Accepter</span>
                    </button>
                ` : ''}
                ${quote.status === 'pending' ? `
                    <button class="btn-cancel" onclick="cancelQuote('${quote.id}')">
                        <span>✕</span>
                        <span>Annuler</span>
                    </button>
                ` : ''}
                <button class="btn-download" onclick="downloadQuoteSummary('${quote.id}')">
                    <span>📄</span>
                    <span>Télécharger</span>
                </button>
            </div>
        </div>
    `;
}

// Get status info
function getStatusInfo(status) {
    const statusMap = {
        'pending': {
            label: 'En attente',
            message: 'Votre demande est en cours de traitement',
            color: '#ffd700'
        },
        'in_review': {
            label: 'En examen',
            message: 'Notre équipe examine votre demande',
            color: '#00d4ff'
        },
        'quote_sent': {
            label: 'Devis envoyé',
            message: 'Un devis vous a été envoyé',
            color: '#00a86b'
        },
        'accepted': {
            label: 'Accepté',
            message: 'Devis accepté',
            color: '#00c97a'
        },
        'declined': {
            label: 'Refusé',
            message: 'Devis refusé',
            color: '#ff6b6b'
        }
    };
    return statusMap[status] || statusMap['pending'];
}

// Get progress width
function getProgressWidth(status) {
    const progressMap = {
        'pending': 25,
        'in_review': 50,
        'quote_sent': 75,
        'accepted': 100,
        'declined': 100
    };
    return progressMap[status] || 0;
}

// Filter quotes
function filterQuotes(status) {
    loadQuoteRequests(status);
}

// View quote details
function viewQuoteDetails(quoteId) {
    const quoteRequests = JSON.parse(localStorage.getItem('quoteRequests')) || [];
    const quote = quoteRequests.find(q => q.id === quoteId);
    
    if (!quote) return;

    const modal = document.createElement('div');
    modal.className = 'quote-modal-overlay';
    modal.innerHTML = `
        <div class="quote-modal details-modal">
            <div class="quote-modal-header">
                <h2>Détails de la Demande</h2>
                <button class="quote-modal-close" onclick="this.closest('.quote-modal-overlay').remove()">✕</button>
            </div>
            <div class="quote-modal-body">
                <div class="details-section">
                    <h3>Informations générales</h3>
                    <div class="details-grid">
                        <div class="detail-item">
                            <span class="label">Numéro de demande:</span>
                            <span class="value">${quote.id}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Service/Logiciel:</span>
                            <span class="value">${quote.itemIcon} ${quote.itemName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Statut:</span>
                            <span class="value"><span class="status-badge ${quote.status}">${getStatusInfo(quote.status).label}</span></span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Date de soumission:</span>
                            <span class="value">${new Date(quote.submittedDate).toLocaleDateString('fr-FR')}</span>
                        </div>
                    </div>
                </div>

                <div class="details-section">
                    <h3>Informations de l'entreprise</h3>
                    <div class="details-grid">
                        <div class="detail-item">
                            <span class="label">Entreprise:</span>
                            <span class="value">${quote.companyName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Taille:</span>
                            <span class="value">${quote.companySize} employés</span>
                        </div>
                    </div>
                </div>

                <div class="details-section">
                    <h3>Contact</h3>
                    <div class="details-grid">
                        <div class="detail-item">
                            <span class="label">Personne de contact:</span>
                            <span class="value">${quote.contactPerson}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Email:</span>
                            <span class="value">${quote.email}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Téléphone:</span>
                            <span class="value">${quote.phone}</span>
                        </div>
                        ${quote.preferredDate ? `
                            <div class="detail-item">
                                <span class="label">Date de contact préférée:</span>
                                <span class="value">${new Date(quote.preferredDate).toLocaleDateString('fr-FR')}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div class="details-section">
                    <h3>Description du projet</h3>
                    <p class="description-text">${quote.projectDescription}</p>
                </div>

                <div class="details-section">
                    <h3>Exigences spécifiques</h3>
                    <p class="description-text">${quote.requirements}</p>
                </div>

                ${quote.budgetRange ? `
                    <div class="details-section">
                        <h3>Budget estimé</h3>
                        <p class="description-text">${quote.budgetRange}</p>
                    </div>
                ` : ''}

                ${quote.quotedPrice ? `
                    <div class="details-section highlight-section">
                        <h3>Devis proposé</h3>
                        <div class="quote-price">
                            <span class="price-label">Prix:</span>
                            <span class="price-value">${quote.quotedPrice}€</span>
                        </div>
                        ${quote.quoteValidUntil ? `
                            <p class="validity">Valide jusqu'au ${new Date(quote.quoteValidUntil).toLocaleDateString('fr-FR')}</p>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Accept quote
function acceptQuote(quoteId) {
    if (!confirm('Êtes-vous sûr de vouloir accepter ce devis?')) return;

    const quoteRequests = JSON.parse(localStorage.getItem('quoteRequests')) || [];
    const quoteIndex = quoteRequests.findIndex(q => q.id === quoteId);
    
    if (quoteIndex > -1) {
        quoteRequests[quoteIndex].status = 'accepted';
        localStorage.setItem('quoteRequests', JSON.stringify(quoteRequests));
        
        showNotification('✓ Devis accepté avec succès!', 'success');
        loadQuoteRequests();
    }
}

// Cancel quote
function cancelQuote(quoteId) {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette demande de devis?')) return;

    let quoteRequests = JSON.parse(localStorage.getItem('quoteRequests')) || [];
    quoteRequests = quoteRequests.filter(q => q.id !== quoteId);
    localStorage.setItem('quoteRequests', JSON.stringify(quoteRequests));
    
    showNotification('Demande de devis annulée', 'info');
    loadQuoteRequests();
}

// Download quote summary
function downloadQuoteSummary(quoteId) {
    const quoteRequests = JSON.parse(localStorage.getItem('quoteRequests')) || [];
    const quote = quoteRequests.find(q => q.id === quoteId);
    
    if (!quote) return;

    let summaryText = `═══════════════════════════════════════════════════════\n`;
    summaryText += `           AMK IT SERVICES - DEMANDE DE DEVIS          \n`;
    summaryText += `═══════════════════════════════════════════════════════\n\n`;
    summaryText += `Numéro de demande: ${quote.id}\n`;
    summaryText += `Date: ${new Date(quote.submittedDate).toLocaleDateString('fr-FR')}\n`;
    summaryText += `Statut: ${getStatusInfo(quote.status).label}\n\n`;
    summaryText += `───────────────────────────────────────────────────────\n`;
    summaryText += `SERVICE/LOGICIEL\n`;
    summaryText += `───────────────────────────────────────────────────────\n`;
    summaryText += `${quote.itemName}\n\n`;
    summaryText += `───────────────────────────────────────────────────────\n`;
    summaryText += `INFORMATIONS ENTREPRISE\n`;
    summaryText += `───────────────────────────────────────────────────────\n`;
    summaryText += `Entreprise: ${quote.companyName}\n`;
    summaryText += `Taille: ${quote.companySize} employés\n\n`;
    summaryText += `───────────────────────────────────────────────────────\n`;
    summaryText += `CONTACT\n`;
    summaryText += `───────────────────────────────────────────────────────\n`;
    summaryText += `Nom: ${quote.contactPerson}\n`;
    summaryText += `Email: ${quote.email}\n`;
    summaryText += `Téléphone: ${quote.phone}\n\n`;
    summaryText += `───────────────────────────────────────────────────────\n`;
    summaryText += `DESCRIPTION DU PROJET\n`;
    summaryText += `───────────────────────────────────────────────────────\n`;
    summaryText += `${quote.projectDescription}\n\n`;
    summaryText += `───────────────────────────────────────────────────────\n`;
    summaryText += `EXIGENCES SPÉCIFIQUES\n`;
    summaryText += `───────────────────────────────────────────────────────\n`;
    summaryText += `${quote.requirements}\n\n`;
    
    if (quote.budgetRange) {
        summaryText += `Budget estimé: ${quote.budgetRange}\n\n`;
    }
    
    if (quote.quotedPrice) {
        summaryText += `═══════════════════════════════════════════════════════\n`;
        summaryText += `DEVIS PROPOSÉ: ${quote.quotedPrice}€\n`;
        summaryText += `═══════════════════════════════════════════════════════\n\n`;
    }
    
    summaryText += `\nAMK IT Services - contact@amkit.com - +33 1 23 45 67 89\n`;

    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Demande_Devis_${quote.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('✓ Résumé téléchargé', 'success');
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
    }, 3000);
}