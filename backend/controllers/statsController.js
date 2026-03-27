const Vehicle = require('../models/Vehicle');
const Mission = require('../models/Mission');
const Fuel = require('../models/Fuel');

exports.getStats = async (req, res) => {
    try {
        const vehicles = await Vehicle.find();
        const missions = await Mission.find();
        const fuels = await Fuel.find();

        const dispo = vehicles.filter(v => v.statut === 'disponible').length;
        const enMission = vehicles.filter(v => v.statut === 'en mission').length;
        const maintenance = vehicles.filter(v => v.statut === 'maintenance').length;

        const missionsEnCours = missions.filter(m => m.statut === 'En cours').length;

        const now = new Date();
        const sixMois = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            sixMois.push({ mois: d.toLocaleString('fr', { month: 'short' }), total: 0 });
        }

        fuels.forEach(f => {
            const date = new Date(f.date);
            const moisIndex = (now.getMonth() - date.getMonth() + 12) % 12;
            if (moisIndex < 6) {
                sixMois[5 - moisIndex].total += f.montant;
            }
        });

        res.json({
            vehicules: { dispo, enMission, maintenance },
            missionsEnCours,
            coutCarburant: sixMois
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};