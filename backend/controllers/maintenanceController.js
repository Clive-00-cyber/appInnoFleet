const Maintenance = require('../models/Maintenance');

exports.getAll = async (req, res) => {
    try {
        const items = await Maintenance.find().populate('vehicule');
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const item = new Maintenance(req.body);
        await item.save();
        res.status(201).json(item);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const item = await Maintenance.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!item) return res.status(404).json({ error: 'Non trouvé' });
        res.json(item);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const item = await Maintenance.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ error: 'Non trouvé' });
        res.json({ message: 'Supprimé' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};