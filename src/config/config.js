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
    redis: {host: 'redis'},
  },

  test: {
    root: rootPath,
    app: {
      name: 'rtconn',
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://mongo/rtconn-test',
    redis: {host: 'redis'},
  },

  production: {
    root: rootPath,
    app: {
      name: 'rtconn',
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://mongo/rtconn-production',
    redis: {host: 'redis'},

  },
};

module.exports = config[env];
