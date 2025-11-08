/**
 * PDF Processing Utility
 * Serverless-compatible PDF text extraction with multiple fallback methods
 */

const fs = require('fs');

/**
 * Method 1: Try pdf2json (best for most PDFs)
 */
async function tryPdf2json(dataBuffer) {
  return new Promise((resolve, reject) => {
    try {
      const PDFParser = require('pdf2json');
      const pdfParser = new PDFParser();
      
      console.log(`📦 Trying pdf2json parser...`);
      
      const timeout = setTimeout(() => {
        reject(new Error('pdf2json timeout after 30 seconds'));
      }, 30000);
      
      pdfParser.on('pdfParser_dataError', (errData) => {
        clearTimeout(timeout);
        reject(new Error(`pdf2json error: ${errData.parserError}`));
      });
      
      pdfParser.on('pdfParser_dataReady', (pdfData) => {
        clearTimeout(timeout);
        try {
          let fullText = '';
          let pageNum = 0;
          
          if (pdfData.Pages && Array.isArray(pdfData.Pages)) {
            for (const page of pdfData.Pages) {
              pageNum++;
              const pageTexts = [];
              
              if (page.Texts && Array.isArray(page.Texts)) {
                for (const text of page.Texts) {
                  if (text.R && Array.isArray(text.R)) {
                    for (const run of text.R) {
                      if (run.T) {
                        const decodedText = decodeURIComponent(run.T);
                        pageTexts.push(decodedText);
                      }
                    }
                  }
                }
              }
              
              if (pageTexts.length > 0) {
                fullText += `--- Page ${pageNum} ---\n${pageTexts.join(' ')}\n\n`;
              }
            }
          }
          
          if (fullText.trim().length === 0) {
            reject(new Error('No text extracted from PDF'));
          } else {
            console.log(`✅ pdf2json: Extracted ${fullText.length} chars from ${pageNum} pages`);
            resolve(fullText);
          }
        } catch (error) {
          reject(error);
        }
      });
      
      pdfParser.parseBuffer(Buffer.from(dataBuffer));
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Method 2: Try pdf-parse-fork (fallback)
 */
async function tryPdfParseFork(dataBuffer) {
  try {
    console.log(`📦 Trying pdf-parse-fork parser...`);
    const pdfParse = require('pdf-parse-fork');
    const data = await pdfParse(Buffer.from(dataBuffer));
    
    if (!data.text || data.text.trim().length === 0) {
      throw new Error('No text extracted from PDF');
    }
    
    console.log(`✅ pdf-parse-fork: Extracted ${data.text.length} chars from ${data.numpages} pages`);
    return data.text;
  } catch (error) {
    throw new Error(`pdf-parse-fork error: ${error.message}`);
  }
}

/**
 * Extract text from PDF buffer with multiple fallback methods
 * @param {Buffer|Uint8Array} dataBuffer - PDF file buffer
 * @returns {Promise<string>} - Extracted text content
 */
async function extractTextFromPDF(dataBuffer) {
  const errors = [];
  
  // Try Method 1: pdf2json
  try {
    return await tryPdf2json(dataBuffer);
  } catch (error) {
    console.warn(`⚠️ pdf2json failed:`, error.message);
    errors.push(`pdf2json: ${error.message}`);
  }
  
  // Try Method 2: pdf-parse-fork
  try {
    return await tryPdfParseFork(dataBuffer);
  } catch (error) {
    console.warn(`⚠️ pdf-parse-fork failed:`, error.message);
    errors.push(`pdf-parse-fork: ${error.message}`);
  }
  
  // All methods failed
  console.error('❌ All PDF parsing methods failed');
  throw new Error(`PDF processing failed with all methods. Errors: ${errors.join('; ')}. This PDF may be encrypted, corrupted, or in an unsupported format.`);
}

module.exports = {
  extractTextFromPDF,
};
