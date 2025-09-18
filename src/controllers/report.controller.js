const db = require('../../models');
const { Op, Sequelize } = require('sequelize');
const Session = db.Session;
const Sport = db.Sport;


exports.generateReport = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).send({ message: 'Both startDate and endDate query parameters are required.' });
  }

  try {
    const dateFilter = {
      scheduled_at: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      },

      status: { [Op.ne]: 'cancelled' }
    };

    // 1. Get the total number of sessions played
    const totalSessions = await Session.count({ where: dateFilter });

    // 2. Get the popularity of each sport
    const sportPopularity = await Session.findAll({
      where: dateFilter,
      attributes: [

        [Sequelize.fn('COUNT', Sequelize.col('Sport.id')), 'session_count']
      ],
      include: [{
        model: Sport,
        attributes: ['name']
      }],
      group: ['Sport.id', 'Sport.name'],
      order: [[Sequelize.literal('session_count'), 'DESC']]
    });

    res.status(200).send({
      startDate,
      endDate,
      total_sessions_played: totalSessions,
      sport_popularity: sportPopularity
    });

  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};