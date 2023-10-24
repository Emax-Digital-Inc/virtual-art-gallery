import dotenv from "dotenv";
import redis from "redis";

dotenv.config();

/**
 * First, define the redisClient variable with the value set to undefined.
 * After that, define an anonymous self-invoked asynchronous function.
 * Within the function, you invoke the redis module’s createClient() method that creates a redis object.
 * Call the Node.js on() method that registers events on the Redis object.
 * Finally, call the connect() method, which starts the connection with Redis on the default port 6379.
 */
let redisClient;
(async () => {
  redisClient = redis.createClient();
  redisClient.on("error", (error) => console.error(`Error : ${error}`));
  await redisClient.connect();
})();

export default redisClient;
