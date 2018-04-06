const express = require('express');
const config = require('./config');
const bodyParser = require('body-parser');
const expressJWT  = require('express-jwt');
const app = express();
const router = express.Router();
const busboy = require('connect-busboy');
const bytes = require('bytes');

const jwtUtils = require('./common/jwtUtils');
const file = require('./controllers/file');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(bodyParser.json({limit: '1mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
app.use(busboy({
  limits: {
    fileSize: bytes(config.file_limit)
  }
}));
app.use(expressJWT({secret: config.secret}).unless({path: ['/signup', '/signin', '/active_account']}));
app.use('/', router);

//router quote
const sign = require('./controllers/sign');
const user = require('./controllers/user');

//router list
router.post('/signin', sign.signin);  // 登录校验
router.post('/signup', sign.signup);  // 注册用户
router.get('/active_account', sign.activeAccount);  //帐号激活

router.get('/userInfo', user.info); //用户信息

router.post('/upload', file.upload); //上传文件
router.get('/images', file.getImagesByUserId); //获取用户所有图片
router.post('/images-db', file.registerImagesDb); //注册人脸库
router.post('/images-db/search', file.searchImagesFromDb); //从人脸库中根据图片搜索
router.get('/deleteImageUser', file.deleteUser);

app.use(function(err, req, res) {
  console.error(err.stack);
  res.status(err.status).json({error: err.inner.message});
});

app.listen(config.port, config.host, () => {
  console.log('xphoto back end listening on port '+ config.port + '!');
});
