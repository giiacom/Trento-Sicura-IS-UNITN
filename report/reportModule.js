const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
    },
    location: {
        lat: {
            type: Number,
            required: false,
        },
        lng: {
            type: Number,
            required: false,
        },
    },
    photo: {
        type: String, // Store the file path or URL
        required: false,
    },
}, {
    timestamps: true,
});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
