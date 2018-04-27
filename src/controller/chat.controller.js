// const io = require('../socket.io');
const index = (req, res) => {
  const data = {
    title: 'RTConn',
    users: [
      {
        id: 'donpeter',
        username: 'donpeter',
      }, {
        id: 'patunalu',
        username: 'patunalu',
      }, {
        id: 'dubem',
        username: 'dubem',
      }, {
        id: 'chidubem',
        username: 'chidubem',
      },
    ],
  };
  // const namespace = req.params.room.toLowerCase();
  // const nsp = io.of(namespace);
  // const nsp =res.io;
  /*
  nsp.on('connection', function(socket) {
    nsp.emit('user-join', 'A new user just join');
    socket.on('join-room', function(room) {
      socket.join(room, function() {
        console.log(socket.rooms);
      });
    });
    socket.on('chat-message', function(payload) {
      console.log('Chat: ', socket.id, payload);
      socket.in(payload.room).emit('chat-message', payload.message);
    });
    socket.on('disconnect', function() {
      console.log('User disconnected')
    });
  });
*/
  res.render('chat', data);
};


module.exports = {
  index,
};
