document.addEventListener('DOMContentLoaded', () => {
    // Prevent multiple executions
    if (window.isPageLoaded) return;
    window.isPageLoaded = true;
    
    const navLinks = document.querySelectorAll('.nav-links a');
    const loggedInUser = localStorage.getItem('loggedInUser');
    
    // Ne pas rediriger automatiquement, laisser l'utilisateur naviguer manuellement
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'Login_page.html' && currentPage !== 'sign_up.html' && !loggedInUser) {
        // Optionnel : ajouter un message pour informer l'utilisateur qu'il n'est pas connecté
        console.log('Utilisateur non connecté');
    }

    navLinks.forEach(link => {
        const currentPath = window.location.pathname;
        const currentFileName = currentPath.split('/').pop() || 'Welcome_Page.html';
        
        if (link.getAttribute('href') === currentFileName) {
            link.classList.add('active');
        }

        // Adjust login/signup/logout links
        if (link.getAttribute('href') === 'Login_page.html') {
            // This link could be either "S'inscrire" or "Se connecter"
            // We need to differentiate them by their original text or a data attribute if available
            // For now, let's assume the last two links are signup and login/logout
            const linkText = link.textContent.trim();

            if (linkText === "S'inscrire") {
                if (loggedInUser) {
                    link.textContent = `Welcome, ${loggedInUser}`;
                    link.href = '#'; // Make it non-clickable or point to a profile page
                } else {
                    link.href = 'Login_page.html';
                }
            } else if (linkText === "Se connecter") {
                if (loggedInUser) {
                    link.textContent = 'Logout';
                    link.href = '#'; // Make it a clickable logout action
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        localStorage.removeItem('loggedInUser');
                        window.location.href = 'Login_page.html';
                    });
                } else {
                    link.href = 'Login_page.html';
                }
            }
        }
    });
});