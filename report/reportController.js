const Report = require('./reportModule');
const User = require('../user/userModule');
const multer = require('multer');


exports.createReport = async (req, res) => {
    try {
        const { title, description, location } = req.body; // Text fields are in req.body
        const photo = req.file ? req.file.path : undefined; // Photo is in req.file (if uploaded)

        // Validate required fields
        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }

        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: 'User authentication required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let parsedLocation = {}; // Implement automatic location detection if needed
        if (location) {
            try {
                parsedLocation = JSON.parse(location);
            } catch {
                return res.status(400).json({ error: 'Invalid location format' });
            }
        }

        // Create a new report
        const newReport = new Report({
            title,
            description,
            user: req.user._id,
            location: parsedLocation,
            photo, // Save the file path to the photo if it's uploaded
        });

        // Save the report to the database
        await newReport.save();

        // Add this report ID to the user's report list
        await User.findByIdAndUpdate(userId, {
            $push: { segnalazioni: newReport._id }
        });

        res.status(201).json({ message: 'Report created successfully', report: newReport });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating report' });
    }
};

exports.deleteReport = async (req, res) => {
    try {

        const reportId = req.query.id; 
        const userId = req.user?._id; 

        if (!reportId || !userId) {
            return res.status(400).json({ error: 'Report ID and user authentication required' });
        }

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        if (report.user.toString() !== userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'You are not authorized to delete this report' });
        }

        await Report.findByIdAndDelete(reportId);

        await User.findByIdAndUpdate(report.user, {
            $pull: { segnalazioni: reportId }
        });

        res.status(200).json({ message: 'Report deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting report' });
    }
};

exports.getUserReports = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ error: 'User authentication required' });
        }

        const reports = await Report.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json({ reports });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching user reports' });
    }
};

exports.getAllReports = async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 });
        res.status(200).json({ reports: reports || [] }); // Ensure it's always an array
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching reports' });
    }
};

exports.getByID = async (req, res) => {
    const reportId = req.query.id; 
    const userId = req.user?._id; 

    if (!reportId || !userId) {
        return res.status(400).json({ error: 'Report ID and user authentication required' });
    }

    try {
        const report = await Report.findById(reportId);

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        if (report.user.toString() !== userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'You are not authorized to edit this report' });
        }

        // Send the report details as response
        res.status(200).json({ report });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching report' });
    }
};


exports.editReport = async (req, res) => {
    try {

        // Ensure values are extracted correctly from arrays
        const title = Array.isArray(req.body.title) ? req.body.title[0] : req.body.title;
        const description = Array.isArray(req.body.description) ? req.body.description[0] : req.body.description;
        let location = Array.isArray(req.body.location) ? req.body.location[0] : req.body.location;

        const reportId = req.query.id; 
        const userId = req.user?._id; 


        if (!reportId || !userId) {
            return res.status(400).json({ error: 'Report ID and user authentication required' });
        }

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        if (report.user.toString() !== userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'You are not authorized to edit this report' });
        }

        if (title) report.title = title;
        if (description) report.description = description;

        // Check if location exists and is a string before parsing
        if (location && typeof location === 'string' && location.trim()) {
            try {
                report.location = JSON.parse(location);
            } catch {
                return res.status(400).json({ error: 'Invalid location format' });
            }
        }

        if (req.file) {
            report.photo = req.file.path;
        }

        await report.save();

        res.status(200).json({ message: 'Report updated successfully', report });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating report' });
    }
};