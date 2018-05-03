const io = require('socket.io')();
const htmlEntities = require('html-entities').AllHtmlEntities;

io.on('connection', function(socket) {
  socket.on('join-room', function(payload) {
    socket.join(payload.room, function() {
      // console.log('Joined Room', socket.rooms);
      const message = {
        user: payload.user,
        message: 'Joined Room',
      };
      socket.to(payload.room).emit('user-join', message);

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
