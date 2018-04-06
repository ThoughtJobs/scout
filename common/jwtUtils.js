const jwt = require('jsonwebtoken');
const config = require('../config');

const JWT_CONST = {
  TOKEN_FIRST_INDEX: 'Bearer '.length,
};

exports.signInfo = user => jwt.sign({
  id: user._id,
  username: user.username,
  email: user.email,
  }, config.secret);

exports.resolveInfo = req => jwt.decode(req.header('Authorization').substring(JWT_CONST.TOKEN_FIRST_INDEX));
