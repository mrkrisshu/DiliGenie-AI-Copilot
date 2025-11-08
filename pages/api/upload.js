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
    const uploadDir = path.join(process.cwd(), "uploads");

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
        let fileContent = "";
        
        // Parse different file types
        if (fileExt === '.pdf') {
          try {
            // For PDFs, use pdf-parse
            const pdfParse = require('pdf-parse');
            const dataBuffer = fs.readFileSync(file.filepath);
            const pdfData = await pdfParse(dataBuffer);
            fileContent = pdfData.text;
            console.log(`📄 Extracted ${pdfData.numpages} pages from PDF, ${fileContent.length} chars`);
          } catch (pdfError) {
            console.warn("⚠️ PDF parsing failed, treating as text:", pdfError.message);
            fileContent = `[PDF Document: ${file.originalFilename}]\n\nContent could not be extracted. Please ensure pdf-parse is installed.`;
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

        // Send immediate response - don't wait for indexing
        res.status(200).json({
          success: true,
          id: file.newFilename,
          filename: file.originalFilename,
          size: file.size,
          chunks: chunks.length,
          message: `File "${file.originalFilename}" uploaded successfully (${chunks.length} chunks created)`,
          processing: true, // Indicates background processing
        });

        // Start indexing in background AFTER response is sent
        if (process.env.PINECONE_API_KEY && chunks.length > 0) {
          setImmediate(async () => {
            try {
              console.log("🔄 Starting background indexing for:", file.originalFilename, `(${chunks.length} chunks)`);
              
              // Import embedding and Pinecone functions
              const { generateEmbedding } = require("../../lib/openrouter");
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
              
              console.log(`✅ Background indexing completed for: ${file.originalFilename} (${totalIndexed} chunks)`);
            } catch (error) {
              console.error("⚠️ Background indexing error:", error.message);
            }
          });
        } else if (!process.env.PINECONE_API_KEY) {
          console.warn("⚠️ Pinecone API key not configured, skipping indexing");
        }
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
