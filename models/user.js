const mongoose  = require('mongoose');
const Schema    = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String},
  password: { type: String },
  email: { type: String},
  active: { type: Boolean, default: false },
  accessToken: { type: String},
});

UserSchema.index({username: 1}, {unique: true});
UserSchema.index({email: 1}, {unique: true});

UserSchema.pre('save', (next) => {
  // const now = new Date();
  // this.update_at = now;
  next();
});

mongoose.model('User', UserSchema);