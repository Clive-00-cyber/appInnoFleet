const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ $or: [{ nom: username }, { cin: username }] });
        if (!user) return res.status(401).json({ error: 'Identifiants incorrects' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Identifiants incorrects' });

        user.statut = 'Connecté';
        user.lastLogin = new Date();
        await user.save();

        const token = jwt.sign(
            { _id: user._id, role: user.role, name: user.nom },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ token, user: { nom: user.nom, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.logout = async (req, res) => {
    try {
        res.json({ message: 'Déconnecté' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};