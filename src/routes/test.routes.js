const express = require('express');
const router = express.Router();
const authJwt = require('../middleware/auth.jwt');
const controller = require('../controllers/test.controller');

router.get('/all', (req, res) => res.status(200).send('Public Content.'));
router.get('/player', [authJwt.verifyToken], controller.playerBoard);
router.get('/admin', [authJwt.verifyToken, authJwt.isAdmin], controller.adminBoard);

module.exports = router;