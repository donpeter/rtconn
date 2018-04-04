const connection = (socket) => {
  console.log('A user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
};

module.exports = {
  connection
};