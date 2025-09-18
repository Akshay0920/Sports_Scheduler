const express = require('express');
const router = express.Router();
const authJwt = require('../middleware/auth.jwt');
const controller = require('../controllers/sport.controller');

router.post('/', [authJwt.verifyToken, authJwt.isAdmin], controller.create);
router.get('/', [authJwt.verifyToken], controller.findAll);

module.exports = router;