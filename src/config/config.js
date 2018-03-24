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
    db: `mongodb://${process.env.MONGO_URL}/${process.env.MONGO_DB}` || 'mongodb://localhost/rtconn-test',
    redis: {host: process.env.REDIS_HOST || 'redis'},
  },

  production: {
    root: rootPath,
    app: {
      name: 'rtconn',
    },
    port: process.env.PORT || 3000,
    db: `mongodb://${process.env.MONGO_URL}/${process.env.MONGO_DB}` || 'mongodb://localhost/rtconn-production',
    redis: {host: process.env.REDIS_HOST || 'redis'},
  },
};

module.exports = config[env];
