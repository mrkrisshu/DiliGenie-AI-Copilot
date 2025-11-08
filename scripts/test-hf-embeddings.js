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

const {generateEmbedding} = require('../lib/embeddings');

console.log('Testing Hugging Face embeddings...\n');

generateEmbedding('This is a test document about DiliGenie AI assistant.')
  .then(embedding => {
    console.log('✅ Success!');
    console.log('   Dimensions:', embedding.length);
    console.log('   First 5 values:', embedding.slice(0, 5));
    console.log('   Sample values range:', Math.min(...embedding).toFixed(4), 'to', Math.max(...embedding).toFixed(4));
    
    // Check if real embeddings
    // Real embeddings from transformers typically have values in [-1, 1] range (often smaller)
    // Mock embeddings are random values in [0, 1] range
    const allPositive = embedding.every(v => v >= 0 && v <= 1);
    const hasNegatives = embedding.some(v => v < 0);
    
    if (hasNegatives || !allPositive) {
      console.log('\n🎉 Using REAL Hugging Face embeddings!');
    } else {
      console.log('\n⚠️  Using mock embeddings (all values in 0-1 range)');
    }
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
  });
