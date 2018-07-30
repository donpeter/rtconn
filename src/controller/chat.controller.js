// const io = require('../socket.io');
const index = (req, res) => {
  const data = {
    title: 'RTConn',
  };
  res.render('chat', data);
};


module.exports = {
  index,
};
