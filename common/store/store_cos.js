const COS = require('cos-nodejs-sdk-v5');
const config = require('../../config');
const utility = require('utility');
const path = require('path');
const concat = require('concat-stream');

const cos = new COS({
  AppId: config.cos_access.cosAppId,
  SecretId: config.cos_access.cosSecretId,
  SecretKey: config.cos_access.cosSecretKey
});

exports.upload = function (file, options, callback) {

  const filename = options.filename;
  const imgKey = utility.md5(filename + String((new Date()).getTime())) + path.extname(filename);

  file.pipe(concat(function (fileBuffer) {

    const params = {
      Bucket: config.cos_access.cosFileBucket,
      Region: config.cos_access.cosRegion,
      Key: imgKey,
      Body: fileBuffer,
      ContentLength: fileBuffer.length
    };

    cos.putObject(params, function (err, data) {
      if (err){
        return callback(err, data, null)
      }

      callback(null, {
        url: 'http://' + config.cos_access.cosFileBucket + '-' + config.cos_access.cosAppId +
        '.cosgz.myqcloud.com/' + imgKey
      }, fileBuffer);

    })
  }))


};