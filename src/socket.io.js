const io = require('socket.io')();
const htmlEntities = require('html-entities').AllHtmlEntities;

io.on('connection', function(socket) {
  io.emit('user-join', 'A new user just join');
  socket.on('join-room', function(room) {
    socket.join(room, function() {
      // console.log('Joined Room', socket.rooms);
    });
  });
  socket.on('chat-message', function(payload) {
    // console.log('Chat: ', socket.id, payload);
    payload.message = htmlEntities.encode(payload.message);
    socket.to(payload.room).emit('chat-message', payload);
  });
  socket.on('disconnect', function() {
    // console.log('User disconnected');
  });
});

module.exports = io;
