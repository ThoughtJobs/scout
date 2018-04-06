const mongoose  = require('mongoose');
const Schema    = mongoose.Schema;

const IMageSchema = new Schema({
  userId: { type: String},
  url: { type: String },
});

IMageSchema.pre('save', (next) => {
  // const now = new Date();
  // this.update_at = now;
  next();
});

mongoose.model('Image', IMageSchema);