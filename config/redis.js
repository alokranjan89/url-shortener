const { createClient } = require("redis");
require("dotenv").config();

const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.connect()
  .then(() => console.log("Redis connected"))
  .catch(err => console.error("Redis error:", err));

module.exports = redisClient;