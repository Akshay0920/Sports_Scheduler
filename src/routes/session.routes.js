const express = require('express');
const router = express.Router();
const authJwt = require('../middleware/auth.jwt');
const controller = require('../controllers/session.controller');

router.post('/', [authJwt.verifyToken], controller.create);
router.get('/', [authJwt.verifyToken], controller.findAll);
router.get('/:id', [authJwt.verifyToken], controller.findOne);
router.post('/:id/join', [authJwt.verifyToken], controller.join);
router.post('/:id/cancel', [authJwt.verifyToken], controller.cancel);
router.get('/me/joined', [authJwt.verifyToken], controller.findJoined);
router.get('/me/created', [authJwt.verifyToken], controller.findCreated);

module.exports = router;