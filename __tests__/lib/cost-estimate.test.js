/**
 * Unit tests for cost estimation
 */

const {
  estimateCost,
  estimateCostPreRequest,
  checkBudget,
  calculateBudgetAllowance,
  getRecommendedSettings,
} = require("../../lib/cost-estimate");

describe("Cost Estimate Library", () => {
  describe("estimateCost", () => {
    test("calculates cost correctly", () => {
      const usage = {
        prompt_tokens: 100,
        completion_tokens: 50,
      };
      const model = "google/gemini-flash-1.5";

      const result = estimateCost(usage, model);

      expect(result.totalCost).toBeDefined();
      expect(parseFloat(result.totalCost)).toBeGreaterThan(0);
      expect(result.totalTokens).toBe(150);
    });

    test("handles zero tokens", () => {
      const usage = {
        prompt_tokens: 0,
        completion_tokens: 0,
      };
      const result = estimateCost(usage, "google/gemini-flash-1.5");

      expect(parseFloat(result.totalCost)).toBe(0);
    });

    test("uses default pricing for unknown model", () => {
      const usage = {
        prompt_tokens: 100,
        completion_tokens: 100,
      };
      const result = estimateCost(usage, "unknown-model");

      expect(result.totalCost).toBeDefined();
      expect(parseFloat(result.totalCost)).toBeGreaterThan(0);
    });
  });

  describe("checkBudget", () => {
    test("returns within budget", () => {
      const result = checkBudget(0.001, 6.0);
      expect(result.withinBudget).toBe(true);
      expect(result.warning).toBeNull();
    });

    test("returns over budget", () => {
      const result = checkBudget(7.0, 6.0);
      expect(result.withinBudget).toBe(false);
    });

    test("provides warning at high usage", () => {
      const result = checkBudget(5.0, 6.0);
      expect(result.warning).toBeDefined();
    });
  });

  describe("calculateBudgetAllowance", () => {
    test("calculates max requests", () => {
      const costPerRequest = 0.001;
      const result = calculateBudgetAllowance(costPerRequest, 6.0);

      expect(result.maxRequests).toBe(6000);
      expect(result.recommendation).toBeDefined();
    });

    test("provides recommendations", () => {
      const cheapResult = calculateBudgetAllowance(0.0001, 6.0);
      const expensiveResult = calculateBudgetAllowance(0.1, 6.0);

      expect(cheapResult.recommendation).toContain("Excellent");
      expect(expensiveResult.recommendation).toBeDefined();
    });
  });

  describe("getRecommendedSettings", () => {
    test("returns recommended settings", () => {
      const result = getRecommendedSettings();

      expect(result.recommendedSettings).toBeDefined();
      expect(result.recommendedSettings.max_tokens).toBeDefined();
      expect(result.estimatedRequests).toBeGreaterThan(0);
      expect(result.notes).toBeInstanceOf(Array);
    });

    test("works with different models", () => {
      const result = getRecommendedSettings("meta-llama/llama-3.1-8b-instruct");

      expect(result.recommendedSettings.model).toBe(
        "meta-llama/llama-3.1-8b-instruct"
      );
    });
  });
});
