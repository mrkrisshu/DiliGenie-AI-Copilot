/**
 * Test file upload and ingestion directly
 */

const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    line = line.trim();
    // Skip comments and empty lines
    if (!line || line.startsWith('#')) return;
    
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove quotes if present
      value = value.replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

async function testIngest() {
  console.log('🧪 Testing Document Ingestion...\n');

  // Check if embeddings will work
  console.log('API Keys Status:');
  console.log('- OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('- PINECONE_API_KEY:', process.env.PINECONE_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('- HUGGINGFACE_API_KEY:', process.env.HUGGINGFACE_API_KEY ? '✅ Set' : '⚠️  Not set (will use mock embeddings)');
  console.log();

  try {
    const { generateEmbedding } = require('../lib/embeddings');
    const { upsertVectors } = require('../lib/pinecone');
    const { addDocument } = require('../lib/database');

    // Test text
    const testText = 'This is a test document for the RAG system. It contains information about DiliGenie AI Assistant.';
    
    console.log('📝 Test text:', testText.substring(0, 50) + '...');
    console.log();

    // Generate embedding
    console.log('🔢 Generating embedding...');
    const embedding = await generateEmbedding(testText);
    console.log('✅ Embedding generated:', embedding.length, 'dimensions');
    console.log('   First 5 values:', embedding.slice(0, 5));
    console.log();

    // Create vector
    const docId = 'test-doc-' + Date.now();
    const vectors = [{
      id: docId + '_chunk_0',
      values: embedding,
      metadata: {
        text: testText,
        source: 'test-document.txt',
        chunk_index: 0,
        total_chunks: 1,
        doc_id: docId,
      }
    }];

    // Upload to Pinecone
    console.log('📤 Uploading to Pinecone...');
    await upsertVectors(vectors);
    console.log('✅ Successfully uploaded to Pinecone!');
    console.log();

    // Save to database
    console.log('💾 Saving to database...');
    const doc = addDocument('test-document.txt', 'text/plain', testText.length, {
      chunks: 1,
      characters: testText.length,
    });
    console.log('✅ Document saved:', doc.id);
    console.log();

    console.log('🎉 Test completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Check Pinecone dashboard - you should see 1 record');
    console.log('2. Go to /knowledge page - you should see test-document.txt');
    console.log('3. Ask a question about DiliGenie in the chat');

  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
  }
}

testIngest().catch(console.error);
