const { Pinecone } = require('@pinecone-database/pinecone');
const fs = require('fs');
const path = require('path');

// Read .env file manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

async function clearPinecone() {
  try {
    console.log('🗑️ Clearing Pinecone index...');
    
    const pc = new Pinecone({
      apiKey: envVars.PINECONE_API_KEY,
    });
    
    const index = pc.index(envVars.PINECONE_INDEX_NAME);
    
    // Delete all vectors
    await index.deleteAll();
    
    console.log('✅ All vectors deleted from Pinecone!');
    console.log('📤 You can now upload your documents again with proper PDF parsing.');
    
  } catch (error) {
    console.error('❌ Error clearing Pinecone:', error);
  }
}

clearPinecone();
