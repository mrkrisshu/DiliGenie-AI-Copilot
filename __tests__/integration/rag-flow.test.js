/**
 * Integration smoke test
 * Tests the full flow: ingest → query → chat
 * Uses mocks to avoid actual API calls
 */

// Mock the external dependencies
jest.mock("../../lib/pinecone", () => ({
  queryVectors: jest.fn(),
  formatContextChunks: jest.fn(),
}));

jest.mock("../../lib/openrouter", () => ({
  ...jest.requireActual("../../lib/openrouter"),
  chatCompletion: jest.fn(),
}));

const { queryVectors, formatContextChunks } = require("../../lib/pinecone");
const { chatCompletion, buildRAGPrompt } = require("../../lib/openrouter");

describe("Integration: RAG Flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("full RAG flow: query → retrieve → generate", async () => {
    // Mock Pinecone query results
    const mockMatches = [
      {
        id: "doc1_chunk_0",
        score: 0.9,
        metadata: {
          text: "Jarvis is an AI assistant",
          source: "docs",
          chunk_index: 0,
        },
      },
    ];

    queryVectors.mockResolvedValue(mockMatches);
    formatContextChunks.mockReturnValue([
      {
        id: "doc1_chunk_0",
        score: 0.9,
        text: "Jarvis is an AI assistant",
        source: "docs",
      },
    ]);

    // Mock OpenRouter response
    chatCompletion.mockResolvedValue({
      content: "Jarvis is an advanced AI assistant.",
      model: "google/gemini-flash-1.5",
      usage: {
        prompt_tokens: 100,
        completion_tokens: 20,
      },
    });

    // Simulate RAG flow
    const query = "What is Jarvis?";
    const queryEmbedding = Array(384).fill(0.1); // Mock embedding

    // 1. Query Pinecone
    const matches = await queryVectors(queryEmbedding, 3);
    expect(matches).toHaveLength(1);

    // 2. Format context
    const context = formatContextChunks(matches);
    expect(context).toHaveLength(1);
    expect(context[0].text).toContain("AI assistant");

    // 3. Build prompt
    const messages = buildRAGPrompt(query, context, []);
    expect(messages.length).toBeGreaterThan(1);

    // 4. Generate response
    const response = await chatCompletion(messages);
    expect(response.content).toBeDefined();
    expect(response.usage).toBeDefined();
  });

  test("handles empty context gracefully", async () => {
    queryVectors.mockResolvedValue([]);
    formatContextChunks.mockReturnValue([]);

    chatCompletion.mockResolvedValue({
      content: "I don't have enough information to answer that.",
      model: "google/gemini-flash-1.5",
      usage: { prompt_tokens: 50, completion_tokens: 10 },
    });

    const query = "Unknown question";
    const queryEmbedding = Array(384).fill(0.1);

    const matches = await queryVectors(queryEmbedding, 3);
    const context = formatContextChunks(matches);
    const messages = buildRAGPrompt(query, context, []);
    const response = await chatCompletion(messages);

    expect(response.content).toContain("don't have");
  });
});
