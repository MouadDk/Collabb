document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        if (!username || !password) {
            alert('Both fields are required.');
            return;
        }

        const users = window.getUsers();
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            window.setLoggedInUser(username);
            window.location.href = 'Home_Page_Logged_In.html';
        } else {
            alert('Invalid username or password.');
        }
    });
});
