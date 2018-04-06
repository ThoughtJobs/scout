const path = require('path');

const config = {
  // debug 为 true 时，用于本地调试
  debug: true,

  name: 'xphoto', // 社区名字

  secret: 'fuck you jwt', //JWT secret

  session_secret: 'I love u JWT',

  // 邮箱配置
  mail_opts: {
    host: 'smtp.sina.com',
    port: 25,
    auth: {
      user: 'a2880116@sina.com',
      pass: '19940114'
    },
    ignoreTLS: true,
  },

  // 程序运行的端口
  port: process.env.PORT === undefined ? '3005' : process.env.PORT,

  externalHost: '0.0.0.0',

  host: '0.0.0.0',

  // mongodb 配置
  db: 'mongodb://mongo/node_club_dev',

  log_dir: path.join(__dirname, 'logs'),

  // ----------------------------------file upload-------------------------------------
  cos_access: {
    cosAppId: '1252484566',
    cosRegion: 'cn-south',
    cosSecretId: 'AKID8HG5jLSGUnxysdb1Wr3860nPq7ECjf9W',
    cosSecretKey: 'NbeWHsIdqsnX8YntnX9oKfr24xiOzQhu',
    cosFileBucket: 'little7',
    cosUploadFolder: '/'
  },

  upload: {
    path: path.join(__dirname, 'public/upload/'),
    url: '/public/upload/'
  },

  file_limit: '1MB',

  log_opts: {
    host: 'log',
    port: 7001,
    url: '/add/log'
  }
};

if (process.env.NODE_ENV === 'prod') {
  config.db = 'mongodb://mongo/node_club_prod';
  config.externalHost = 'www.xphoto.top';
}

module.exports = config;
