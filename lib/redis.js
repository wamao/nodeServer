var redis = require('redis');
var redisClient = redis.createClient(6379);

redisClient.on('error', function (err) {
    console.log('Error ' + err);
});

redisClient.on('connect', function () {
    console.log('Redis is ready');
});


module.exports = {
	 redis,
	 redisClient
}

