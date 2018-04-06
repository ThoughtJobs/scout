const validator = require('validator');
const eventproxy = require('eventproxy');
const utility        = require('utility');

const User = require('../proxy').User;
const tools = require('../common/tools');
const mail = require('../common/mail');
const config = require('../config');
const jwtUtils = require('../common/jwtUtils');

exports.signin = (req, res, next) => {

  if (!req.body.username || !req.body.password) {
    res.status(422);
    return res.json({error: '信息不完整。'});
  }

  const ep = new eventproxy();
  const username = validator.trim(req.body.username).toLowerCase();
  const password = validator.trim(req.body.password);

  let getUser;
  if (validator.isEmail(username)) {
    getUser = User.getUserByMail;
  } else {
    getUser = User.getUserByLoginName;
  }

  ep.on('login_error', () => {
    res.status(403);
    res.json({error: '用户名或密码错误'});
  });

  getUser(username, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return ep.emit('login_error');
    }
    tools.bcompare(password, user.password, ep.done(function (bool) {
      if (!bool) {
        return ep.emit('login_error');
      }

      if (!user.active) {
        // 重新发送激活邮件
        mail.sendActiveMail(user.email, utility.md5(user.email + user.password + config.session_secret), user.username);
        res.status(403);
        return res.json({error: '此帐号还没有被激活，激活链接已发送到 ' + user.email + ' 邮箱，请查收。'});
      }
      const myToken = jwtUtils.signInfo(user);
      res.json({success: '登录成功！', JWTToken: myToken});
    }))
  });
};

exports.signup = (req, res, next) => {
  const username = validator.trim(req.body.username).toLowerCase();
  const email = validator.trim(req.body.email).toLowerCase();
  const password = validator.trim(req.body.password);
  const repeat_password = validator.trim(req.body.repeat_password);

  const ep = new eventproxy();
  ep.fail(next);
  ep.on('prop_err', function (msg) {
    res.status(422);
    res.json({error: msg});
  });

  // 验证信息的正确性
  if ([username, password, repeat_password, email].some(item => item === '')) {
    ep.emit('prop_err', '信息不完整。');
    return;
  }
  if (username.length < 5) {
    ep.emit('prop_err', '用户名至少需要5个字符。');
    return;
  }
  if (!tools.validateId(username)) {
    return ep.emit('prop_err', '用户名不合法。');
  }
  if (!validator.isEmail(email)) {
    return ep.emit('prop_err', '邮箱不合法。');
  }
  if (password !== repeat_password) {
    return ep.emit('prop_err', '两次密码输入不一致。');
  }
  // END 验证信息的正确性

  User.getUsersByQuery(
    {'$or': [{'username': username}, {'email': email}]},
    {},
    (err, users) => {
      if (err) {
        return next(err);
      }
      if (users.length > 0) {
        ep.emit('prop_err', '用户名或邮箱已被使用。');
        return;
      }

      tools.bhash(password, ep.done(function (password_hashcode) {
        User.newAndSave(username, password_hashcode, email, false, err => {
          if (err) {
            return next(err);
          }
          // 发送激活邮件
          mail.sendActiveMail(email, utility.md5(email + password_hashcode + config.session_secret), username);
          res.json({
            success: '欢迎加入 ' + config.name + '！我们已给您的注册邮箱发送了一封邮件，请点击里面的链接来激活您的帐号。'
          });
        });

      }));
    });
};

exports.activeAccount = function (req, res, next) {
  const key  = validator.trim(req.query.key);
  const username = validator.trim(req.query.name);

  const ep = new eventproxy();
  ep.fail(next);
  ep.on('prop_err', function (msg) {
    res.status(422);
    res.json({error: msg});
  });

  User.getUserByLoginName(username, function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      ep.emit('prop_err', '没有此账号。');
      return;
    }
    let password_hashcode = user.password;
    if (!user || utility.md5(user.email + password_hashcode + config.session_secret) !== key) {
      ep.emit('prop_err', '信息有误，帐号无法被激活。');
      return;
    }
    if (user.active) {
      ep.emit('prop_err', '帐号已经是激活状态。');
      return;
    }
    user.active = true;
    user.save(function (err) {
      if (err) {
        return next(err);
      }
      res.json({success: '帐号已被激活，请登录'});
    });
  });
};