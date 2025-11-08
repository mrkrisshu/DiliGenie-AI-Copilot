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
        let fileContent;
        
        // Parse different file types
        if (fileExt === '.pdf') {
          // For PDFs, use pdf-parse
          const pdfParse = require('pdf-parse');
          const dataBuffer = fs.readFileSync(file.filepath);
          const pdfData = await pdfParse(dataBuffer);
          fileContent = pdfData.text;
          console.log(`📄 Extracted ${pdfData.numpages} pages from PDF, ${fileContent.length} chars`);
        } else {
          // For text files, read as UTF-8
          fileContent = fs.readFileSync(file.filepath, "utf8");
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
          message: `File "${file.originalFilename}" uploaded successfully. Indexing in progress...`,
          processing: true, // Indicates background processing
        });

        // Start ingestion in background AFTER response is sent (fire and forget)
        if (process.env.PINECONE_API_KEY) {
          setImmediate(async () => {
            try {
              console.log("🔄 Starting background indexing for:", file.originalFilename);
              const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"}/api/ingest`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    filename: file.originalFilename,
                    content: fileContent,
                    metadata: {
                      uploadedAt: new Date().toISOString(),
                      fileSize: file.size,
                      fileType: fileExt,
                    },
                  }),
                }
              );
              
              if (response.ok) {
                console.log("✅ Background indexing completed for:", file.originalFilename);
              } else {
                console.warn("⚠️  Background indexing failed for:", file.originalFilename);
              }
            } catch (error) {
              console.warn("⚠️  Background indexing error:", error.message);
            }
          });
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
