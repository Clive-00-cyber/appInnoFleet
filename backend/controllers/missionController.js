const Mission = require('../models/Mission');

exports.getAll = async (req, res) => {
    try {
        const missions = await Mission.find().populate('vehicule');
        res.json(missions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const mission = new Mission(req.body);
        await mission.save();
        res.status(201).json(mission);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const mission = await Mission.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!mission) return res.status(404).json({ error: 'Mission non trouvée' });
        res.json(mission);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const mission = await Mission.findByIdAndDelete(req.params.id);
        if (!mission) return res.status(404).json({ error: 'Mission non trouvée' });
        res.json({ message: 'Mission supprimée' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};