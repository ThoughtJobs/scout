const mongoose = require('mongoose');
const config   = require('../config');
const logger = require('../common/logger');

mongoose.connect(config.db, {
  server: {poolSize: 20},
}, (err) => {
  if (err) {
    logger.error('connect to %s error: ', config.db, err.message);
    process.exit(1);
  }
});

require('./user');
require('./image');

exports.User = mongoose.model('User');
exports.Image = mongoose.model('Image');