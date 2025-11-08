/**
 * PDF Processing Utility
 * Serverless-compatible PDF text extraction using PDF.js
 */

/**
 * Extract text from PDF buffer
 * @param {Buffer|Uint8Array} dataBuffer - PDF file buffer
 * @returns {Promise<string>} - Extracted text content
 */
async function extractTextFromPDF(dataBuffer) {
  try {
    // Dynamically import PDF.js to avoid build issues
    const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
    
    // Convert Buffer to Uint8Array if needed
    const data = dataBuffer instanceof Uint8Array 
      ? dataBuffer 
      : new Uint8Array(dataBuffer);
    
    // Configure PDF.js
    const loadingTask = pdfjsLib.getDocument({
      data: data,
      useSystemFonts: true,
      verbosity: 0, // Suppress warnings
      standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/',
    });
    
    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;
    
    console.log(`📄 Processing PDF with ${numPages} pages`);
    
    const textPages = [];
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Combine text items with spaces
        const pageText = textContent.items
          .map(item => item.str)
          .filter(str => str.trim().length > 0)
          .join(' ');
        
        if (pageText.trim().length > 0) {
          textPages.push(`--- Page ${pageNum} ---\n${pageText}`);
        }
        
        // Clean up page resources
        page.cleanup();
      } catch (pageError) {
        console.warn(`⚠️ Error processing page ${pageNum}:`, pageError.message);
        textPages.push(`--- Page ${pageNum} ---\n[Error extracting page content]`);
      }
    }
    
    // Cleanup document
    await pdfDocument.cleanup();
    await pdfDocument.destroy();
    
    const fullText = textPages.join('\n\n');
    console.log(`✅ Successfully extracted ${fullText.length} characters from ${numPages} pages`);
    
    return fullText;
    
  } catch (error) {
    console.error('❌ PDF extraction failed:', error);
    throw new Error(`PDF processing error: ${error.message}`);
  }
}

module.exports = {
  extractTextFromPDF,
};
