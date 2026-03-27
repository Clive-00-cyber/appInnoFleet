const Fuel = require('../models/Fuel');

exports.getAll = async (req, res) => {
    try {
        const fuels = await Fuel.find().populate('vehicule');
        res.json(fuels);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const fuel = new Fuel(req.body);
        await fuel.save();
        res.status(201).json(fuel);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const fuel = await Fuel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!fuel) return res.status(404).json({ error: 'Entrée non trouvée' });
        res.json(fuel);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const fuel = await Fuel.findByIdAndDelete(req.params.id);
        if (!fuel) return res.status(404).json({ error: 'Entrée non trouvée' });
        res.json({ message: 'Entrée supprimée' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};