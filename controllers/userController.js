const User = require('../models/User');

exports.createUser = async (req, res) => {
    try {
        const { email } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(200).json(existingUser);
        }

        const newUser = new User(req.body);
        const savedUser = await newUser.save();
        
        res.status(201).json(savedUser);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) { res.status(500).json({ message: err.message }); }
};