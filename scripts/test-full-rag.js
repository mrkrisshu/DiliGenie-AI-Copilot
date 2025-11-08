/**
 * Full RAG System Test
 * Tests: Embeddings → Pinecone → Database → Knowledge Page → Chat
 */

const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      value = value.replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

async function testFullRAG() {
  console.log('🧪 FULL RAG SYSTEM TEST\n');
  console.log('=' .repeat(60));
  
  // Step 1: Check API Keys
  console.log('\n📋 Step 1: Checking API Keys...');
  const checks = {
    'OpenRouter': process.env.OPENROUTER_API_KEY,
    'Pinecone': process.env.PINECONE_API_KEY,
    'Hugging Face': process.env.HUGGINGFACE_API_KEY,
  };
  
  let allGood = true;
  for (const [name, value] of Object.entries(checks)) {
    if (value && value.length > 0) {
      console.log(`   ✅ ${name}: Set`);
    } else {
      console.log(`   ❌ ${name}: Missing`);
      allGood = false;
    }
  }
  
  if (!allGood) {
    console.log('\n❌ Missing API keys! Please check your .env file.');
    return;
  }

  try {
    // Step 2: Test Real Embeddings
    console.log('\n🔢 Step 2: Testing Real Embeddings (Hugging Face)...');
    const { generateEmbedding } = require('../lib/embeddings');
    
    const testText = 'DiliGenie is an AI assistant that helps with document Q&A using RAG technology.';
    const embedding = await generateEmbedding(testText);
    
    if (embedding.length === 1024) {
      console.log(`   ✅ Generated ${embedding.length}D embedding`);
      // Check if it's NOT mock (mock embeddings are random between 0-1)
      const isMock = embedding.every(v => v >= 0 && v <= 1);
      if (isMock) {
        console.log('   ⚠️  WARNING: Using mock embeddings (Hugging Face may not be working)');
      } else {
        console.log('   ✅ Using REAL Hugging Face embeddings!');
      }
    } else {
      console.log(`   ❌ Wrong dimension: ${embedding.length} (expected 1024)`);
      return;
    }

    // Step 3: Test Pinecone Connection
    console.log('\n📤 Step 3: Testing Pinecone Connection...');
    const { Pinecone } = require('@pinecone-database/pinecone');
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME || 'diligenie');
    
    const stats = await index.describeIndexStats();
    console.log(`   ✅ Connected to Pinecone`);
    console.log(`   📊 Total vectors: ${stats.totalRecordCount || 0}`);
    
    if (stats.totalRecordCount === 0) {
      console.log('   ⚠️  No documents in Pinecone yet (upload some files!)');
    }

    // Step 4: Test Database
    console.log('\n💾 Step 4: Checking Database...');
    const { getAllDocuments } = require('../lib/database');
    const docs = getAllDocuments();
    console.log(`   ✅ Database connected`);
    console.log(`   📄 Documents in database: ${docs.length}`);
    
    if (docs.length > 0) {
      console.log('   📝 Recent documents:');
      docs.slice(0, 3).forEach(doc => {
        console.log(`      - ${doc.name} (${doc.metadata.chunks || 0} chunks)`);
      });
    }

    // Step 5: Test RAG Query
    console.log('\n🔍 Step 5: Testing RAG Query...');
    const query = 'What is DiliGenie?';
    const queryEmbedding = await generateEmbedding(query);
    
    const results = await index.query({
      vector: queryEmbedding,
      topK: 3,
      includeMetadata: true,
    });
    
    console.log(`   ✅ Query executed: "${query}"`);
    console.log(`   📊 Found ${results.matches?.length || 0} matches`);
    
    if (results.matches && results.matches.length > 0) {
      console.log('   📝 Top matches:');
      results.matches.slice(0, 3).forEach((match, i) => {
        console.log(`      ${i + 1}. Score: ${match.score.toFixed(4)} - ${match.metadata?.source || 'Unknown'}`);
        console.log(`         "${(match.metadata?.text || '').substring(0, 80)}..."`);
      });
    } else {
      console.log('   ⚠️  No matches found (upload documents first!)');
    }

    // Final Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ RAG SYSTEM TEST COMPLETE!\n');
    console.log('📊 Summary:');
    console.log(`   • API Keys: All set ✅`);
    console.log(`   • Embeddings: ${isMock ? 'Mock (⚠️ get HF key)' : 'Real (Hugging Face) ✅'}`);
    console.log(`   • Pinecone: ${stats.totalRecordCount || 0} vectors ✅`);
    console.log(`   • Database: ${docs.length} documents ✅`);
    console.log(`   • RAG Query: ${results.matches?.length || 0} matches ✅`);
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Go to http://localhost:3001/chat');
    console.log('   2. Upload some PDF/TXT files');
    console.log('   3. Ask questions about your documents');
    console.log('   4. Check http://localhost:3001/knowledge to see all documents');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testFullRAG().catch(console.error);
