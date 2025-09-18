const db = require('../../models');
const Sport = db.Sport;

// Create a new sport 
exports.create = async (req, res) => {
  const { name } = req.body;


  const adminId = req.userId;

  try {
    const sport = await Sport.create({
      name: name,
      admin_id: adminId
    });
    res.status(201).send(sport);
  } catch (error) {

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).send({ message: 'Sport name already exists.' });
    }
    res.status(500).send({ message: error.message });
  }
};

// Find all sports 
exports.findAll = async (req, res) => {
  try {
    const sports = await Sport.findAll();
    res.status(200).send(sports);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};