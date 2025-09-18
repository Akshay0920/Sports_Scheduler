const db = require('../../models');
const { Op, Sequelize } = require('sequelize');
const Session = db.Session;
const Sport = db.Sport;
const User = db.User;
const SessionParticipant = db.SessionParticipant;

// Create a new session
exports.create = async (req, res) => {
  const { sport_id, venue, scheduled_at, players_needed } = req.body;
  const creatorId = req.userId;
  try {
    const session = await Session.create({ sport_id, venue, scheduled_at, players_needed, creator_id: creatorId, status: 'active' });
    await SessionParticipant.create({ session_id: session.id, player_id: creatorId });
    res.status(201).send(session);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Find all available sessions
exports.findAll = async (req, res) => {
  try {
    const sessions = await Session.findAll({
      where: { status: 'active', scheduled_at: { [Op.gt]: Sequelize.fn('NOW') } },
      include: [
        { model: Sport, attributes: ['name'] },
        { model: User, as: 'Creator', attributes: ['name'] },
        { model: User, as: 'Participants', attributes: ['id', 'name'], through: { attributes: [] } }
      ],
      order: [['scheduled_at', 'ASC']],
      subQuery: false
    });
    res.status(200).send(sessions);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Find a single session by its ID
exports.findOne = async (req, res) => {
  try {
    const session = await Session.findByPk(req.params.id, { include: [{ model: Sport, attributes: ['name'] }] });
    if (session) {
      res.status(200).send(session);
    } else {
      res.status(404).send({ message: 'Session not found.' });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Join an existing session
exports.join = async (req, res) => {
  const sessionId = req.params.id;
  const playerId = req.userId;
  try {
    const sessionToJoin = await Session.findOne({ where: { id: sessionId, status: 'active', scheduled_at: { [Op.gt]: Sequelize.fn('NOW') } } });
    if (!sessionToJoin) { return res.status(404).send({ message: 'Active session not found.' }); }
    const existingParticipant = await SessionParticipant.findOne({ where: { session_id: sessionId, player_id: playerId } });
    if (existingParticipant) { return res.status(400).send({ message: 'You have already joined this session.' }); }
    const userSessions = await Session.findAll({ where: { id: { [Op.ne]: sessionId } }, include: [{ model: User, as: 'Participants', where: { id: playerId } }] });
    const hasConflict = userSessions.some((session) => session.scheduled_at.getTime() === sessionToJoin.scheduled_at.getTime());
    if (hasConflict) { return res.status(400).send({ message: 'You have joined another session scheduled at this exact time.' }); }
    const participantCount = await SessionParticipant.count({ where: { session_id: sessionId } });
    if (participantCount >= sessionToJoin.players_needed) { return res.status(400).send({ message: 'Session is already full.' }); }
    await SessionParticipant.create({ session_id: sessionId, player_id: playerId });
    res.status(200).send({ message: 'Successfully joined the session!' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Cancel a session 
exports.cancel = async (req, res) => {
  const { reason } = req.body;
  const sessionId = req.params.id;
  const userId = req.userId;
  if (!reason) { return res.status(400).send({ message: 'A cancellation reason is required.' }); }
  try {
    const session = await Session.findByPk(sessionId);
    if (!session) { return res.status(404).send({ message: 'Session not found.' }); }
    if (session.creator_id !== userId) { return res.status(403).send({ message: 'Forbidden: You are not the creator of this session.' }); }
    if (session.status === 'cancelled') { return res.status(400).send({ message: 'This session has already been cancelled.' }); }
    session.status = 'cancelled';
    session.cancellation_reason = reason;
    await session.save();
    res.status(200).send({ message: 'Session has been cancelled successfully.', session });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Find sessions the user has joined
exports.findJoined = async (req, res) => {
  try {
    const sessions = await Session.findAll({
      include: [
        { model: User, as: 'Participants', where: { id: req.userId }, attributes: [] },
        { model: Sport, attributes: ['name'] },
        { model: User, as: 'Creator', attributes: ['name'] },
        { model: User, as: 'Participants', attributes: ['id', 'name'], through: { attributes: [] } }
      ],
      where: { status: 'active', scheduled_at: { [Op.gt]: Sequelize.fn('NOW') } },
      order: [['scheduled_at', 'ASC']],
      subQuery: false
    });
    res.status(200).send(sessions);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.findCreated = async (req, res) => {
  try {
    const sessions = await Session.findAll({
      where: {
        creator_id: req.userId,
        status: 'active',
        scheduled_at: { [Op.gt]: Sequelize.fn('NOW') }
      },
      include: [
        { model: Sport, attributes: ['name'] },
        { model: User, as: 'Creator', attributes: ['name'] },
        { model: User, as: 'Participants', attributes: ['id', 'name'], through: { attributes: [] } }
      ],
      order: [['scheduled_at', 'ASC']],
      subQuery: false
    });
    res.status(200).send(sessions);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
