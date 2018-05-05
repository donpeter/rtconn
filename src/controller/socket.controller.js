const connection = (socket) => {
  socket.broadcast.emit('user-join', 'A new user just join');
  socket.on('join-room', function(room) {
    socket.join(room, function() {
      // console.log(socket.rooms);
    });
  });
  socket.on('chat-message', function(payload) {
    // console.log('Chat: ', payload);
    socket.broadcast.to(payload.chatRoom).emit('chat-message', payload.message);
  });
  socket.on('disconnect', function() {
  });
};
const joinRoom = (room) => {

};

module.exports = {
  connection,
  joinRoom,
};
