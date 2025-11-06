document.addEventListener('DOMContentLoaded', () => {
    // Prevent multiple executions
    if (window.isPageLoaded) return;
    window.isPageLoaded = true;
    
    const navButtons = document.querySelectorAll('.nav-buttons a');
    const loggedInUser = localStorage.getItem('loggedInUser');

    navButtons.forEach(button => {
        const buttonText = button.textContent.trim();

        if (buttonText === "Commencer maintenant") {
            if (loggedInUser) {
                button.href = 'home.html'; // Redirect to home page if logged in
            } else {
                button.href = 'sign_up.html'; // Keep original link for signup
            }
        } else if (buttonText === "Se connecter") {
            if (loggedInUser) {
                button.textContent = 'Logout';
                button.href = '#'; // Make it a clickable logout action
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('loggedInUser');
                    window.location.href = 'Login_page.html';
                });
            } else {
                button.href = 'Login_page.html'; // Keep original link for login
            }
        }
    });
});