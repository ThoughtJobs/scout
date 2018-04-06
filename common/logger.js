const config = require('../config');
const pathLib = require('path');

const env = process.env.NODE_ENV || "development";

const log4js = require('log4js');
log4js.configure({
  appenders: { xphoto: { type: 'file', filename: pathLib.join(config.log_dir, 'xphoto.log') } },
  categories: { default: { appenders: ['xphoto'], level: 'error' } }
});

const logger = log4js.getLogger('cheese');
logger.level = config.debug && env !== 'test' ? 'DEBUG' : 'ERROR';
module.exports = logger;