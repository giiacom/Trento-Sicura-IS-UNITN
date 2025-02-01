const express = require('express');
const reportController = require('../report/reportController');
const { authenticate, authorize } = require('../middleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });


const router = express.Router();

router.post('/create', authenticate, upload.single('photo'), reportController.createReport);
router.delete('/delete', authenticate, reportController.deleteReport);
router.get('/get', authenticate, reportController.getUserReports);
router.get('/all', reportController.getAllReports);

module.exports = router;
