// src/routes/dataRoutes.js

import express from 'express';
import { syncPlayerData, getLeaderboard } from '../controllers/data.controller.js';
import { protect } from '../middleware/authMiddleware.js'; // Importujemy nasze zabezpieczenie

const router = express.Router();

// POST /api/data/sync (Trasa chroniona - wymaga JWT)
// Używamy 'protect' jako funkcji pośredniczącej przed kontrolerem
router.post('/sync', protect, syncPlayerData);

// GET /api/data/leaderboard (Trasa publiczna - nie wymaga logowania)
router.get('/leaderboard', getLeaderboard);

export default router;
