/**
 * GET /api/summary
 * Generate conversation summary with insights
 */

const { chatCompletion } = require("../../lib/openrouter");
const { getConversationHistory } = require("../../lib/database");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { conversationId } = req.query;

    if (!conversationId) {
      return res.status(400).json({ error: "Conversation ID required" });
    }

    // Get conversation messages
    const messages = getConversationHistory(conversationId);

    if (messages.length === 0) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Build conversation transcript
    const transcript = messages
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join("\n\n");

    // Generate summary using OpenRouter
    const summaryPrompt = [
      {
        role: "system",
        content: `You are a helpful assistant that summarizes conversations. Provide:
1. A brief summary (2-3 sentences)
2. Key topics discussed (bullet points)
3. Action items or follow-ups (if any)
4. Main insights or conclusions

Be concise and structured.`,
      },
      {
        role: "user",
        content: `Please summarize this conversation:\n\n${transcript}`,
      },
    ];

    const completion = await chatCompletion(summaryPrompt, {
      max_tokens: 400,
      temperature: 0.3,
    });

    res.status(200).json({
      conversationId,
      messageCount: messages.length,
      summary: completion.content,
      transcript,
    });
  } catch (error) {
    console.error("Summary API error:", error);
    res.status(500).json({
      error: "Failed to generate summary",
      details: error.message,
    });
  }
}
