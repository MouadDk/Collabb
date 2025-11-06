document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-links a');
    const loggedInUser = localStorage.getItem('loggedInUser');

    navLinks.forEach(link => {
        // Highlight active link
        // Highlight active link - adjust to check for relative paths
        const currentFileName = window.location.pathname.split('/').pop();
        if (link.getAttribute('href') === currentFileName || (currentFileName === 'home.html' && link.getAttribute('href') === 'home.html')) {
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