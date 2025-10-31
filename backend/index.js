const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const saltRounds = 10; // For bcrypt hashing

const app = express();
const PORT = process.env.PORT || 3000;

// MySQL Connection Pool
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', // Default XAMPP MySQL user
    password: '', // Default XAMPP MySQL password
    database: 'site_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware to make the pool available to routes
app.use((req, res, next) => {
    req.pool = pool;
    next();
});

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Define routes for HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/signup.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/software', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/software.html'));
});

app.get('/services', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/services.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/cart.html'));
});

app.get('/invoice', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/invoice.html'));
});

app.get('/payment', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/payment.html'));
});


// API for user registration
app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const [result] = await req.pool.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );
        res.status(201).json({ message: 'User registered successfully!', userId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Username or email already exists.' });
        }
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// API for user login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const [rows] = await req.pool.execute(
            'SELECT id, username, password FROM users WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            // In a real application, you would generate a JWT or session here
            res.status(200).json({ message: 'Login successful!', userId: user.id, username: user.username });
        } else {
            res.status(401).json({ message: 'Invalid credentials.' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});