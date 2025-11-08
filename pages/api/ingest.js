/**
 * POST /api/ingest
 * Upload and ingest documents into Pinecone
 * Handles PDF files, text, and URLs
 */

const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const { v4: uuidv4 } = require("uuid");
const { upsertVectors } = require("../../lib/pinecone");
const { addDocument } = require("../../lib/database");
const { generateEmbedding } = require("../../lib/embeddings");

export const config = {
  api: {
    bodyParser: false, // Disable default body parser for file uploads
  },
};

/**
 * Chunk text with overlap
 */
function chunkText(text, chunkSize = 500, overlap = 50) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;

    if (start >= text.length - overlap) break;
  }

  return chunks;
}

/**
 * Process and ingest document
 */
async function ingestDocument(text, metadata) {
  console.log("📋 Chunking text...");
  const chunks = chunkText(text, 500, 50);
  console.log(`📊 Created ${chunks.length} chunks`);
  
  const vectors = [];

  console.log("🔢 Generating embeddings in batches of 10...");
  
  // Process in batches of 10 for faster speed (parallel API calls)
  const BATCH_SIZE = 10;
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    console.log(`   Progress: ${i}/${chunks.length} chunks...`);
    
    // Generate embeddings in parallel for this batch
    const embeddingPromises = batch.map(chunk => generateEmbedding(chunk));
    const embeddings = await Promise.all(embeddingPromises);
    
    // Add to vectors array
    batch.forEach((chunk, batchIndex) => {
      const chunkIndex = i + batchIndex;
      vectors.push({
        id: `${metadata.docId}_chunk_${chunkIndex}`,
        values: embeddings[batchIndex],
        metadata: {
          text: chunk,
          source: metadata.source,
          chunk_index: chunkIndex,
          total_chunks: chunks.length,
          doc_id: metadata.docId,
          ...metadata,
        },
      });
    });
  }

  console.log(`✅ All ${vectors.length} embeddings generated!`);
  console.log("📤 Uploading to Pinecone in batches...");
  
  // Upload to Pinecone in batches of 100 (Pinecone limit)
  const UPLOAD_BATCH_SIZE = 100;
  for (let i = 0; i < vectors.length; i += UPLOAD_BATCH_SIZE) {
    const batch = vectors.slice(i, i + UPLOAD_BATCH_SIZE);
    console.log(`   Uploading: ${i}/${vectors.length} vectors...`);
    await upsertVectors(batch);
  }
  
  console.log("✅ Pinecone upload complete!");

  return {
    chunksCreated: vectors.length,
    docId: metadata.docId,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Wrap form parsing in a promise to avoid "API resolved without sending response" warning
  return new Promise((resolve, reject) => {
    try {
      // Use IncomingForm for compatible formidable API
      const form = new formidable.IncomingForm({
        uploadDir: path.join(process.cwd(), "tmp"),
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB
      });

      // Ensure tmp directory exists
      const tmpDir = path.join(process.cwd(), "tmp");
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error("❌ Form parse error:", err);
          res.status(400).json({ error: "Failed to parse upload" });
          return resolve();
        }

        try {
          console.log("📝 Starting document ingestion...");
          console.log("📋 Files received:", Object.keys(files));
          console.log("📋 Fields received:", Object.keys(fields));
          
          const docId = uuidv4();
        let text = "";
        let docName = "";
        let docType = "";

        // Handle file upload
        if (files.file) {
          const file = Array.isArray(files.file) ? files.file[0] : files.file;
          const filePath = file.filepath;
          docName = file.originalFilename || "unknown";
          docType = file.mimetype || "unknown";

          console.log(`📄 Processing file: ${docName} (${docType})`);

          // Extract text based on file type
          if (docType === "application/pdf" || docName.endsWith(".pdf")) {
            console.log("📖 Extracting PDF text...");
            const dataBuffer = fs.readFileSync(filePath);
            const pdfData = await pdfParse(dataBuffer);
            text = pdfData.text;
            console.log(`✅ Extracted ${text.length} characters from PDF`);
          } else if (docType.startsWith("text/") || docName.endsWith(".txt")) {
            text = fs.readFileSync(filePath, "utf-8");
          } else {
            // Try as plain text
            text = fs.readFileSync(filePath, "utf-8");
          }

          // Clean up temp file
          fs.unlinkSync(filePath);
        }
        // Handle JSON payload from /api/upload (with filename and content)
        else if (fields.filename && fields.content) {
          console.log("📄 Processing JSON payload from upload API");
          docName = Array.isArray(fields.filename) ? fields.filename[0] : fields.filename;
          text = Array.isArray(fields.content) ? fields.content[0] : fields.content;
          
          // Determine docType from filename
          if (docName.endsWith(".pdf")) {
            docType = "application/pdf";
          } else if (docName.endsWith(".txt")) {
            docType = "text/plain";
          } else if (docName.endsWith(".md")) {
            docType = "text/markdown";
          } else {
            docType = "text/plain";
          }
          
          console.log(`📄 File: ${docName}, Content length: ${text.length} chars`);
        }
        // Handle raw text input
        else if (fields.text) {
          text = Array.isArray(fields.text) ? fields.text[0] : fields.text;
          docName = fields.name
            ? Array.isArray(fields.name)
              ? fields.name[0]
              : fields.name
            : "Text Input";
          docType = "text/plain";
        }
        // Handle URL
        else if (fields.url) {
          const url = Array.isArray(fields.url) ? fields.url[0] : fields.url;
          // TODO: Implement URL fetching and parsing
          console.error("❌ URL ingestion not implemented");
          res.status(400).json({ error: "URL ingestion not yet implemented" });
          return resolve();
        } else {
          console.error("❌ No file, text, or URL provided");
          res.status(400).json({ error: "No file, text, or URL provided" });
          return resolve();
        }

        if (!text || text.trim().length === 0) {
          console.error("❌ No text extracted from file");
          res.status(400).json({ error: "No text content extracted" });
          return resolve();
        }

        console.log(`📊 Text extracted: ${text.length} characters`);
        console.log("🔢 Generating embeddings and uploading to Pinecone...");

        // Ingest document
        const result = await ingestDocument(text, {
          docId,
          source: docName,
          type: docType,
          uploadedAt: new Date().toISOString(),
        });

        console.log(`✅ Pinecone upload complete: ${result.chunksCreated} chunks`);
        console.log("💾 Saving to database...");

        // Save to database
        addDocument(docName, docType, text.length, {
          chunks: result.chunksCreated,
          characters: text.length,
        });

        console.log("✅ Document ingestion complete!");
        console.log("✅ Document ingestion complete!");

        res.status(200).json({
          success: true,
          docId,
          name: docName,
          chunks: result.chunksCreated,
          characters: text.length,
          message: "Document ingested successfully",
        });
        resolve();
      } catch (error) {
        console.error("❌ Ingest processing error:", error);
        console.error("Error stack:", error.stack);
        res.status(500).json({
          error: "Failed to process document",
          details: error.message,
        });
        resolve();
      }
    });
  } catch (error) {
    console.error("❌ Ingest API error:", error);
    res.status(500).json({
      error: "Failed to ingest document",
      details: error.message,
    });
    resolve();
  }
  });
}
