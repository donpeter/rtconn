const path = require('path');
const rootPath = path.normalize(__dirname + '/..');
const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'rtconn',
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://mongo/rtconn-development',
  },

  test: {
    root: rootPath,
    app: {
      name: 'rtconn',
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/rtconn-test',
  },

  production: {
    root: rootPath,
    app: {
      name: 'rtconn',
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/rtconn-production',
  },
};

module.exports = config[env];
