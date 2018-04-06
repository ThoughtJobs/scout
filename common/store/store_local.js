const config  = require('../../config');
const utility = require('utility');
const path    = require('path');
const fs      = require('fs');

exports.upload = function (file, options, callback) {
  const filename = options.filename;

  const newFilename = utility.md5(filename + String((new Date()).getTime())) +
    path.extname(filename);

  const upload_path = config.upload.path;
  const base_url    = config.upload.url;
  const filePath    = path.join(upload_path, newFilename);
  const fileUrl     = base_url + newFilename;

  file.on('end', function () {
    callback(null, {
      url: fileUrl
    });
  });

  file.pipe(fs.createWriteStream(filePath));
};
