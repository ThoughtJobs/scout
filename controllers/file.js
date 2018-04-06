const config = require('../config');
const store = require('../common/store/store');
const jwtUtils = require('../common/jwtUtils');
const Image = require('../proxy').Image;
const _ = require('lodash');
const aip = require('../common/aip');
const eventproxy = require('eventproxy');
const validator = require('validator');

exports.upload = (req, res) => {
  let isFileLimit = false;
  let filesCount = 0;
  let results = [];
  const userInfo = jwtUtils.resolveInfo(req);

  req.busboy.on('file', function (fieldname, file, filename) {
    filesCount++;
    // console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);

    if (!filename.endsWith('.png') && !filename.endsWith('.jpg')) {
      res.json({
        error: 'File format must be png or jpg!',
      })
    }

    file.on('limit', function () {
      isFileLimit = true;

      res.json({
        error: 'File size too large. Max is ' + config.file_limit,
      })
    });

    store.upload(file, {filename: filename}, function (fileBuffer, err, result) {
      filesCount--;

      if (err || isFileLimit) {
        return res.json({
          success: false,
          message: err.message
        });
      }

      results.push(result.url);
      if (filesCount === 0) {
        _.forEach(results, url => Image.saveWithUserId(userInfo.id, url));
        res.json({
          urls: results,
        });
      }
    });

    file.resume();
  });

  req.pipe(req.busboy);

};

exports.getImagesByUserId = (req, res, next) => {
  const userInfo = jwtUtils.resolveInfo(req);
  Image.getImagesByUserId(userInfo.id, (err, images) => {
    if (err) {
      return next(err);
    }

    if (!_.isEmpty(images)) {
      res.json({
        urls: _.map(images, image => _.pick(image, ['url']).url)
      });
      return;
    }

    res.json({
      error: 'there is no image about userId: ' + userInfo.id
    })
  });
};

exports.registerImagesDb = (req, res) => {
  const ep = new eventproxy();

  let isFileLimit = false;
  let filesCount = 0;
  let results = [];
  const userInfo = jwtUtils.resolveInfo(req);

  req.busboy.on('file', function (fieldname, file, filename) {
    filesCount++;

    if (!filename.endsWith('.png') && !filename.endsWith('.jpg')) {
      res.json({
        error: 'File format must be png or jpg!',
      })
    }

    file.on('limit', function () {
      isFileLimit = true;
      res.json({
        error: 'File size too large. Max is ' + config.file_limit,
      })
    });

    store.upload(file, {filename: filename}, (err, result, fileBuffer) => {
      filesCount--;

      if (err) {
        return res.json({
          error: err.message
        });
      }
      if (isFileLimit) {
        return;
      }

      results.push({url: result.url, fileBuffer: fileBuffer});

      //所有人脸图片上传到云中存储完成之后再上传到百度AI中
      if (filesCount === 0) {
        ep.after('upload_to_ai', results.length, () => {
          res.status(201);
          res.json({
            message: 'register success!',
          });
        });

        _.forEach(results, result => {
          const {url, fileBuffer} = result;
          Image.saveWithUserId(userInfo.id, url);

          const base64Img = fileBuffer.toString('base64');
          // 百度推荐分类方式：用户组(相册) -> 用户 -> 人脸
          aip.registerImages(userInfo.id, url, userInfo.id + 'albumId1', base64Img, (msg) => {
            if (!msg) {
              res.json({
                error: 'register failed!'
              });
              return;
            }
            ep.emit('upload_to_ai');
          });
        });
      }
    });

    file.resume();
  });

  req.pipe(req.busboy);

};

exports.searchImagesFromDb = (req, res) => {
  const userInfo = jwtUtils.resolveInfo(req);

  let isFileLimit = false;
  req.busboy.on('file', (fieldname, file, filename) => {
    file.on('limit', () => {
      isFileLimit = true;
      res.json({
        error: 'File size too large. Max is ' + config.file_limit
      })
    });

    store.upload(file, {filename: filename}, (err, result, fileBuffer) => {
      if (err) {
        return res.json({
          error: err.message
        });
      }
      if (isFileLimit) {
        return;
      }

      const base64Img = fileBuffer.toString('base64');
      aip.searchImages(userInfo.id + 'albumId1', base64Img, (result) => {
        if (!result) {
          res.json({
            error: 'no result!'
          });
          return;
        }
        //可以定位到人脸库中具体的某一张图片，但是无法定位所有图片，所以只能判断是否感兴趣
        let isInterested = true;
        if (_.get(result, 'result[0].scores[0]', 0) < 80) {
          isInterested = false;
          res.status(404);
        }
        res.json({
          isInterested: result, //result
        });
      });
    });

  });

  req.pipe(req.busboy);
};

exports.deleteUser = (req, res) => {
  aip.deleteUser(validator.trim(req.query.uid));
  res.json({success: '!!!'});
};