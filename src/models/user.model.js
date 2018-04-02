const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = Schema({
  username: {
    type: String,
    lowercase: true,
    unique: true
  },
  nickname: String,
  password: {
    type: String,
  },
  email: {
    type: String,
    unique: true
  }
});

const User = mongoose.Model('User', userSchema);

module.exports = User;