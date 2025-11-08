/**
 * POST /api/chat
 * Main RAG chat endpoint
 * Flow: embed query → retrieve from Pinecone → build prompt → call OpenRouter
 */

const {
  chatCompletion,
  buildRAGPrompt,
  estimateTokens,
  checkTokenBudget,
} = require("../../lib/openrouter");
const { queryVectors, formatContextChunks } = require("../../lib/pinecone");
const { generateCacheKey, getCached, setCached } = require("../../lib/cache");
const { estimateCost, formatCostSummary } = require("../../lib/cost-estimate");
const {
  createConversation,
  addMessage,
  getMessages,
} = require("../../lib/database");
const { generateEmbedding } = require("../../lib/embeddings");

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Validate OpenRouter API key
    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY.trim() === '') {
      return res.status(500).json({
        error: "OpenRouter API key not configured",
        details: "Please add OPENROUTER_API_KEY to your .env file"
      });
    }

    const { message, conversationId, includeContext = true } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    // Get or create conversation
    let convId = conversationId;
    if (!convId) {
      const newConv = createConversation(
        `Chat: ${message.substring(0, 30)}...`
      );
      convId = newConv.id;
    }

    // Save user message
    addMessage(convId, "user", message);

    // Get conversation history
    const history = getMessages(convId, 10);
    const formattedHistory = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    let context = [];
    let sources = [];

    // RAG: Retrieve relevant context from Pinecone (skip if not configured)
    if (includeContext && process.env.PINECONE_API_KEY && process.env.PINECONE_API_KEY.trim() !== '') {
      try {
        // Generate embedding for query
        const queryEmbedding = await generateEmbedding(message);

        // Check cache first
        const cacheKey = generateCacheKey(queryEmbedding, {
          topK: process.env.TOP_K_RESULTS || 3,
        });
        let matches = getCached(cacheKey);

        if (!matches) {
          // Query Pinecone
          const topK = parseInt(process.env.TOP_K_RESULTS || "3");
          matches = await queryVectors(queryEmbedding, topK);

          // Cache results
          setCached(cacheKey, matches);
        }

        // Format context
        context = formatContextChunks(matches);
        sources = context.map((chunk) => ({
          id: chunk.id,
          source: chunk.source,
          score: chunk.score,
          text: chunk.text.substring(0, 200) + "...",
        }));
      } catch (error) {
        console.error("RAG retrieval error (skipping):", error.message);
        // Continue without context - Pinecone not configured yet
      }
    } else if (includeContext) {
      console.log("ℹ️ Pinecone not configured - running in simple chat mode");
    }

    // Build prompt with RAG context
    const messages = buildRAGPrompt(message, context, formattedHistory);

    // Check token budget
    const budgetCheck = checkTokenBudget(messages);
    if (!budgetCheck.withinBudget) {
      console.warn(
        `⚠️ Token budget warning: ${budgetCheck.estimatedTokens} tokens (budget: ${budgetCheck.budget})`
      );
    }

    // Call OpenRouter
    const completion = await chatCompletion(messages, {
      max_tokens: parseInt(process.env.MAX_TOKENS || "256"),
      temperature: parseFloat(process.env.TEMPERATURE || "0.3"),
    });

    // Save assistant response
    const assistantMessage = addMessage(
      convId,
      "assistant",
      completion.content,
      {
        model: completion.model,
        sources: sources.map((s) => s.id),
      }
    );

    // Estimate cost
    const costEstimate = estimateCost(completion.usage, completion.model);
    console.log(formatCostSummary(costEstimate));

    // Return response
    res.status(200).json({
      answer: completion.content,
      conversationId: convId,
      sources,
      metadata: {
        model: completion.model,
        usage: completion.usage,
        cost: costEstimate,
        contextsUsed: context.length,
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({
      error: "Failed to process chat request",
      details: error.message,
    });
  }
}
