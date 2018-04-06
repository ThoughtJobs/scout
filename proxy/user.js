const models = require('../models');
const uuid = require('node-uuid');
const User = models.User;

exports.getUserByMail = (email, callback) => {
  User.findOne({email: email}, callback);
};

exports.getUserByLoginName = (username, callback) => {
  User.findOne({'username': new RegExp('^' + username + '$', "i")}, callback);
};

exports.getUsersByQuery = (query, opt, callback) => {
  User.find(query, '', opt, callback);
};

exports.newAndSave = (username, password, email, active, callback) => {
  const user = new User();
  user.username = username;
  user.password = password;
  user.email = email;
  user.active = active || false;
  user.accessToken = uuid.v4();

  user.save(callback);
};
