document.addEventListener('DOMContentLoaded', () => {
    // Function to get users from local storage
    window.getUsers = () => {
        return JSON.parse(localStorage.getItem('users')) || [];
    };

    // Function to set users to local storage
    window.setUsers = (users) => {
        localStorage.setItem('users', JSON.stringify(users));
    };

    // Function to get the logged-in user
    window.getLoggedInUser = () => {
        return localStorage.getItem('loggedInUser');
    };

    // Function to set the logged-in user
    window.setLoggedInUser = (username) => {
        localStorage.setItem('loggedInUser', username);
    };

    // Function to clear the logged-in user
    window.clearLoggedInUser = () => {
        localStorage.removeItem('loggedInUser');
    };
});