// src/controllers/authController.js

import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

export const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Wymagane pola: username i password." });

    try {
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        const result = await pool.query(
            `INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id, username;`,
            [username, email || null, passwordHash]
        );

        const newUser = result.rows[0];

        // INICJALIZACJA DANYCH GRACZA
        await pool.query(`INSERT INTO player_data (user_id, credits) VALUES ($1, 100);`, [newUser.user_id]);

        return res.status(201).json({ message: "Rejestracja udana.", user: { user_id: newUser.user_id, username: newUser.username } });

    } catch (error) {
        if (error.code === '23505') return res.status(409).json({ message: "Nazwa użytkownika lub email są już zajęte." });
        console.error("Błąd rejestracji:", error);
        return res.status(500).json({ message: "Błąd serwera podczas rejestracji." });
    }
};

export const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const userResult = await pool.query(`SELECT user_id, username, password_hash FROM users WHERE username = $1;`, [username]);
        const user = userResult.rows[0];

        if (!user) return res.status(401).json({ message: "Nieprawidłowa nazwa użytkownika lub hasło." });

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: "Nieprawidłowa nazwa użytkownika lub hasło." });

        const token = jwt.sign({ user_id: user.user_id, username: user.username }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });

        return res.json({ message: "Logowanie udane.", token: token, user: { user_id: user.user_id, username: user.username } });

    } catch (error) {
        console.error("Błąd logowania:", error);
        return res.status(500).json({ message: "Błąd serwera." });
    }
};
