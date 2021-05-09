const redis = require('redis');

const RedisClient = (() => redis.createClient())();

module.exports = RedisClient;
