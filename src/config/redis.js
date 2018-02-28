const config = require('./config');
const redis = require('redis');
const {promisify} = require('util');


const redisClient = redis.createClient(config.redis);
redisClient.getAsync = promisify(redisClient.get).bind(redisClient);

redisClient.on('error', function(err) {
  throw new Error('Redis: ' + err);
});


module.exports = redisClient;
