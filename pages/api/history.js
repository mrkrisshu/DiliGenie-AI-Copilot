/**
 * GET /api/history
 * Retrieve conversation history
 */

const {
  getAllConversations,
  getConversationHistory,
} = require("../../lib/database");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { conversationId, limit = 20 } = req.query;

    if (conversationId) {
      // Get specific conversation messages
      const messages = getConversationHistory(conversationId, parseInt(limit));

      return res.status(200).json({
        conversationId,
        messages,
      });
    } else {
      // Get all conversations
      const conversations = getAllConversations(parseInt(limit));

      return res.status(200).json({
        conversations,
      });
    }
  } catch (error) {
    console.error("History API error:", error);
    res.status(500).json({
      error: "Failed to retrieve history",
      details: error.message,
    });
  }
}
