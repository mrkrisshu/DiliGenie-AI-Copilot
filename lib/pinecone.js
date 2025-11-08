/**
 * Pinecone Vector Database Adapter
 * Handles vector storage and retrieval for RAG
 * Compatible with @pinecone-database/pinecone v2.x
 */

const { Pinecone } = require("@pinecone-database/pinecone");

let pineconeClient = null;

/**
 * Initialize Pinecone client (singleton)
 * Pinecone v2 uses synchronous initialization with apiKey in constructor
 */
function getPineconeClient() {
  if (!pineconeClient) {
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) {
      throw new Error("PINECONE_API_KEY is not configured");
    }

    // Pinecone v2.x API - pass apiKey directly to constructor
    pineconeClient = new Pinecone({
      apiKey: apiKey,
    });
  }
  return pineconeClient;
}

/**
 * Get Pinecone index
 */
function getIndex() {
  const client = getPineconeClient();
  const indexName = process.env.PINECONE_INDEX_NAME || "jarvis-knowledge";
  return client.index(indexName);
}

/**
 * Upsert vectors to Pinecone
 * @param {Array} vectors - Array of {id, values, metadata}
 * @param {string} namespace - Optional namespace
 */
async function upsertVectors(vectors, namespace = "") {
  try {
    const index = getIndex();
    
    // Pinecone v2 API format - simpler structure
    const upsertOptions = namespace && namespace.trim() !== "" 
      ? { namespace } 
      : {};

    await index.upsert(vectors, upsertOptions);
    return { success: true, count: vectors.length };
  } catch (error) {
    console.error("Pinecone upsert error:", error);
    throw error;
  }
}

/**
 * Query Pinecone for similar vectors
 * @param {Array} queryVector - Embedding vector
 * @param {number} topK - Number of results to return
 * @param {Object} filter - Optional metadata filter
 * @param {string} namespace - Optional namespace
 * @returns {Promise<Array>} - Array of matches with metadata
 */
async function queryVectors(
  queryVector,
  topK = 3,
  filter = null,
  namespace = ""
) {
  try {
    const index = getIndex();
    
    // Pinecone v2 expects: index.query({ topK, vector, includeMetadata, ... })
    const queryOptions = {
      topK: parseInt(topK),
      vector: queryVector,
      includeMetadata: true,
    };

    // Only add namespace if it's not empty
    if (namespace && namespace.trim() !== "") {
      queryOptions.namespace = namespace;
    }

    // Only add filter if provided
    if (filter) {
      queryOptions.filter = filter;
    }

    const response = await index.query(queryOptions);
    return response.matches || [];
  } catch (error) {
    console.error("Pinecone query error:", error);
    throw error;
  }
}

/**
 * Delete vectors from Pinecone
 * @param {Array<string>} ids - Vector IDs to delete
 * @param {string} namespace - Optional namespace
 */
async function deleteVectors(ids, namespace = "") {
  try {
    const index = getIndex();
    await index.deleteMany(ids, namespace);
    return { success: true, deleted: ids.length };
  } catch (error) {
    console.error("Pinecone delete error:", error);
    throw error;
  }
}

/**
 * Delete all vectors in a namespace
 * @param {string} namespace
 */
async function deleteNamespace(namespace) {
  try {
    const index = getIndex();
    await index.namespace(namespace).deleteAll();
    return { success: true };
  } catch (error) {
    console.error("Pinecone delete namespace error:", error);
    throw error;
  }
}

/**
 * Fetch vectors by ID
 * @param {Array<string>} ids
 * @param {string} namespace
 * @returns {Promise<Object>} - Map of id -> vector data
 */
async function fetchVectors(ids, namespace = "") {
  try {
    const index = getIndex();
    const response = await index.fetch(ids, { namespace });
    return response.vectors || {};
  } catch (error) {
    console.error("Pinecone fetch error:", error);
    throw error;
  }
}

/**
 * Get index stats
 */
async function getIndexStats() {
  try {
    const index = getIndex();
    const stats = await index.describeIndexStats();
    return stats;
  } catch (error) {
    console.error("Pinecone stats error:", error);
    throw error;
  }
}

/**
 * Format query results for RAG
 * @param {Array} matches - Pinecone query results
 * @returns {Array} - Formatted context chunks
 */
function formatContextChunks(matches) {
  return matches.map((match) => ({
    id: match.id,
    score: match.score,
    text: match.metadata?.text || "",
    source: match.metadata?.filename || match.metadata?.source || "Unknown",
    chunkIndex: match.metadata?.chunkIndex || match.metadata?.chunk_index || 0,
    metadata: match.metadata || {},
  }));
}

module.exports = {
  getPineconeClient,
  getIndex,
  upsertVectors,
  queryVectors,
  deleteVectors,
  deleteNamespace,
  fetchVectors,
  getIndexStats,
  formatContextChunks,
};
