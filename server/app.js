const db = require('./config/db');
const express = require('express');
const cors = require('cors');
const authMiddleware = require('./middlewares/authMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect the DB
db.getConnection();

// Routes
const reunionRoutes = require('./routes/reunionRoutes');
const salleRoutes = require('./routes/salleRoutes');
const utilisateurRoutes = require('./routes/utilisateurRoutes');
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const divisionRoutes = require('./routes/divisionRoutes');

// ── Route publique (pas de middleware JWT) ─────────────────────────────────
app.use('/api/login', authRoutes);

// ── Routes protégées (middleware JWT obligatoire) ──────────────────────────
app.use('/api/reunions', authMiddleware, reunionRoutes);
app.use('/api/salles', authMiddleware, salleRoutes);
app.use('/api/utilisateurs', authMiddleware, utilisateurRoutes);
app.use('/api/services', authMiddleware, serviceRoutes);
app.use('/api/divisions', authMiddleware, divisionRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on:  http://localhost:${PORT}`);
});