const fs = require('fs');
const pdfParse = require('pdf-parse');

async function checkPDF() {
  try {
    const dataBuffer = fs.readFileSync('uploads/1762585049279-DSA_Questions_and_Answers.pdf');
    const data = await pdfParse(dataBuffer);
    
    console.log('📄 PDF Info:');
    console.log('  Pages:', data.numpages);
    console.log('  Text length:', data.text.length, 'chars\n');
    
    console.log('--- First 500 chars ---');
    console.log(data.text.substring(0, 500));
    console.log('\n--- Searching for "cross" or "validation" ---\n');
    
    const lines = data.text.split('\n');
    let found = 0;
    lines.forEach((line, i) => {
      if (line.toLowerCase().includes('cross') || line.toLowerCase().includes('validation')) {
        console.log(`Line ${i + 1}: ${line.trim()}`);
        found++;
      }
    });
    
    if (found === 0) {
      console.log('❌ NO mentions of "cross" or "validation" found in this PDF!');
      console.log('\nThis PDF is about DSA (Data Structures), not Machine Learning!');
    } else {
      console.log(`\n✅ Found ${found} mentions`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkPDF();
