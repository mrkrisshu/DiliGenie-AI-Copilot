/**
 * Upload API
 * Handles file uploads and document ingestion
 */

import formidable from "formidable";
import fs from "fs";
import path from "path";

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Use /tmp on Vercel (only writable location), ./uploads locally
    const uploadDir = process.env.VERCEL 
      ? "/tmp/uploads" 
      : path.join(process.cwd(), "uploads");

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      filename: (name, ext, part) => {
        return `${Date.now()}-${part.originalFilename}`;
      },
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Upload error:", err);
        return res.status(500).json({ error: "Upload failed" });
      }

      const file = files.file?.[0] || files.file;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const allowedTypes = [".pdf", ".txt", ".doc", ".docx", ".md"];
      const fileExt = path.extname(file.originalFilename || "").toLowerCase();

      if (!allowedTypes.includes(fileExt)) {
        fs.unlinkSync(file.filepath);
        return res.status(400).json({
          error: `File type not allowed. Allowed types: ${allowedTypes.join(
            ", "
          )}`,
        });
      }

      try {
        console.log("📤 Processing file:", file.originalFilename);
        console.log("📍 File saved at:", file.filepath);
        
        // Check if file exists
        if (!fs.existsSync(file.filepath)) {
          throw new Error(`File not found at ${file.filepath}`);
        }
        
        let fileContent = "";
        
        // Parse different file types
        if (fileExt === '.pdf') {
          try {
            console.log("📖 Starting PDF text extraction...");
            const { extractTextFromPDF } = require("../../lib/pdf-processor");
            const dataBuffer = fs.readFileSync(file.filepath);
            fileContent = await extractTextFromPDF(dataBuffer);
          } catch (pdfError) {
            console.error("❌ PDF parsing error:", pdfError);
            
            // Clean up the uploaded file
            try {
              fs.unlinkSync(file.filepath);
            } catch (cleanupError) {
              console.warn("⚠️ Failed to clean up file:", cleanupError);
            }
            
            // Return user-friendly error message
            return res.status(400).json({ 
              error: "Unable to process this PDF file",
              message: "This PDF file cannot be processed. It may be encrypted, password-protected, corrupted, or contain only images without text. Please try:\n\n• Converting the PDF to a text file (.txt)\n• Ensuring the PDF is not password-protected\n• Using a different PDF file\n• Uploading as plain text (.txt) or Markdown (.md) instead",
              suggestion: "For best results, use .txt or .md files which process instantly and reliably."
            });
          }
        } else {
          // For text files, read as UTF-8
          try {
            fileContent = fs.readFileSync(file.filepath, "utf8");
          } catch (readError) {
            console.error("❌ File read error:", readError);
            fileContent = `[File: ${file.originalFilename}]`;
          }
        }

        // Simple text chunking (split into paragraphs)
        const chunks = fileContent
          .split(/\n\n+/)
          .filter((chunk) => chunk.trim().length > 0)
          .map((chunk, index) => ({
            id: `${file.newFilename}-chunk-${index}`,
            text: chunk.trim(),
            metadata: {
              filename: file.originalFilename,
              chunkIndex: index,
              uploadedAt: new Date().toISOString(),
            },
          }));

        // Here you would normally:
        // 1. Generate embeddings for each chunk
        // 2. Store in Pinecone vector database
        // For now, we'll just return the chunks

        // Index to Pinecone BEFORE responding (Vercel requires synchronous processing)
        if (process.env.PINECONE_API_KEY && chunks.length > 0) {
          try {
            console.log("🔄 Starting indexing for:", file.originalFilename, `(${chunks.length} chunks)`);
            
            // Import embedding and Pinecone functions
            const { generateEmbedding } = require("../../lib/embeddings");
            const { upsertVectors } = require("../../lib/pinecone");
            
            // Process in batches of 10
            const BATCH_SIZE = 10;
            let totalIndexed = 0;
            
            for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
              const batch = chunks.slice(i, i + BATCH_SIZE);
              
              // Generate embeddings in parallel
              const embeddingPromises = batch.map(async (chunk) => {
                const embedding = await generateEmbedding(chunk.text);
                return {
                  id: chunk.id,
                  values: embedding,
                  metadata: {
                    text: chunk.text.substring(0, 1000), // Store first 1000 chars
                    ...chunk.metadata,
                  },
                };
              });
              
              const vectors = await Promise.all(embeddingPromises);
              
              // Upsert to Pinecone
              await upsertVectors(vectors);
              totalIndexed += vectors.length;
              
              console.log(`📊 Indexed ${totalIndexed}/${chunks.length} chunks for: ${file.originalFilename}`);
            }
            
            console.log(`✅ Indexing completed for: ${file.originalFilename} (${totalIndexed} chunks)`);
            
            // Clean up temporary file
            try {
              if (fs.existsSync(file.filepath)) {
                fs.unlinkSync(file.filepath);
                console.log("🗑️ Cleaned up temporary file");
              }
            } catch (cleanupError) {
              console.warn("⚠️ Cleanup error:", cleanupError.message);
            }
          } catch (indexError) {
            console.error("⚠️ Indexing error:", indexError.message);
            // Still respond with success but mention indexing failed
            res.status(200).json({
              success: true,
              id: file.newFilename,
              filename: file.originalFilename,
              size: file.size,
              chunks: chunks.length,
              message: `File "${file.originalFilename}" uploaded but indexing failed: ${indexError.message}`,
              indexingFailed: true,
            });
            return;
          }
        } else if (!process.env.PINECONE_API_KEY) {
          console.warn("⚠️ Pinecone API key not configured, skipping indexing");
        }

        // Add document to local database for Knowledge Base display
        try {
          const { addDocument } = require("../../lib/database");
          addDocument(
            file.originalFilename,  // name
            fileExt,                 // type
            file.size,               // size
            {                        // metadata
              chunks: chunks.length,
              uploadedAt: new Date().toISOString(),
              preview: fileContent.substring(0, 500),
            }
          );
          console.log("📝 Added document to local database");
        } catch (dbError) {
          console.warn("⚠️ Failed to add to local database:", dbError.message);
        }

        // Send response after indexing completes
        res.status(200).json({
          success: true,
          id: file.newFilename,
          filename: file.originalFilename,
          size: file.size,
          chunks: chunks.length,
          message: `File "${file.originalFilename}" uploaded and indexed successfully (${chunks.length} chunks)`,
          indexed: true,
        });
      } catch (processError) {
        console.error("File processing error:", processError);
        fs.unlinkSync(file.filepath);
        res.status(500).json({
          error: "Failed to process file",
          details: processError.message,
        });
      }
    });
  } catch (error) {
    console.error("Upload handler error:", error);
    res.status(500).json({
      error: "Upload failed",
      details: error.message,
    });
  }
}
