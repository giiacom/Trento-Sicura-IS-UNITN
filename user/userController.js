const jwt = require('jsonwebtoken');
const User = require('./userModule'); 
const bcrypt = require('bcrypt');


exports.register = async (req, res) => {
    try {
        const { username, email, password, phone } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already taken' });
        }
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ error: 'Username is already taken' });
        }
        if (!/\d/.test(password)) {
            return res.status(400).json({ error: "Password must contain at least one number (0-9)" });
        }
        // Check if password contains at least one special character from the allowed set
        if (!/[.@_\-!#$%&]/.test(password)) {
            return res.status(400).json({ error: "Password must contain at least one special character (@ . - _ ! # $ % &)" });
        }
        
        const saltRounds = 10; // Adjust this for desired security/performance tradeoff
        const hashedPassword = bcrypt.hashSync(password, saltRounds);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            phone,
            role: 'user'
        });
        await newUser.save();

        // Respond with a success message
        res.status(201).json({
            message: 'Registration completed',
            user: {
                username: newUser.username,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Registration not succesful, try again' });
    }
};


exports.login = async (req, res) => {
    const { email, username, password } = req.body;

    if (!email && !username) {
        return res.status(400).json({ error: 'Email or username are required' });
    }
    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    try {
        // Find user by email or username
        let user;
        if (email) {
            user = await User.findOne({ email });
        } else if (username) {
            user = await User.findOne({ username });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Make sure JWT_SECRET is available
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ error: 'Server error: JWT secret is missing' });
        }

        // Create a JWT token
        const token = jwt.sign(
            { userId: user._id },              // Payload: User's ID
            process.env.JWT_SECRET,            // Secret key from environment variable
            { expiresIn: '1h' }               // Token expiration time (1 hour)
        );

        // Send back the token in the response
        res.status(200).json({
            message: 'Login successful',
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};






//DA CANCELLARE / NON USARE

exports.report = async (req, res) => {
    try {
        
    } catch (error) {
        
    }
}

exports.adminRegisterRole = async (req, res) => {
    try {
        const { username, email, password, phone } = req.body;

        // Check if the current user has admin privileges
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can create new admins' });
        }

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already taken' });
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ error: 'Username is already taken' });
        }

        const saltRounds = 10;
        const hashedPassword = bcrypt.hashSync(password, saltRounds);

        const newAdmin = new User({
            username,
            email,
            password: hashedPassword,
            phone,
            role: 'admin' // Explicitly set the role to 'admin'
        });

        await newAdmin.save();

        res.status(201).json({
            message: 'Admin account created successfully',
            user: {
                username: newAdmin.username,
                email: newAdmin.email,
                phone: newAdmin.phone,
                role: newAdmin.role
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Admin registration not successful, try again' });
    }
};


exports.adminRegisterKey = async (req, res) => {
    try {
        const { username, email, password, phone, secretKey } = req.body;

        if (!username || !email || !password || !secretKey) {
            return res.status(400).json({ error: 'Username, email, password, and secret key are required' });
        }

        // Check if the secret key matches
        if (secretKey !== process.env.ADMIN_SECRET_KEY) {
            return res.status(403).json({ error: 'Invalid secret key' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already taken' });
        }
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ error: 'Username is already taken' });
        }

        const saltRounds = 10;
        const hashedPassword = bcrypt.hashSync(password, saltRounds);

        const newAdmin = new User({
            username,
            email,
            password: hashedPassword,
            phone,
            role: 'admin' // Explicitly set role to 'admin'
        });

        await newAdmin.save();

        res.status(201).json({
            message: 'Admin account created successfully',
            user: {
                username: newAdmin.username,
                email: newAdmin.email,
                phone: newAdmin.phone,
                role: newAdmin.role
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Admin registration not successful, try again' });
    }
};