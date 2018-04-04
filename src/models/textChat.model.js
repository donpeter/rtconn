const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
  text: String,
  user_id: {
    type: String,
  },
  dateTime: Date,
});
const textChatSchema = mongoose.Schema({
  room_id: String,
  name: String,
  message: [messageSchema],

});

const TextChat = mongoose.model('TextChat', textChatSchema);
module.exports = TextChat;
