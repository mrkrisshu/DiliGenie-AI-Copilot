/**
 * Clean up bad vectors from Pinecone
 * Removes vectors that have placeholder text instead of real content
 */

require('dotenv').config();

async function cleanupPinecone() {
  console.log("🧹 Cleaning up Pinecone database...\n");

  try {
    const { Pinecone } = require("@pinecone-database/pinecone");
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
    
    // Get all vectors
    console.log("1️⃣ Fetching all vectors...");
    const stats = await index.describeIndexStats();
    console.log(`   Total vectors: ${stats.totalRecordCount}`);
    console.log();

    // Query to get all IDs (we'll do a dummy query with high topK)
    console.log("2️⃣ Finding vectors with placeholder content...");
    const dummyVector = Array(1024).fill(0);
    const allVectors = await index.query({
      topK: 10000, // Get all
      vector: dummyVector,
      includeMetadata: true,
    });

    const badVectors = [];
    const goodVectors = [];

    allVectors.matches.forEach((match) => {
      const text = match.metadata?.text || "";
      
      // Check if it's a placeholder (contains "Content could not be extracted" or very short)
      if (
        text.includes("Content could not be extracted") ||
        text.includes("[PDF Document:") ||
        text.length < 50 // Very short text is likely bad
      ) {
        badVectors.push({
          id: match.id,
          filename: match.metadata?.filename || "Unknown",
          textLength: text.length,
          preview: text.substring(0, 100),
        });
      } else {
        goodVectors.push({
          id: match.id,
          filename: match.metadata?.filename || "Unknown",
          textLength: text.length,
        });
      }
    });

    console.log(`   ✅ Good vectors: ${goodVectors.length}`);
    console.log(`   ❌ Bad vectors (to delete): ${badVectors.length}`);
    console.log();

    if (badVectors.length > 0) {
      console.log("3️⃣ Bad vectors found:");
      badVectors.forEach((v, i) => {
        console.log(`   ${i + 1}. ${v.id}`);
        console.log(`      Filename: ${v.filename}`);
        console.log(`      Text length: ${v.textLength} chars`);
        console.log(`      Preview: ${v.preview}...`);
        console.log();
      });

      console.log("4️⃣ Deleting bad vectors...");
      const idsToDelete = badVectors.map(v => v.id);
      
      // Delete in batches of 100 (Pinecone limit)
      for (let i = 0; i < idsToDelete.length; i += 100) {
        const batch = idsToDelete.slice(i, i + 100);
        await index.deleteMany(batch);
        console.log(`   Deleted ${Math.min(i + 100, idsToDelete.length)}/${idsToDelete.length}`);
      }

      console.log(`   ✅ Deleted ${badVectors.length} bad vectors!`);
      console.log();

      console.log("5️⃣ Remaining good vectors:");
      goodVectors.forEach((v, i) => {
        console.log(`   ${i + 1}. ${v.filename} (${v.textLength} chars)`);
      });
    } else {
      console.log("   ✅ No bad vectors found! Database is clean.");
    }

    console.log("\n✨ Cleanup complete!");

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
  }
}

cleanupPinecone();
