/**
 * PDF Processing Utility
 * Serverless-compatible PDF text extraction using pdf2json
 */

const fs = require('fs');
const path = require('path');

/**
 * Extract text from PDF buffer
 * @param {Buffer|Uint8Array} dataBuffer - PDF file buffer
 * @returns {Promise<string>} - Extracted text content
 */
async function extractTextFromPDF(dataBuffer) {
  return new Promise((resolve, reject) => {
    try {
      const PDFParser = require('pdf2json');
      const pdfParser = new PDFParser();
      
      console.log(`📦 Starting PDF parsing with pdf2json...`);
      
      // Set up error handler
      pdfParser.on('pdfParser_dataError', (errData) => {
        console.error('❌ PDF parsing error:', errData.parserError);
        reject(new Error(`PDF parsing failed: ${errData.parserError}`));
      });
      
      // Set up success handler
      pdfParser.on('pdfParser_dataReady', (pdfData) => {
        try {
          console.log(`� PDF parsed successfully, extracting text...`);
          
          // Extract text from all pages
          let fullText = '';
          let pageNum = 0;
          
          if (pdfData.Pages && Array.isArray(pdfData.Pages)) {
            for (const page of pdfData.Pages) {
              pageNum++;
              const pageTexts = [];
              
              // Extract text from page
              if (page.Texts && Array.isArray(page.Texts)) {
                for (const text of page.Texts) {
                  if (text.R && Array.isArray(text.R)) {
                    for (const run of text.R) {
                      if (run.T) {
                        // Decode URI-encoded text
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
          
          console.log(`✅ Successfully extracted ${fullText.length} characters from ${pageNum} pages`);
          resolve(fullText);
          
        } catch (extractError) {
          console.error('❌ Text extraction error:', extractError);
          reject(new Error(`Text extraction failed: ${extractError.message}`));
        }
      });
      
      // Parse the PDF buffer
      pdfParser.parseBuffer(Buffer.from(dataBuffer));
      
    } catch (error) {
      console.error('❌ PDF processor initialization failed:', error);
      reject(new Error(`PDF processing error: ${error.message}`));
    }
  });
}

module.exports = {
  extractTextFromPDF,
};
