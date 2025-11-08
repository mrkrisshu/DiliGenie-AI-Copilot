/**
 * KnowledgeSpace Component
 * My Knowledge Space - manage uploaded documents and notes
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { FileText, Trash2, Pin, PinOff, Upload, Search, Filter } from "lucide-react";

export default function KnowledgeSpace() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPinned, setFilterPinned] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents");
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this document? This action cannot be undone.")) return;

    try {
      const response = await fetch(`/api/documents?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert("Failed to delete document. Please try again.");
    }
  };

  const handleTogglePin = async (id) => {
    try {
      const response = await fetch("/api/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "togglePin" }),
      });

      if (response.ok) {
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === id ? { ...doc, pinned: !doc.pinned } : doc
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle pin:", error);
    }
  };

  const getFileIcon = (type) => {
    if (type?.includes("pdf")) return "📄";
    if (type?.includes("text")) return "📝";
    if (type?.includes("doc")) return "📃";
    return "📁";
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Filter documents based on search and pin filter
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPin = !filterPinned || doc.pinned;
    return matchesSearch && matchesPin;
  });

  // Sort: pinned first, then by upload date
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.uploaded_at) - new Date(a.uploaded_at);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-400">Loading your knowledge space...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Knowledge Base
          </h1>
          <p className="text-gray-400">
            Manage and organize your documents for intelligent retrieval
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-col sm:flex-row gap-4"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-gray-500"
            />
          </div>
          <button
            onClick={() => setFilterPinned(!filterPinned)}
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
              filterPinned
                ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/50"
                : "bg-zinc-900 text-gray-300 border border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <Filter className="w-5 h-5" />
            {filterPinned ? "Showing Pinned" : "Show All"}
          </button>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <p className="text-sm text-gray-400">Total Documents</p>
            <p className="text-2xl font-bold text-white">{documents.length}</p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <p className="text-sm text-gray-400">Pinned</p>
            <p className="text-2xl font-bold text-cyan-400">{documents.filter(d => d.pinned).length}</p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <p className="text-sm text-gray-400">Total Size</p>
            <p className="text-2xl font-bold text-blue-400">
              {formatFileSize(documents.reduce((acc, doc) => acc + (doc.size || 0), 0))}
            </p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <p className="text-sm text-gray-400">Total Chunks</p>
            <p className="text-2xl font-bold text-green-400">
              {documents.reduce((acc, doc) => acc + (doc.metadata?.chunks || 0), 0)}
            </p>
          </div>
        </motion.div>

        {/* Documents Grid */}
        {sortedDocuments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-20"
          >
            <div className="text-8xl mb-6">📚</div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              {searchTerm || filterPinned ? "No documents found" : "No documents yet"}
            </h3>
            <p className="text-gray-400 mb-8">
              {searchTerm || filterPinned
                ? "Try adjusting your search or filters"
                : "Upload your first document to start building your knowledge base"}
            </p>
            {!searchTerm && !filterPinned && (
              <button
                onClick={() => document.querySelector('input[type="file"]')?.click()}
                className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-medium hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Upload Document
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {sortedDocuments.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="bg-zinc-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20 transition-all border border-zinc-800 hover:border-cyan-500/50 relative overflow-hidden group"
                >
                  {/* Pinned Indicator */}
                  {doc.pinned && (
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-cyan-500/20 to-transparent"></div>
                  )}

                  {/* File Icon */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-900/50 to-blue-900/50 rounded-xl flex items-center justify-center text-3xl border border-cyan-500/20">
                      {getFileIcon(doc.type)}
                    </div>
                    {doc.pinned && (
                      <Pin className="w-5 h-5 text-cyan-400 fill-cyan-400" />
                    )}
                  </div>

                  {/* File Name */}
                  <h3
                    className="font-semibold text-lg mb-3 truncate text-white"
                    title={doc.name}
                  >
                    {doc.name}
                  </h3>

                  {/* Metadata */}
                  <div className="space-y-2 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Size:</span>
                      <span>{formatFileSize(doc.size)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Uploaded:</span>
                      <span>{format(new Date(doc.uploaded_at), "MMM d, yyyy")}</span>
                    </div>
                    {doc.metadata?.chunks && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Chunks:</span>
                        <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded-lg text-xs font-semibold border border-green-500/20">
                          {doc.metadata.chunks}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-zinc-800">
                    <button
                      onClick={() => handleTogglePin(doc.id)}
                      className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        doc.pinned
                          ? "bg-cyan-900/30 text-cyan-400 hover:bg-cyan-900/50 border border-cyan-500/30"
                          : "bg-zinc-800 text-gray-300 hover:bg-zinc-700 border border-zinc-700"
                      }`}
                    >
                      {doc.pinned ? (
                        <>
                          <PinOff className="w-4 h-4" />
                          Unpin
                        </>
                      ) : (
                        <>
                          <Pin className="w-4 h-4" />
                          Pin
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="px-4 py-2.5 bg-red-900/20 text-red-400 rounded-xl text-sm font-medium hover:bg-red-900/40 transition-all flex items-center justify-center gap-2 border border-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
