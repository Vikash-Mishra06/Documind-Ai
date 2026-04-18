const { createClient } = require("redis");

const redisClient = createClient({
  socket: {
    reconnectStrategy: false, // prevent infinite retry
  },
});

redisClient.on("error", (err) => {
  console.log("Redis Error:", err.message);
});

(async () => {
  try {
    await redisClient.connect();
    console.log("Redis Connected");
  } catch (err) {
    console.log("Running without Redis");
  }
})();

module.exports = redisClient;