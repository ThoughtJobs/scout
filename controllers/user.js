const jwtUtils = require('../common/jwtUtils');

exports.info = (req, res, next) => {

  const userInfo = jwtUtils.resolveInfo(req);

  res.json({userInfo: userInfo});
};
