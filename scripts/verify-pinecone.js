/**
 * Verify Pinecone connection and check stored documents
 */

const fs = require('fs');
const path = require('path');
const { Pinecone } = require('@pinecone-database/pinecone');

// Load .env manually
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    line = line.trim();
    // Skip comments and empty lines
    if (!line || line.startsWith('#')) return;
    
    const equalIndex = line.indexOf('=');
    if (equalIndex > 0) {
      const key = line.substring(0, equalIndex).trim();
      const value = line.substring(equalIndex + 1).trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

async function verifyPinecone() {
  console.log('🔍 Verifying Pinecone Setup...\n');

  // Check environment variables
  console.log('Environment Variables:');
  console.log('- PINECONE_API_KEY:', process.env.PINECONE_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('- PINECONE_ENVIRONMENT:', process.env.PINECONE_ENVIRONMENT || 'Not set');
  console.log('- PINECONE_INDEX_NAME:', process.env.PINECONE_INDEX_NAME || 'Not set');
  console.log('- PINECONE_DIMENSION:', process.env.PINECONE_DIMENSION || 'Not set');
  console.log();

  if (!process.env.PINECONE_API_KEY) {
    console.error('❌ PINECONE_API_KEY is not set in .env file');
    return;
  }

  try {
    // Initialize Pinecone client
    console.log('Connecting to Pinecone...');
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const indexName = process.env.PINECONE_INDEX_NAME || 'diligenie';
    console.log(`Opening index: ${indexName}`);
    
    const index = pinecone.index(indexName);

    // Get index stats
    console.log('\n📊 Fetching index statistics...');
    const stats = await index.describeIndexStats();
    
    console.log('\nIndex Statistics:');
    console.log('- Total Vectors:', stats.totalRecordCount || 0);
    console.log('- Dimension:', stats.dimension || 'Unknown');
    console.log('- Namespaces:', Object.keys(stats.namespaces || {}).length || 0);
    
    if (stats.namespaces) {
      console.log('\nNamespace Details:');
      for (const [name, data] of Object.entries(stats.namespaces)) {
        console.log(`  - ${name}: ${data.recordCount || 0} vectors`);
      }
    }

    // Try a sample query
    console.log('\n🔍 Testing sample query...');
    const dimension = parseInt(process.env.PINECONE_DIMENSION || '1024');
    const sampleVector = Array(dimension).fill(0).map(() => Math.random());
    
    const queryResponse = await index.query({
      vector: sampleVector,
      topK: 5,
      includeMetadata: true,
    });

    console.log('Query Results:', queryResponse.matches?.length || 0, 'matches found');
    
    if (queryResponse.matches && queryResponse.matches.length > 0) {
      console.log('\nSample matches:');
      queryResponse.matches.slice(0, 3).forEach((match, i) => {
        console.log(`\n  Match ${i + 1}:`);
        console.log('  - ID:', match.id);
        console.log('  - Score:', match.score);
        console.log('  - Source:', match.metadata?.source || 'Unknown');
        console.log('  - Text preview:', (match.metadata?.text || '').substring(0, 100) + '...');
      });
    } else {
      console.log('⚠️  No documents found in Pinecone. Upload some files first!');
    }

    console.log('\n✅ Pinecone verification complete!');

  } catch (error) {
    console.error('\n❌ Error verifying Pinecone:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run verification
verifyPinecone().catch(console.error);
