/**
 * GET /api/documents
 * Manage uploaded documents
 */

const {
  getAllDocuments,
  deleteDocument,
  toggleDocumentPin,
} = require("../../lib/database");

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const documents = getAllDocuments();

      return res.status(200).json({ documents });
    } catch (error) {
      console.error("Get documents error:", error);
      return res.status(500).json({ error: "Failed to retrieve documents" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: "Document ID required" });
      }

      deleteDocument(id);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Delete document error:", error);
      return res.status(500).json({ error: "Failed to delete document" });
    }
  }

  if (req.method === "PATCH") {
    try {
      const { id, action } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Document ID required" });
      }

      if (action === "togglePin") {
        toggleDocumentPin(id);
        return res.status(200).json({ success: true });
      }

      return res.status(400).json({ error: "Invalid action" });
    } catch (error) {
      console.error("Update document error:", error);
      return res.status(500).json({ error: "Failed to update document" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
