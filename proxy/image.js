const models = require('../models');
const Image = models.Image;

exports.saveWithUserId = (userId, url, callback) => {
  const image = new Image();
  image.userId = userId;
  image.url = url;
  image.save(callback);
};

exports.getImagesByUserId = (userId, callback) => {
  Image.find({userId: userId}, callback);
};
