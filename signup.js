document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');

    // Defensive guard
    if (!signupForm) return;

    // Fallback helpers if script.js wasn't loaded
    const getUsers = window.getUsers || (() => JSON.parse(localStorage.getItem('users')) || []);
    const setUsers = window.setUsers || ((users) => localStorage.setItem('users', JSON.stringify(users)));
    const setLoggedInUser = window.setLoggedInUser || ((username) => localStorage.setItem('loggedInUser', username));

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
            const username = document.getElementById('signup-username').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirm-password').value;

            if (!username || !password || !confirmPassword) {
                alert('All fields are required.');
                return;
            }

            if (password !== confirmPassword) {
                alert('Passwords do not match.');
                return;
            }

            const users = getUsers();
            if (users.some(u => u.username === username)) {
                alert('Username already exists. Please choose a different one.');
                return;
            }

            users.push({ username, password });
            setUsers(users);

            setLoggedInUser(username);
            window.location.href = 'Home_Page_Logged_In.html';
        } catch (error) {
            console.error('Signup form submission error:', error);
            alert('An error occurred during signup. Please try again.');
        }
    });
});