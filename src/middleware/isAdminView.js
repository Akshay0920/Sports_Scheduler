module.exports = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }

  res.redirect('/sessions');
};