import { createClient } from "redis";

let client;

export const getRedisClient = async () => {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    client.on("error", (err) => console.error("Redis Client Error", err));

    await client.connect();
  }
  return client;
};

/**
 * Get value from Redis by key
 * @param {string} key
 * @returns {Promise<any|null>}
 */
export const getCache = async (key) => {
  const redis = await getRedisClient();
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};

/**
 * Set value in Redis with TTL (seconds)
 * @param {string} key
 * @param {any} value
 * @param {number} ttlSeconds
 */
export const setCache = async (key, value, ttlSeconds = 60) => {
  const redis = await getRedisClient();
  await redis.setEx(key, ttlSeconds, JSON.stringify(value));
};

/**
 * Delete key from Redis
 * @param {string} key
 */
export const deleteCache = async (key) => {
  const redis = await getRedisClient();
  await redis.del(key);
};
