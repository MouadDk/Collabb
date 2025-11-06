document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    // Defensive: if form doesn't exist, do nothing
    if (!loginForm) return;

    // Fallback helpers in case script.js wasn't loaded
    const getUsers = window.getUsers || (() => JSON.parse(localStorage.getItem('users')) || []);
    const setLoggedInUser = window.setLoggedInUser || ((username) => localStorage.setItem('loggedInUser', username));

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        if (!username || !password) {
            alert('Both fields are required.');
            return;
        }

        const users = getUsers();
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            setLoggedInUser(username);
            window.location.href = 'Home_Page_Logged_In.html';
        } else {
            alert('Invalid username or password.');
        }
    });
});
