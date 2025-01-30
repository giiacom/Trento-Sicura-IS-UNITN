const express = require('express');
const userController = require('./controller');
const { authenticate, authorize } = require('./middleware');


const router = express.Router();

router.post('/login', userController.login);
router.post('/register', userController.register);

//router.post('/report', authenticate, userController.createReport);

router.post('/adminRegisterRole', authenticate, authorize(['admin']), userController.adminRegisterRole);
router.post('/adminRegisterKey', userController.adminRegisterKey);

module.exports = router;
