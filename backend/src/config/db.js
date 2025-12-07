// src/config/db.js

import pkg from 'pg';
import 'dotenv/config';

const { Pool } = pkg;

const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

pool.query('SELECT NOW()')
    .then(res => console.log('✅ Połączenie z bazą danych PostgreSQL OK.'))
    .catch(err => console.error('❌ BŁĄD POŁĄCZENIA Z BAZĄ DANYCH:', err.stack));

export default pool;
