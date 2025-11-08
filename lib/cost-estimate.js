/**
 * Cost Estimation and Budget Tracking
 * Helps monitor API usage for $6 credit budget
 */

/**
 * Model pricing (per 1M tokens)
 * Source: OpenRouter pricing page (approximate, check latest)
 */
const MODEL_PRICING = {
  "google/gemini-flash-1.5": {
    input: 0.075,
    output: 0.3,
  },
  "meta-llama/llama-3.1-8b-instruct": {
    input: 0.06,
    output: 0.06,
  },
  "mistralai/mistral-7b-instruct": {
    input: 0.06,
    output: 0.06,
  },
  "anthropic/claude-3-haiku": {
    input: 0.25,
    output: 1.25,
  },
  "openai/gpt-3.5-turbo": {
    input: 0.5,
    output: 1.5,
  },
  // Default fallback
  default: {
    input: 0.1,
    output: 0.3,
  },
};

/**
 * Estimate cost for a completion
 * @param {Object} usage - {prompt_tokens, completion_tokens}
 * @param {string} model - Model name
 * @returns {Object} - {inputCost, outputCost, totalCost, breakdown}
 */
function estimateCost(usage, model) {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING["default"];

  const promptTokens = usage.prompt_tokens || 0;
  const completionTokens = usage.completion_tokens || 0;

  const inputCost = (promptTokens / 1_000_000) * pricing.input;
  const outputCost = (completionTokens / 1_000_000) * pricing.output;
  const totalCost = inputCost + outputCost;

  return {
    inputCost: inputCost.toFixed(6),
    outputCost: outputCost.toFixed(6),
    totalCost: totalCost.toFixed(6),
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
    model,
    breakdown: `$${inputCost.toFixed(6)} (input) + $${outputCost.toFixed(
      6
    )} (output) = $${totalCost.toFixed(6)}`,
  };
}

/**
 * Estimate cost before making request (using rough token estimate)
 * @param {number} estimatedInputTokens
 * @param {number} estimatedOutputTokens
 * @param {string} model
 * @returns {Object}
 */
function estimateCostPreRequest(
  estimatedInputTokens,
  estimatedOutputTokens,
  model
) {
  return estimateCost(
    {
      prompt_tokens: estimatedInputTokens,
      completion_tokens: estimatedOutputTokens,
    },
    model
  );
}

/**
 * Check if request is within budget
 * @param {number} estimatedCost - in dollars
 * @param {number} remainingBudget - in dollars
 * @returns {Object} - {withinBudget, estimatedCost, remainingBudget, warning}
 */
function checkBudget(estimatedCost, remainingBudget = 6.0) {
  const withinBudget = estimatedCost <= remainingBudget;
  const percentUsed = ((estimatedCost / remainingBudget) * 100).toFixed(2);

  let warning = null;
  if (percentUsed > 80) {
    warning = `⚠️ High budget usage: ${percentUsed}% of remaining budget`;
  } else if (percentUsed > 50) {
    warning = `⚠️ Moderate budget usage: ${percentUsed}% of remaining budget`;
  }

  return {
    withinBudget,
    estimatedCost: parseFloat(estimatedCost.toFixed(6)),
    remainingBudget,
    percentUsed: parseFloat(percentUsed),
    warning,
  };
}

/**
 * Calculate how many requests fit in budget
 * @param {number} costPerRequest - in dollars
 * @param {number} totalBudget - in dollars
 * @returns {Object}
 */
function calculateBudgetAllowance(costPerRequest, totalBudget = 6.0) {
  const maxRequests = Math.floor(totalBudget / costPerRequest);
  const costPer100Requests = costPerRequest * 100;

  return {
    maxRequests,
    costPerRequest: parseFloat(costPerRequest.toFixed(6)),
    totalBudget,
    costPer100Requests: parseFloat(costPer100Requests.toFixed(2)),
    recommendation:
      maxRequests > 1000
        ? "Excellent for demo - very cost-effective"
        : maxRequests > 500
        ? "Good for demo - reasonable cost"
        : maxRequests > 100
        ? "Limited demo capacity - consider cheaper model"
        : "Warning: Very expensive model for $6 budget",
  };
}

/**
 * Get recommended settings for $6 budget
 * @param {string} model
 * @returns {Object}
 */
function getRecommendedSettings(model = "google/gemini-flash-1.5") {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING["default"];

  // Conservative settings for demo
  const settings = {
    model,
    max_tokens: 256,
    temperature: 0.3,
    top_k: 3, // For RAG retrieval
    conversation_history_length: 5,
  };

  // Estimate cost per typical request
  // Assume: 500 input tokens (context + history), 256 output tokens
  const estimatedCost = estimateCostPreRequest(500, 256, model);
  const budgetInfo = calculateBudgetAllowance(
    parseFloat(estimatedCost.totalCost),
    6.0
  );

  return {
    recommendedSettings: settings,
    estimatedCostPerRequest: estimatedCost.totalCost,
    estimatedRequests: budgetInfo.maxRequests,
    notes: [
      "These settings optimize for cost while maintaining quality",
      `Estimated ${budgetInfo.maxRequests} requests on $6 budget`,
      "Increase max_tokens for longer responses (higher cost)",
      "Enable caching to reduce Pinecone costs",
    ],
  };
}

/**
 * Format cost summary for logging
 * @param {Object} costEstimate
 * @returns {string}
 */
function formatCostSummary(costEstimate) {
  return `💰 Cost: $${costEstimate.totalCost} | Tokens: ${costEstimate.totalTokens} (${costEstimate.promptTokens} in + ${costEstimate.completionTokens} out)`;
}

module.exports = {
  MODEL_PRICING,
  estimateCost,
  estimateCostPreRequest,
  checkBudget,
  calculateBudgetAllowance,
  getRecommendedSettings,
  formatCostSummary,
};
