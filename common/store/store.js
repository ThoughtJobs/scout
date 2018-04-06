const cos   = require('./store_cos');
const local = require('./store_local');


module.exports = cos || qn || local;
