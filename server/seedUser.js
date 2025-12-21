const pool = require('./db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedUser() {
    try {
        // Create tables if not exist
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Check if user exists
        const existing = await pool.query("SELECT * FROM users WHERE email = $1", ['admin@test.com']);
        
        if (existing.rows.length > 0) {
            console.log('User already exists!');
            console.log('Email: admin@test.com');
            console.log('Password: 123456');
            process.exit(0);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        // Insert user
        await pool.query(
            "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)",
            ['Admin', 'admin@test.com', hashedPassword]
        );

        console.log('✅ User created successfully!');
        console.log('Email: admin@test.com');
        console.log('Password: 123456');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

seedUser();
