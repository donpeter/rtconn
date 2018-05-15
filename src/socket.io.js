const io = require('socket.io')();
const htmlEntities = require('html-entities').AllHtmlEntities;

io.on('connection', (socket) => {

  socket.on('join-room', (payload) => {
    // socket.join(payload.signalRoom); //Join the Signaling  messages room
    socket.join(payload.room, () => {
      const message = {
        nickname: payload.nickname,
        message: `Joined Room ${payload.room}`,
      };
      socket.to(payload.room).emit('user-join', message);
    }); // Join the chat messages rooms
  });
  socket.on('signal-message', (payload) => {
    // console.log('SISNAL_MESSAGE', payload);
    // Emits the signalling message to all other in the room
    socket.to(payload.room).emit('signal-message', payload);
  });
  socket.on('chat-message', (payload) => {
    // Escapes any HTML special character for security reasons
    payload.message = htmlEntities.encode(payload.message);
    socket.to(payload.room).emit('chat-message', payload);
  });
  socket.on('file-transfer', (payload) => {
    const fileMeta = {
      nickname: payload.nickname,
      fileName: payload.fileName,
      fileSize: payload.fileSize,
    };
    // console.log(payload);
    socket.to(payload.room).emit('file-transfer', fileMeta);
  });
  socket.on('call_ended', (payload) => {
    socket.to(payload.room).emit('call_ended', payload);
  });

  socket.on('disconnect', () => {
    // console.log('User disconnected');
  });
});

module.exports = io;
