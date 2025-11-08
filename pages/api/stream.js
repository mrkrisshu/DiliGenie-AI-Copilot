/**
 * GET /api/stream
 * SSE streaming endpoint for OpenRouter
 * Proxies streaming responses from OpenRouter
 */

const {
  chatCompletionStream,
  buildRAGPrompt,
  parseSSEStream,
} = require("../../lib/openrouter");
const { queryVectors, formatContextChunks } = require("../../lib/pinecone");
const { getCached, setCached, generateCacheKey } = require("../../lib/cache");
const { getConversationHistory } = require("../../lib/database");

// Mock embedding generation
async function generateEmbedding(text) {
  const dimension = parseInt(process.env.PINECONE_DIMENSION || "384");
  return Array(dimension)
    .fill(0)
    .map(() => Math.random());
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, conversationId, includeContext = "true" } = req.query;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Get conversation history
    let history = [];
    if (conversationId) {
      const historyRecords = getConversationHistory(conversationId);
      history = historyRecords.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
    }

    // RAG: Retrieve context
    let context = [];
    if (includeContext === "true" && process.env.PINECONE_API_KEY) {
      try {
        const queryEmbedding = await generateEmbedding(message);
        const cacheKey = generateCacheKey(queryEmbedding, { topK: 3 });
        let matches = getCached(cacheKey);

        if (!matches) {
          matches = await queryVectors(queryEmbedding, 3);
          setCached(cacheKey, matches);
        }

        context = formatContextChunks(matches);
      } catch (error) {
        console.error("RAG retrieval error:", error);
      }
    }

    // Build prompt
    const messages = buildRAGPrompt(message, context, history);

    // Start streaming
    const stream = await chatCompletionStream(messages);

    // Send initial metadata
    res.write(
      `data: ${JSON.stringify({
        type: "start",
        sources: context.map((c) => c.source),
      })}\n\n`
    );

    // Stream tokens
    for await (const token of parseSSEStream(stream)) {
      res.write(
        `data: ${JSON.stringify({ type: "token", content: token })}\n\n`
      );
    }

    // Send completion
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Stream API error:", error);
    res.write(
      `data: ${JSON.stringify({ type: "error", error: error.message })}\n\n`
    );
    res.end();
  }
}
