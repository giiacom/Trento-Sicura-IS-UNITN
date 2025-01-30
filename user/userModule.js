const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: false
    },
    role: { 
        type: String, 
        enum: ['user', 'admin'], default: 'user' 
    },
    posizione: { 
        // user / admin    per il momento non lo usiamo e poi per passare da user ad admin basta cambiare il ruolo
        type: Boolean,
        required: false, 
        default: false
    },
    segnalazioni: [{ // lista delle segnalazioni utente
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Report", 
        default: [] 
    }],
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;