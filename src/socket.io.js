const io = require('socket.io')();
const htmlEntities = require('html-entities').AllHtmlEntities;

io.on('connection', (socket) => {
  socket.on('join-room', (payload) => {
    //socket.join(payload.signalRoom); //Join the Signaling  messages room
    socket.join(payload.room, () => {
      const message = {
        user: payload.user,
        message: `Joined Room ${payload.room}`,
      };
      socket.to(payload.room).emit('user-join', message);

    }); //Join the chat messages rooms
  });

  socket.on('signal-message', (payload) => {
    console.log('ISNAL_MESSAGE', payload);
    socket.to(payload.room).emit('signal-message', payload); //Emits the signalling message to all other in the room
  });
  socket.on('chat-message', (payload) => {
    // console.log('Chat: ', socket.id, payload);
    payload.message = htmlEntities.encode(payload.message); //Escapes any HTML special character for security reasons
    socket.to(payload.room).emit('chat-message', payload);
  });
  socket.on('disconnect', () => {
    // console.log('User disconnected');
  });
});

module.exports = io;
