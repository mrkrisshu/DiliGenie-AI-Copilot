/**
 * Unit tests for OpenRouter library
 */

const {
  estimateTokens,
  checkTokenBudget,
  buildRAGPrompt,
} = require("../../lib/openrouter");

describe("OpenRouter Library", () => {
  describe("estimateTokens", () => {
    test("estimates tokens correctly", () => {
      const text = "Hello world";
      const tokens = estimateTokens(text);
      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBeLessThan(10);
    });

    test("handles empty string", () => {
      const tokens = estimateTokens("");
      expect(tokens).toBe(0);
    });

    test("scales with text length", () => {
      const short = estimateTokens("Hi");
      const long = estimateTokens(
        "This is a much longer text with many more words"
      );
      expect(long).toBeGreaterThan(short);
    });
  });

  describe("checkTokenBudget", () => {
    test("returns within budget for small messages", () => {
      const messages = [{ role: "user", content: "Hello" }];
      const result = checkTokenBudget(messages, 1000);
      expect(result.withinBudget).toBe(true);
    });

    test("returns over budget for large messages", () => {
      const messages = [{ role: "user", content: "x".repeat(10000) }];
      const result = checkTokenBudget(messages, 100);
      expect(result.withinBudget).toBe(false);
    });

    test("includes estimated tokens", () => {
      const messages = [{ role: "user", content: "Test" }];
      const result = checkTokenBudget(messages);
      expect(result.estimatedTokens).toBeGreaterThan(0);
    });
  });

  describe("buildRAGPrompt", () => {
    test("builds prompt with context", () => {
      const query = "What is Jarvis?";
      const context = [{ text: "Jarvis is an AI assistant" }];
      const history = [];

      const messages = buildRAGPrompt(query, context, history);

      expect(messages).toHaveLength(2); // system + user
      expect(messages[0].role).toBe("system");
      expect(messages[1].role).toBe("user");
      expect(messages[1].content).toBe(query);
    });

    test("includes conversation history", () => {
      const query = "Tell me more";
      const context = [];
      const history = [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there" },
      ];

      const messages = buildRAGPrompt(query, context, history);

      expect(messages.length).toBeGreaterThan(2);
      expect(messages.some((m) => m.content === "Hello")).toBe(true);
    });

    test("limits history length", () => {
      const query = "Question";
      const context = [];
      const history = Array(20)
        .fill(null)
        .map((_, i) => ({
          role: i % 2 === 0 ? "user" : "assistant",
          content: `Message ${i}`,
        }));

      process.env.CONVERSATION_HISTORY_LENGTH = "5";
      const messages = buildRAGPrompt(query, context, history);

      // Should have system + last 5 history + user query
      expect(messages.length).toBeLessThanOrEqual(7);
    });
  });
});
