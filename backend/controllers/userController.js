const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.getAll = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { nom, cin, password, role } = req.body;
        const hashed = await bcrypt.hash(password, 10);
        const user = new User({ nom, cin, password: hashed, role });
        await user.save();
        res.status(201).json({ message: 'Utilisateur créé', user: { nom, cin, role } });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { nom, cin, role, password } = req.body;
        const update = { nom, cin, role };
        if (password) {
            update.password = await bcrypt.hash(password, 10);
        }
        const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
        if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
        res.json({ message: 'Utilisateur supprimé' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};