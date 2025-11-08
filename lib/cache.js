/**
 * Simple in-memory cache with TTL
 * Used to cache Pinecone query results and reduce API calls
 */

const NodeCache = require("node-cache");

const CACHE_CONFIG = {
  enabled: process.env.ENABLE_CACHE === "1",
  ttl: parseInt(process.env.CACHE_TTL_SECONDS || "300"), // 5 minutes default
};

// Initialize cache
const cache = new NodeCache({
  stdTTL: CACHE_CONFIG.ttl,
  checkperiod: 60,
  useClones: false,
});

/**
 * Generate cache key from query vector
 * @param {Array} vector
 * @param {Object} options
 * @returns {string}
 */
function generateCacheKey(vector, options = {}) {
  const vectorHash = vector.slice(0, 5).join(","); // Use first 5 dims for key
  const optionsStr = JSON.stringify(options);
  return `query:${vectorHash}:${optionsStr}`;
}

/**
 * Get cached result
 * @param {string} key
 * @returns {any|null}
 */
function getCached(key) {
  if (!CACHE_CONFIG.enabled) return null;

  try {
    const value = cache.get(key);
    if (value !== undefined) {
      console.log(`Cache HIT: ${key}`);
      return value;
    }
    console.log(`Cache MISS: ${key}`);
    return null;
  } catch (error) {
    console.error("Cache get error:", error);
    return null;
  }
}

/**
 * Set cached result
 * @param {string} key
 * @param {any} value
 * @param {number} ttl - Optional custom TTL in seconds
 */
function setCached(key, value, ttl = null) {
  if (!CACHE_CONFIG.enabled) return;

  try {
    cache.set(key, value, ttl || CACHE_CONFIG.ttl);
    console.log(`Cache SET: ${key}`);
  } catch (error) {
    console.error("Cache set error:", error);
  }
}

/**
 * Delete cached result
 * @param {string} key
 */
function deleteCached(key) {
  if (!CACHE_CONFIG.enabled) return;

  try {
    cache.del(key);
    console.log(`Cache DELETE: ${key}`);
  } catch (error) {
    console.error("Cache delete error:", error);
  }
}

/**
 * Clear all cache
 */
function clearCache() {
  try {
    cache.flushAll();
    console.log("Cache cleared");
  } catch (error) {
    console.error("Cache clear error:", error);
  }
}

/**
 * Get cache stats
 */
function getCacheStats() {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    enabled: CACHE_CONFIG.enabled,
    ttl: CACHE_CONFIG.ttl,
  };
}

module.exports = {
  generateCacheKey,
  getCached,
  setCached,
  deleteCached,
  clearCache,
  getCacheStats,
};
