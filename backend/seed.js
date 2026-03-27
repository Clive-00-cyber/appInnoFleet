// seed.js - Script pour peupler la base de données avec des données fictives
// Exécuter avec : node seed.js (depuis le dossier backend)

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

// Import des modèles
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const Mission = require('./models/Mission');
const Fuel = require('./models/Fuel');
const Maintenance = require('./models/Maintenance');

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connecté à MongoDB'))
    .catch(err => {
        console.error('❌ Erreur de connexion MongoDB :', err);
        process.exit(1);
    });

// Fonctions utilitaires pour générer des données aléatoires
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Données de base
const marques = ['FIAT', 'Ford', 'Renault', 'Peugeot', 'Citroën', 'Toyota', 'Volkswagen'];
const modeles = ['500', 'Focus', 'Clio', '208', 'C3', 'Corolla', 'Golf'];
const statutsVehicule = ['disponible', 'en mission', 'maintenance'];
const nomsConducteurs = ['Ahmed Arabi', 'Mohamed Alaoui', 'Fatima Zahra', 'Youssef Benali', 'Khadija Tazi'];
const destinations = ['Rabat', 'Casablanca', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Oujda'];
const composants = ['Moteur', 'Freins', 'Pneumatiques', 'Batterie', 'Embrayage', 'Suspension', 'Direction'];
const etatsMaintenance = ['Bon', 'À vérifier', 'Urgent'];

// 1. Créer des utilisateurs (admin + 2 utilisateurs normaux)
async function seedUsers() {
    console.log('👤 Création des utilisateurs...');
    await User.deleteMany({}); // supprime tous les utilisateurs existants (optionnel)

    const hashedAdmin = await bcrypt.hash('admin', 10);
    const hashedUser1 = await bcrypt.hash('user1', 10);
    const hashedUser2 = await bcrypt.hash('user2', 10);

    const users = [
        { nom: 'Admin', cin: 'admin', password: hashedAdmin, role: 'admin', statut: 'Déconnecté' },
        { nom: 'Ahmed Benani', cin: 'AB12345', password: hashedUser1, role: 'user', statut: 'Déconnecté' },
        { nom: 'Sara El Amrani', cin: 'SE67890', password: hashedUser2, role: 'user', statut: 'Déconnecté' }
    ];

    await User.insertMany(users);
    console.log(`✅ ${users.length} utilisateurs créés.`);
}

// 2. Créer des véhicules
async function seedVehicles() {
    console.log('🚗 Création des véhicules...');
    await Vehicle.deleteMany({});

    const vehiclesToCreate = []; // Renommé pour plus de clarté
    for (let i = 0; i < 8; i++) {
        vehiclesToCreate.push({
            immat: `${randomInt(1000, 9999)}${String.fromCharCode(65 + randomInt(0, 25))}${randomInt(10, 99)}`,
            marque: randomElement(marques),
            modele: randomElement(modeles),
            statut: randomElement(statutsVehicule)
        });
    }

    // Correction ICI : on stocke le résultat de insertMany
    const createdVehicles = await Vehicle.insertMany(vehiclesToCreate); 
    console.log(`✅ ${createdVehicles.length} véhicules créés.`);
    
    return createdVehicles; // Retourne les documents avec leurs _id
}


// 3. Créer des missions
async function seedMissions(vehicles) {
    console.log('📋 Création des missions...');
    await Mission.deleteMany({});

    const missions = [];
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const oneMonthLater = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    for (let i = 0; i < 15; i++) {
        const debut = randomDate(oneMonthAgo, oneMonthLater);
        const fin = Math.random() > 0.3 ? new Date(debut.getTime() + randomInt(1, 5) * 24 * 60 * 60 * 1000) : null;
        missions.push({
            conducteur: randomElement(nomsConducteurs),
            vehicule: randomElement(vehicles)._id,
            debut: debut,
            fin: fin,
            kmDepart: randomInt(5000, 200000),
            kmRetour: fin ? randomInt(5100, 200500) : null,
            statut: fin ? 'Terminée' : 'En cours',
            destination: randomElement(destinations)
        });
    }

    await Mission.insertMany(missions);
    console.log(`✅ ${missions.length} missions créées.`);
}

// 4. Créer des relevés de carburant
async function seedFuel(vehicles) {
    console.log('⛽ Création des relevés de carburant...');
    await Fuel.deleteMany({});

    const fuels = [];
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    for (let i = 0; i < 30; i++) {
        fuels.push({
            vehicule: randomElement(vehicles)._id,
            date: randomDate(sixMonthsAgo, now),
            litres: randomInt(20, 60),
            montant: randomInt(300, 900)
        });
    }

    await Fuel.insertMany(fuels);
    console.log(`✅ ${fuels.length} relevés de carburant créés.`);
}

// 5. Créer des maintenances (optionnel)
async function seedMaintenance(vehicles) {
    console.log('🔧 Création des maintenances...');
    await Maintenance.deleteMany({});

    const maintenances = [];
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

    for (let i = 0; i < 10; i++) {
        maintenances.push({
            vehicule: randomElement(vehicles)._id,
            composant: randomElement(composants),
            etat: randomElement(etatsMaintenance),
            dateVerif: randomDate(oneYearAgo, now),
            dateProchaine: randomDate(now, oneYearLater),
            alerte: Math.random() > 0.7
        });
    }

    await Maintenance.insertMany(maintenances);
    console.log(`✅ ${maintenances.length} maintenances créées.`);
}

// Fonction principale
async function seedAll() {
    try {
        await seedUsers();
        const vehicles = await seedVehicles();
        await seedMissions(vehicles);
        await seedFuel(vehicles);
        await seedMaintenance(vehicles); // décommentez si vous avez activé le modèle Maintenance

        console.log('\n🎉 Toutes les données fictives ont été insérées avec succès !');
    } catch (err) {
        console.error('❌ Erreur lors du seeding :', err);
    } finally {
        mongoose.connection.close();
    }
}

seedAll();