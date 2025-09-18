const db = require('../../models');
const User = db.User;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Sign up
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: email } });
    if (existingUser) {
      return res.status(400).send({ message: 'Email is already in use.' });
    }

    // Hash the password and create the user
    const newUser = await User.create({
      name: name,
      email: email,
      password_digest: bcrypt.hashSync(password, 8),
      role: 'player'
    });

    res.status(201).send({ message: 'User registered successfully!' });

  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Sign in
exports.signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      return res.status(404).send({ message: 'User Not found.' });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password_digest);

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: 'Invalid Password!'
      });
    }

    // If password is valid, create a token
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: 86400 // 24 hours
    });

    res.status(200).send({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      accessToken: token
    });

  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};