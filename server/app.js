const db = require('./config/db');
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect the DB
db.connect();

// Routes
const reunionRoutes = require('./routes/reunionRoutes');
const salleRoutes = require('./routes/salleRoutes')
const utilisateurRoutes = require('./routes/utilisateurRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/reunions', reunionRoutes);
app.use('/api/salles', salleRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/login', authRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on:  http://localhost:${PORT}`);
});