const express = require('express');
const userController = require('./userController');
const { authenticate, authorize } = require('../middleware');


const router = express.Router();

router.post('/login', userController.login);
router.post('/register', userController.register);
router.get('/data', authenticate, userController.data);
router.post('/password', authenticate, userController.updatePassword);
router.post('/recoverPassword', userController.recoverPassword);
router.post('/resetPassword', userController.resetPassword);


router.post('/adminRegisterRole', authenticate, authorize(['admin']), userController.adminRegisterRole);
router.post('/adminRegisterKey', userController.adminRegisterKey);

module.exports = router;
