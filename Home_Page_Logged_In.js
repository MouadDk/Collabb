document.addEventListener('DOMContentLoaded', () => {
    // Prevent multiple executions
    if (window.isPageLoaded) return;
    window.isPageLoaded = true;

    const userNameSpan = document.getElementById('userName');
    const loggedInUser = localStorage.getItem('loggedInUser');

    if (loggedInUser) {
        userNameSpan.textContent = `Welcome, ${loggedInUser}`;
        // Add a logout button or make the username clickable for logout
        userNameSpan.style.cursor = 'pointer';
        userNameSpan.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('loggedInUser');
            window.location.href = 'Login_page.html'; // Redirect to login page after logout
        });
    } else {
        // If no user is logged in, redirect to the login page
        window.location.href = 'Login_page.html';
    }
});