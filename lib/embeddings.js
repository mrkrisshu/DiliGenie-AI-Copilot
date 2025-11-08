/**
 * Embeddings Generator
 * Supports multiple providers: Hugging Face (free), OpenAI (paid), local (free)
 */

/**
 * Generate embeddings using Hugging Face Inference API (FREE!)
 * Model: sentence-transformers/all-MiniLM-L6-v2 (384 dimensions)
 * Note: For 1024 dimensions, use: sentence-transformers/all-mpnet-base-v2
 */
async function generateHuggingFaceEmbedding(text) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  
  if (!apiKey) {
    console.warn("⚠️ HUGGINGFACE_API_KEY not set, using mock embeddings");
    return generateMockEmbedding();
  }

  try {
    // Use Hugging Face Inference API (NEW ENDPOINT as of 2025)
    // Models:
    // - sentence-transformers/all-MiniLM-L6-v2 (384d) - fast, smaller
    // - BAAI/bge-small-en-v1.5 (384d) - better quality
    // - sentence-transformers/all-mpnet-base-v2 (768d) - high quality
    const model = "BAAI/bge-small-en-v1.5"; // 384 dimensions, good quality
    
    const response = await fetch(
      `https://router.huggingface.co/hf-inference/models/${model}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: text.substring(0, 512), // Limit text length
          options: { wait_for_model: true },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    // Handle different response formats
    let vector;
    if (Array.isArray(result) && Array.isArray(result[0])) {
      // Format: [[embedding]]
      vector = result[0];
    } else if (Array.isArray(result)) {
      // Format: [embedding]
      vector = result;
    } else if (result.embeddings) {
      // Format: {embeddings: [embedding]}
      vector = Array.isArray(result.embeddings[0]) ? result.embeddings[0] : result.embeddings;
    } else {
      throw new Error("Unexpected response format from Hugging Face");
    }
    
    // If dimensions don't match, pad or truncate
    return adjustEmbeddingDimension(vector, parseInt(process.env.PINECONE_DIMENSION || "1024"));
  } catch (error) {
    console.error("Hugging Face embedding error:", error.message);
    console.warn("Falling back to mock embeddings");
    return generateMockEmbedding();
  }
}

/**
 * Generate embeddings using OpenAI (paid but high quality)
 */
async function generateOpenAIEmbedding(text) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn("⚠️ OPENAI_API_KEY not set, falling back");
    return generateHuggingFaceEmbedding(text);
  }

  try {
    const model = process.env.EMBEDDING_MODEL || "text-embedding-3-small";
    
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: text.substring(0, 8000), // OpenAI limit
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const vector = data.data[0].embedding;
    
    // Adjust dimension if needed
    return adjustEmbeddingDimension(vector, parseInt(process.env.PINECONE_DIMENSION || "1024"));
  } catch (error) {
    console.error("OpenAI embedding error:", error.message);
    return generateHuggingFaceEmbedding(text);
  }
}

/**
 * Adjust embedding dimension by padding or truncating
 */
function adjustEmbeddingDimension(vector, targetDim) {
  if (vector.length === targetDim) {
    return vector;
  }
  
  if (vector.length < targetDim) {
    // Pad with zeros
    return [...vector, ...Array(targetDim - vector.length).fill(0)];
  }
  
  // Truncate
  return vector.slice(0, targetDim);
}

/**
 * Generate mock embeddings (fallback - NOT FOR PRODUCTION!)
 */
function generateMockEmbedding() {
  const dimension = parseInt(process.env.PINECONE_DIMENSION || "1024");
  console.warn(`⚠️ Using MOCK embeddings (${dimension}D) - RAG won't work properly!`);
  return Array(dimension)
    .fill(0)
    .map(() => Math.random());
}

/**
 * Main embedding function - tries providers in order
 */
async function generateEmbedding(text) {
  // Try in order: OpenAI (best) -> Hugging Face (free) -> Mock (fallback)
  if (process.env.OPENAI_API_KEY) {
    return generateOpenAIEmbedding(text);
  }
  
  if (process.env.HUGGINGFACE_API_KEY) {
    return generateHuggingFaceEmbedding(text);
  }
  
  // Fallback to mock
  return generateMockEmbedding();
}

module.exports = {
  generateEmbedding,
  generateOpenAIEmbedding,
  generateHuggingFaceEmbedding,
  generateMockEmbedding,
};
