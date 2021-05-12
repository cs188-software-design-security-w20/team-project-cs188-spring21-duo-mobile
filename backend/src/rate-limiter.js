const moment = require("moment");
const redisClient = require("./redis-client");

const RATE_LIMIT_WINDOW_HOURS = 24; // Window duration for which rate limiting should apply
const REQUEST_LIMIT_COUNT = 20000; // Max number of requests per window
const LOG_GROUP_WINDOW_HOURS = 1; // Rate limit window bucket duration

// Sliding window counter based rate limiting middleware
const rateLimiterMiddleware = (req, res, next) => {
  try {
    if (!redisClient) {
      throw new Error("Redis client not initialized");
    }
    return redisClient.get(req.ip, (err, val) => {
      if (err) {
        throw new Error("Error fetching from redis");
      }
      const currTime = moment();
      if (!val && REQUEST_LIMIT_COUNT > 0) {
        redisClient.set(
          req.ip,
          JSON.stringify([
            {
              ts: currTime.unix(),
              cnt: 1,
            },
          ]),
          "EX",
          RATE_LIMIT_WINDOW_HOURS * 60 * 60
        );
        return next();
      }
      const data = JSON.parse(val);
      const startTime = currTime.subtract(RATE_LIMIT_WINDOW_HOURS, "h").unix();
      let requestCountInWindow = 0;
      const newData = data.filter((reqGroup) => {
        if (reqGroup.ts > startTime) {
          requestCountInWindow += reqGroup.cnt;
          return true;
        }
        return false;
      });
      if (requestCountInWindow >= REQUEST_LIMIT_COUNT) {
        redisClient.set(
          req.ip,
          JSON.stringify(newData),
          "EX",
          RATE_LIMIT_WINDOW_HOURS * 60 * 60
        );
        return res.status(429).send({ error: "Rate limit exceeded" });
      }
      const logGroupStartTime = currTime
        .subtract(LOG_GROUP_WINDOW_HOURS, "h")
        .unix();
      if (
        newData.length > 0 &&
        newData[newData.length - 1].ts > logGroupStartTime
      ) {
        newData[newData.length - 1].cnt += 1;
      } else {
        newData.push({ ts: currTime.unix(), cnt: 1 });
      }
      redisClient.set(
        req.ip,
        JSON.stringify(newData),
        "EX",
        RATE_LIMIT_WINDOW_HOURS * 60 * 60
      );
      return next();
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { rateLimiterMiddleware };
