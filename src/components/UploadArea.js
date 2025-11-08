/**
 * UploadArea Component
 * Drag & drop file upload with progress
 */

import { useState, useCallback } from "react";
import { motion } from "framer-motion";

export default function UploadArea({ onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await uploadFile(files[0]);
    }
  }, []);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const uploadFile = async (file) => {
    setIsUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
        onUploadComplete?.(data);
      }, 500);
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Upload failed: ${error.message}`);
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="w-full">
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          borderColor: isDragging ? "#00D9FF" : "#e5e7eb",
          backgroundColor: isDragging
            ? "rgba(0, 217, 255, 0.05)"
            : "transparent",
        }}
        className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all ${
          isDragging
            ? "border-jarvis-primary"
            : "border-gray-300 dark:border-gray-700"
        }`}
      >
        {isUploading ? (
          <div className="space-y-4">
            <div className="text-5xl">📤</div>
            <div className="text-lg font-semibold">Uploading...</div>
            <div className="text-sm text-gray-500">File upload is fast! Indexing happens in background.</div>

            {/* Progress Bar */}
            <div className="w-full max-w-md mx-auto h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-jarvis-primary to-jarvis-secondary"
              />
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              {progress}% complete
            </div>
          </div>
        ) : (
          <>
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold mb-2">
              {isDragging ? "Drop your file here" : "Upload Document"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Drag & drop a PDF or text file, or click to browse
            </p>

            <label className="inline-block px-8 py-3 bg-gradient-to-r from-jarvis-primary to-jarvis-secondary text-white rounded-full cursor-pointer hover:shadow-lg transition-all">
              Choose File
              <input
                type="file"
                className="hidden"
                accept=".pdf,.txt,.doc,.docx"
                onChange={handleFileSelect}
              />
            </label>

            <div className="mt-4 text-sm text-gray-500">
              Supported: PDF, TXT, DOC (max 10MB)
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
