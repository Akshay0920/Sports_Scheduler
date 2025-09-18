const express = require('express');
const router = express.Router();
const authJwt = require('../middleware/auth.jwt');
const controller = require('../controllers/user.controller');

router.patch(
  '/me/password',
  [authJwt.verifyToken],
  controller.changePassword
);
router.patch('/me', [authJwt.verifyToken], controller.updateProfile);

module.exports = router;
