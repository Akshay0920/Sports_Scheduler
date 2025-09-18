const jwt = require('jsonwebtoken');
const db = require('../../models');
const User = db.User;

const verifyToken = (req, res, next) => {
  let token = req.headers['x-access-token'];

  if (!token) {
    return res.status(403).send({ message: 'No token provided!' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized!' });
    }

    req.userId = decoded.id;
    next();
  });
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    if (user.role === 'admin') {
      next();
      return;
    }
    res.status(403).send({ message: 'Require Admin Role!' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const authJwt = {
  verifyToken,
  isAdmin,
};

module.exports = authJwt;