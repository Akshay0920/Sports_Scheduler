const db = require('../../models');
const User = db.User;
const bcrypt = require('bcryptjs');

exports.changePassword = async (req, res) => {
  const userId = req.userId;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).send({ message: 'Old and new passwords are required.' });
  }

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).send({ message: 'User not found.' });
    }

    // Verify the old password is correct
    const passwordIsValid = bcrypt.compareSync(oldPassword, user.password_digest);

    if (!passwordIsValid) {
      return res.status(401).send({ message: 'Invalid old password.' });
    }

    // Hash and update to the new password
    user.password_digest = bcrypt.hashSync(newPassword, 8);
    await user.save();

    res.status(200).send({ message: 'Password changed successfully.' });

  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).send({ message: 'User not found.' });
    }
    user.name = req.body.name || user.name;
    await user.save();
    res.status(200).send({ message: 'Profile updated successfully.' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};