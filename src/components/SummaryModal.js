/**
 * SummaryModal Component
 * Show conversation summary with download option
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";

export default function SummaryModal({ isOpen, onClose, conversationId }) {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSummary = async () => {
    if (!conversationId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/summary?conversationId=${conversationId}`
      );
      const data = await response.json();

      if (response.ok) {
        setSummary(data);
      } else {
        alert("Failed to generate summary");
      }
    } catch (error) {
      console.error("Summary error:", error);
      alert("Failed to generate summary");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!summary) return;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text("Conversation Summary", 20, 20);

    // Meta
    doc.setFontSize(10);
    doc.text(`Messages: ${summary.messageCount}`, 20, 30);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 35);

    // Summary
    doc.setFontSize(12);
    const summaryLines = doc.splitTextToSize(summary.summary, 170);
    doc.text(summaryLines, 20, 50);

    // Save
    doc.save(`conversation-summary-${conversationId}.pdf`);
  };

  const downloadText = () => {
    if (!summary) return;

    const text = `Conversation Summary\n\nMessages: ${
      summary.messageCount
    }\nGenerated: ${new Date().toLocaleString()}\n\n${
      summary.summary
    }\n\n--- Full Transcript ---\n\n${summary.transcript}`;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversation-${conversationId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b dark:border-gray-700">
            <h2 className="text-2xl font-bold">Conversation Summary</h2>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {!summary ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📝</div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Generate an AI-powered summary of this conversation
                </p>
                <button
                  onClick={fetchSummary}
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-jarvis-primary to-jarvis-secondary text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isLoading ? "Generating..." : "Generate Summary"}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <div className="whitespace-pre-wrap">{summary.summary}</div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={downloadPDF}
                    className="flex-1 px-6 py-3 bg-jarvis-primary text-white rounded-lg hover:bg-jarvis-secondary transition-colors"
                  >
                    📄 Download PDF
                  </button>
                  <button
                    onClick={downloadText}
                    className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    📝 Download Text
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t dark:border-gray-700">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
