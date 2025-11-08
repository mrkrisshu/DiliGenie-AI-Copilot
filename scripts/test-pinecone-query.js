/**
 * Test script to check if documents are in Pinecone
 */

require('dotenv').config();

async function testPineconeQuery() {
  console.log("🔍 Testing Pinecone connection and query...\n");

  try {
    // Test 1: Check environment variables
    console.log("1️⃣ Checking environment variables:");
    console.log("   PINECONE_API_KEY:", process.env.PINECONE_API_KEY ? "✅ Set" : "❌ Missing");
    console.log("   PINECONE_INDEX_NAME:", process.env.PINECONE_INDEX_NAME || "❌ Missing");
    console.log("   HUGGINGFACE_API_KEY:", process.env.HUGGINGFACE_API_KEY ? "✅ Set" : "❌ Missing");
    console.log();

    // Test 2: Initialize Pinecone
    console.log("2️⃣ Initializing Pinecone client...");
    const { Pinecone } = require("@pinecone-database/pinecone");
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    console.log("   ✅ Pinecone client initialized");
    console.log();

    // Test 3: Get index
    console.log("3️⃣ Connecting to index:", process.env.PINECONE_INDEX_NAME);
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
    console.log("   ✅ Index connected");
    console.log();

    // Test 4: Get index stats
    console.log("4️⃣ Fetching index statistics...");
    try {
      const stats = await index.describeIndexStats();
      console.log("   📊 Total vectors:", stats.totalRecordCount || 0);
      console.log("   📦 Namespaces:", JSON.stringify(stats.namespaces || {}, null, 2));
      console.log();
    } catch (statsError) {
      console.log("   ⚠️ Could not get stats:", statsError.message);
      console.log();
    }

    // Test 5: Generate a test embedding
    console.log("5️⃣ Generating test embedding for 'cross validation'...");
    const { generateEmbedding } = require("../lib/embeddings");
    const testQuery = "what is cross validation";
    const embedding = await generateEmbedding(testQuery);
    console.log("   ✅ Embedding generated");
    console.log("   📏 Dimension:", embedding.length);
    console.log("   🔢 First 5 values:", embedding.slice(0, 5));
    console.log();

    // Test 6: Query Pinecone
    console.log("6️⃣ Querying Pinecone for similar vectors...");
    const queryResult = await index.query({
      topK: 5,
      vector: embedding,
      includeMetadata: true,
    });
    
    console.log("   📝 Results found:", queryResult.matches?.length || 0);
    
    if (queryResult.matches && queryResult.matches.length > 0) {
      console.log("\n   ✅ SUCCESS! Documents found in Pinecone:\n");
      queryResult.matches.forEach((match, i) => {
        console.log(`   ${i + 1}. ID: ${match.id}`);
        console.log(`      Score: ${match.score?.toFixed(4)}`);
        console.log(`      Filename: ${match.metadata?.filename || 'N/A'}`);
        console.log(`      Text: ${match.metadata?.text?.substring(0, 100) || 'N/A'}...`);
        console.log();
      });
    } else {
      console.log("\n   ❌ NO DOCUMENTS FOUND!");
      console.log("   This means:");
      console.log("   • Upload might have failed silently");
      console.log("   • Embeddings weren't stored in Pinecone");
      console.log("   • Wrong index or namespace");
      console.log();
    }

  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    console.error(error.stack);
  }
}

testPineconeQuery();
