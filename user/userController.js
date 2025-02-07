const jwt = require('jsonwebtoken');
const User = require('./userModule'); 
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    service: 'Gmail', // You can use any other email provider
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


exports.register = async (req, res) => {
    try {
        const { username, email, password, phone } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, e password sono obbligatori' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email già in uso' });
        }
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ error: 'Username già in uso' });
        }
        if (!/\d/.test(password)) {
            return res.status(400).json({ error: "Password deve contenere almeno un numero (0-9)" });
        }
        // Check if password contains at least one special character from the allowed set
        if (!/[.@_\-!#$%&]/.test(password)) {
            return res.status(400).json({ error: "Password deve contenere almeno un carattere speciale (@ . - _ ! # $ % &)" });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: "La password deve essere lunga almeno 6 caratteri" });
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
            message: 'Registrazione completata',
            user: {
                username: newUser.username,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore di registrazione, prova di nuovo' });
    }
};


exports.login = async (req, res) => {
    const { email, username, password } = req.body;

    if (!email && !username) {
        return res.status(400).json({ error: 'Email o username sono obbligatori' });
    }
    if (!password) {
        return res.status(400).json({ error: 'Password è obbligatoria' });
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
            return res.status(404).json({ error: 'Utente non trovato' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Credenziali invalide' });
        }

        // Make sure JWT_SECRET is available
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ error: 'Errore del server (JWT mancante)' });
        }

        // Create a JWT token
        const token = jwt.sign(
            { userId: user._id },              // Payload: User's ID
            process.env.JWT_SECRET,            // Secret key from environment variable
            { expiresIn: '1h' }               // Token expiration time (1 hour)
        );

        // Send back the token in the response
        res.status(200).json({
            message: 'Login eseguito',
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore del server' });
    }
};


exports.data = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: 'Autenticazione utente richiesta' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User non trovato' });
        }

        res.status(200).json({
            user: {
                username: user.username,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore del server' });
    }
};


exports.updatePassword = async (req, res) => {
    try {
        const { password } = req.body;
        const userId = req.user?._id;

        // Validate password
        if (!password) {
            return res.status(400).json({ error: 'Password obbligatoria' });
        }

        if (!/\d/.test(password)) {
            return res.status(400).json({ error: "Password deve contenere almeno un numero (0-9)" });
        }

        // Check if password contains at least one special character from the allowed set
        if (!/[.@_\-!#$%&]/.test(password)) {
            return res.status(400).json({ error: "Password deve contenere almeno un carattere speciale (@ . - _ ! # $ % &)" });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: "La password deve essere lunga almeno 6 caratteri" });
        }

        // Hash the new password
        const saltRounds = 10; // Adjust this for desired security/performance tradeoff
        const hashedPassword = bcrypt.hashSync(password, saltRounds);

        // Find the user and update the password
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User non trovato' });
        }
        if(hashedPassword === user.password){
            return res.status(400).json({ error: 'La nuova password non può essere uguale a quella vecchia' });
        }

        // Update the password
        user.password = hashedPassword;
        await user.save();

        // Respond with a success message
        res.json({
            message: 'Password aggiornata correttamente',
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore nell aggiornamento della password' });
    }
};




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

exports.recoverPassword = async (req, res) => {
        const { email } = req.body;
    
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ error: "Email non trovata" });
            }
    
            // Generate reset token (valid for 1 hour)
            const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4000';
            const resetLink = `${frontendUrl}/resetPassword.html?token=${resetToken}`;

                
            // Email content
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Reset Password',
                text: `Clicca sul link per reimpostare la password: ${resetLink}`,
                html: `<p>Clicca sul link per reimpostare la tua password: <a href="${resetLink}">${resetLink}</a></p>`
            };
    
            // Send email
            await transporter.sendMail(mailOptions);
    
            res.json({ message: "Email inviata! Controlla la tua casella di posta." });
        } catch (error) {
            console.error("Errore nel recupero password:", error);
            res.status(500).json({ error: "Errore interno del server" });
        }
    };


    exports.resetPassword = async (req, res) => {
        try {
            const { token, newPassword } = req.body;
            console.log(newPassword);
    
            // Validate password
            if (!newPassword) {
                return res.status(400).json({ error: 'Password obbligatoria' });
            }
    
            if (!/\d/.test(newPassword)) {
                return res.status(400).json({ error: "Password deve contenere almeno un numero (0-9)" });
            }
    
            if (!/[.@_\-!#$%&]/.test(newPassword)) {
                return res.status(400).json({ error: "Password deve contenere almeno un carattere speciale (@ . - _ ! # $ % &)" });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ error: "La password deve essere lunga almeno 6 caratteri" });
            }
    
            // Verify token and get user
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
    
            if (!user) {
                return res.status(400).json({ error: "Utente non trovato" });
            }
            console.log(user);
    
            // Hash the new password
            const saltRounds = 10; // Same security setting as updatePassword
            const hashedPassword = bcrypt.hashSync(newPassword, saltRounds);
    
            // Update user password
            user.password = hashedPassword;
            await user.save();
    
            // Success response
            res.json({ message: "Password aggiornata con successo!" });
    
        } catch (error) {
            console.error("Errore nel reset della password:", error);
            res.status(400).json({ error: "Token non valido o scaduto" });
        }
    };