const express = require('express');
const router = express.Router();
const authJwt = require('../middleware/auth.jwt');
const controller = require('../controllers/report.controller');

router.get('/', [authJwt.verifyToken, authJwt.isAdmin], controller.generateReport);

module.exports = router;