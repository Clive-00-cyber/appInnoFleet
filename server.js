const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Charger les variables d'environnement
// En production, Azure utilise les variables d'environnement
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/missions', require('./routes/missionRoutes'));
app.use('/api/fuel', require('./routes/fuelRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/maintenances', require('./routes/maintenanceRoutes'));

// Route pour servir index.html à la racine
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Connexion à MongoDB
const connectDB = require('./config/db');
connectDB();

// Créer un utilisateur admin par défaut si aucun utilisateur n'existe
const User = require('./models/User');
const bcrypt = require('bcrypt');
(async () => {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      const hashed = await bcrypt.hash('admin', 10);
      await User.create({
        nom: 'Admin',
        cin: 'admin',
        password: hashed,
        role: 'admin',
        statut: 'Déconnecté'
      });
      console.log('✅ Utilisateur admin créé (login: admin / admin)');
    }
  } catch (err) {
    console.error('Erreur création admin:', err.message);
  }
})();

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📁 Frontend servi depuis: ${path.join(__dirname, '../frontend')}`);
});