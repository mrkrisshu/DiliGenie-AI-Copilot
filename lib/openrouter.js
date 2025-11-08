/**
 * OpenRouter API Adapter
 * Provides both streaming and non-streaming chat completions
 *
 * Recommended low-cost models for demo:
 * - google/gemini-flash-1.5 (~$0.075/1M tokens)
 * - meta-llama/llama-3.1-8b-instruct (~$0.06/1M tokens)
 * - mistralai/mistral-7b-instruct (~$0.06/1M tokens)
 */

const OPENROUTER_CONFIG = {
  apiKey: process.env.OPENROUTER_API_KEY,
  apiUrl:
    process.env.OPENROUTER_API_URL ||
    "https://openrouter.ai/api/v1/chat/completions",
  model: process.env.OPENROUTER_MODEL || "google/gemini-flash-1.5",
  enableStreaming: process.env.OPENROUTER_ENABLE_STREAMING === "1",
  maxTokens: parseInt(process.env.MAX_TOKENS || "256"),
  temperature: parseFloat(process.env.TEMPERATURE || "0.3"),
};

/**
 * Non-streaming chat completion
 * @param {Array} messages - Array of {role, content} messages
 * @param {Object} options - Additional options (max_tokens, temperature, etc.)
 * @returns {Promise<Object>} - {content, model, usage}
 */
async function chatCompletion(messages, options = {}) {
  if (!OPENROUTER_CONFIG.apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const payload = {
    model: options.model || OPENROUTER_CONFIG.model,
    messages,
    max_tokens: options.max_tokens || OPENROUTER_CONFIG.maxTokens,
    temperature: options.temperature ?? OPENROUTER_CONFIG.temperature,
    stream: false,
  };

  try {
    const response = await fetch(OPENROUTER_CONFIG.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_CONFIG.apiKey}`,
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": process.env.NEXT_PUBLIC_APP_NAME || "Jarvis AI Assistant",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenRouter API error: ${response.status} - ${
          errorData.error?.message || "Unknown error"
        }`
      );
    }

    const data = await response.json();

    return {
      content: data.choices[0]?.message?.content || "",
      model: data.model,
      usage: data.usage || {},
      finishReason: data.choices[0]?.finish_reason,
    };
  } catch (error) {
    console.error("OpenRouter chat completion error:", error);
    throw error;
  }
}

/**
 * Streaming chat completion (SSE)
 * @param {Array} messages - Array of {role, content} messages
 * @param {Object} options - Additional options
 * @returns {Promise<ReadableStream>} - Stream of SSE events
 */
async function chatCompletionStream(messages, options = {}) {
  if (!OPENROUTER_CONFIG.apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const payload = {
    model: options.model || OPENROUTER_CONFIG.model,
    messages,
    max_tokens: options.max_tokens || OPENROUTER_CONFIG.maxTokens,
    temperature: options.temperature ?? OPENROUTER_CONFIG.temperature,
    stream: true,
  };

  try {
    const response = await fetch(OPENROUTER_CONFIG.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_CONFIG.apiKey}`,
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": process.env.NEXT_PUBLIC_APP_NAME || "Jarvis AI Assistant",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenRouter API error: ${response.status} - ${
          errorData.error?.message || "Unknown error"
        }`
      );
    }

    return response.body;
  } catch (error) {
    console.error("OpenRouter streaming error:", error);
    throw error;
  }
}

/**
 * Parse SSE stream chunks
 * @param {ReadableStream} stream
 * @returns {AsyncGenerator<string>} - Yields content deltas
 */
async function* parseSSEStream(stream) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") return;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (e) {
            // Skip invalid JSON
            console.warn("Failed to parse SSE chunk:", data);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Build RAG prompt with context and conversation history
 * @param {string} query - User query
 * @param {Array} context - Retrieved context chunks
 * @param {Array} history - Previous conversation messages
 * @returns {Array} - Messages array for OpenRouter
 */
function buildRAGPrompt(query, context = [], history = []) {
  console.log(`🔍 Building RAG prompt with ${context.length} context chunks`);
  
  const contextText = context
    .map((chunk, idx) => {
      const text = chunk.text || chunk.content || '';
      console.log(`  [Source ${idx + 1}] Length: ${text.length} chars, Preview: ${text.substring(0, 100)}...`);
      return `[Source ${idx + 1}] ${text}`;
    })
    .join("\n\n");

  const systemPrompt = `You are an intelligent AI assistant that helps users understand information from their uploaded documents.

INSTRUCTIONS:
1. When answering questions, look for relevant information in the provided context/sources below.
2. Be flexible with question wording - if the user asks "what is an array?" and the context discusses "arrays", that's a match!
3. Understand variations: singular/plural (array vs arrays), "what is" vs "define" vs "explain", typos, etc.
4. If you find relevant information in the context, give a complete, detailed answer using that information.
5. Cite your sources by mentioning which [Source N] you used.
6. Only say "I don't have enough information" if the context truly has nothing related to the question.
7. For greetings or casual chat, respond naturally without needing context.

CONTEXT FROM UPLOADED DOCUMENTS:
${contextText || "No documents uploaded yet."}`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-parseInt(process.env.CONVERSATION_HISTORY_LENGTH || "5")),
    { role: "user", content: query },
  ];

  return messages;
}

/**
 * Estimate token count (rough approximation)
 * @param {string} text
 * @returns {number}
 */
function estimateTokens(text) {
  // Rough estimate: ~4 chars per token
  return Math.ceil(text.length / 4);
}

/**
 * Check if request is within token budget
 * @param {Array} messages
 * @param {number} budget
 * @returns {Object} - {withinBudget, estimatedTokens}
 */
function checkTokenBudget(messages, budget = null) {
  const totalText = messages.map((m) => m.content).join(" ");
  const estimatedTokens = estimateTokens(totalText);
  const budgetLimit =
    budget || parseInt(process.env.TOKEN_BUDGET_WARNING || "500");

  return {
    withinBudget: estimatedTokens <= budgetLimit,
    estimatedTokens,
    budget: budgetLimit,
  };
}

module.exports = {
  chatCompletion,
  chatCompletionStream,
  parseSSEStream,
  buildRAGPrompt,
  estimateTokens,
  checkTokenBudget,
  OPENROUTER_CONFIG,
};
