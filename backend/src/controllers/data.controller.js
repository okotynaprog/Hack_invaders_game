// src/controllers/dataController.js

import pool from '../config/db.js';

// SYNCHRONIZACJA WYNIKÓW (ZAPIS)
export const syncPlayerData = async (req, res) => {
    const userId = req.user.user_id;
    const { totalMbCollected, highscoreSession, credits } = req.body;

    if (typeof totalMbCollected !== 'number' || totalMbCollected < 0) {
        return res.status(400).json({ message: "Nieprawidłowa wartość totalMbCollected." });
    }

    try {
        await pool.query('BEGIN');

        const result = await pool.query(
            `UPDATE player_data
             SET total_mb_collected = $1, 
                 high_score_session = GREATEST(high_score_session, $2),
                 credits = $3,
                 last_synced = NOW()
             WHERE user_id = $4
             RETURNING total_mb_collected, credits;`,
            [totalMbCollected, highscoreSession || 0, credits || 0, userId]
        );

        if (result.rowCount === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: "Nie znaleziono danych gracza." });
        }

        await pool.query('COMMIT');

        return res.json({
            message: "Dane gracza pomyślnie zsynchronizowane.",
            data: result.rows[0]
        });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error("Błąd synchronizacji danych:", error);
        return res.status(500).json({ message: "Błąd serwera podczas synchronizacji." });
    }
};

// TABELA WYNIKÓW (LEADERBOARD)
export const getLeaderboard = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                u.username,
                p.total_mb_collected,
                p.high_score_session
            FROM player_data p
            JOIN users u ON p.user_id = u.user_id
            ORDER BY p.high_score_session DESC, p.last_synced DESC
            LIMIT 10;`
        );

        return res.json({
            leaderboard: result.rows
        });

    } catch (error) {
        console.error("Błąd pobierania tabeli wyników:", error);
        return res.status(500).json({ message: "Błąd serwera." });
    }
};
