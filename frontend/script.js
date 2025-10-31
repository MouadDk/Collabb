document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.querySelector('.auth-form form'); // Assuming signup and login forms have .auth-form parent

    if (signupForm && window.location.pathname === '/signup') {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (password !== confirmPassword) {
                alert('Les mots de passe ne correspondent pas!');
                return;
            }

            try {
                const response = await fetch('/api/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message);
                    window.location.href = '/login'; // Redirect to login page on successful signup
                } else {
                    alert(data.message || 'Erreur lors de l\'inscription.');
                }
            } catch (error) {
                console.error('Erreur:', error);
                alert('Une erreur est survenue. Veuillez réessayer.');
            }
        });
    }

    const loginForm = document.querySelector('.auth-form form'); // Assuming signup and login forms have .auth-form parent

    if (loginForm && window.location.pathname === '/login') {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message);
                    // In a real app, you'd store a token/session here
                    window.location.href = '/'; // Redirect to homepage on successful login
                } else {
                    alert(data.message || 'Erreur lors de la connexion.');
                }
            } catch (error) {
                console.error('Erreur:', error);
                alert('Une erreur est survenue. Veuillez réessayer.');
            }
        });
    }
});