const socketIo = require('socket.io');
const conntroller = require('./controller/socket.controller');

const io = socketIo();
// app.io = io;
io.on('connection', conntroller.connection);
module.exports = io;