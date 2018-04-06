const AipFace = require('aip-face').face;

const APP_ID = "9930550";
const API_KEY = "0QXsbts1D9DD2ueH5jeBnKAn";
const SECRET_KEY = "t9n8EVgKVbMeI7wvs9iaoXVHAULsuAZN";

const client = new AipFace(APP_ID, API_KEY, SECRET_KEY);

exports.registerImages = (uid, userInfo, groupIds, base64Img, callback) => {
  client.addUser(uid, userInfo, groupIds, base64Img).then((result) => {
    if (result.error_msg) {
      callback(false);
      return;
    }
    callback(true);
  });
};

exports.searchImages = (groupIds, base64Img, callback) => {
  client.identifyUser(groupIds, base64Img, {usertopnum: 5}).then(function (result) {
    callback(result);
  });
};

exports.deleteUser = (uid) => {
  client.deleteUser(uid).then(function(result) {
  });
};