// server.js

import express from 'express';
import 'dotenv/config';
import pool from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import dataRoutes from './src/routes/dataRoutes.js';
import cors from 'cors'; // Dodajemy CORS, aby frontend (Phaser) mógł się połączyć

const app = express();
const PORT = process.env.PORT || 4000;

// MIDDLEWARE
app.use(cors()); // Zezwól na połączenia z frontendu (kluczowe!)
app.use(express.json()); // Parsowanie JSON dla żądań POST

// AKTYWACJA ROUTÓW
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

// Trasa testowa
app.get('/', (req, res) => {
    res.send('Backend dla HackInvaders działa. Port: ' + PORT);
});

app.listen(PORT, () => {
    console.log(`🚀 Serwer nasłuchuje na porcie ${PORT}`);
    console.log('🔗 Adres: http://localhost:' + PORT);
});
