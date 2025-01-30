const jwt = require('jsonwebtoken');
const User = require('./user/userModule'); // Adjust the path to your user model

// Middleware to authenticate users
exports.authenticate = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Invalid token.' });
    }
};

// Middleware to authorize based on roles
exports.authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied. Insufficient privileges.' });
        }
        next();
    };
};