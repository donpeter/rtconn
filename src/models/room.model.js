const mongoose = require('mongoose');
const Schema= mongoose.Schema;
const roomSchema = Schema({
  name: {
    type: String,
    lowercase: true,
  },
  password: String,
  type: {
    type: String,
  },
  owner: {
    type: Schema.ObjectId,
    ref: 'User',
  },
});

const Room = mongoose.Model('Room', roomSchema);

module.exports = Room;
