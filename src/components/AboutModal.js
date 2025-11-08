/**
 * AboutModal Component
 * Portfolio touch with author info and demo link
 */

import { motion, AnimatePresence } from "framer-motion";

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const authorName = process.env.NEXT_PUBLIC_AUTHOR_NAME || "Krishna Bantola";
  const githubUrl =
    process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/krishnabantola";
  const linkedinUrl =
    process.env.NEXT_PUBLIC_LINKEDIN_URL ||
    "https://linkedin.com/in/krishnabantola";
  const demoVideoUrl = process.env.NEXT_PUBLIC_DEMO_VIDEO_URL;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-jarvis-primary to-jarvis-secondary p-8 text-white">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-6xl mb-4 text-center"
            >
              🤖
            </motion.div>
            <h2 className="text-3xl font-bold text-center mb-2">
              Jarvis AI Assistant
            </h2>
            <p className="text-center opacity-90">
              Your Personal RAG-Powered Assistant
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Demo Video */}
            {demoVideoUrl && (
              <div className="mb-6 rounded-2xl overflow-hidden shadow-lg">
                <iframe
                  width="100%"
                  height="315"
                  src={demoVideoUrl}
                  title="Demo Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full"
                ></iframe>
              </div>
            )}

            {/* Features */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">Features</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: "🎤", label: "Voice Chat" },
                  { icon: "📄", label: "Document RAG" },
                  { icon: "📊", label: "Dashboard" },
                  { icon: "💡", label: "Commands" },
                  { icon: "📝", label: "Summaries" },
                  { icon: "🗂️", label: "Knowledge Space" },
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <span className="text-2xl">{feature.icon}</span>
                    <span className="text-sm font-medium">{feature.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Author */}
            <div className="border-t dark:border-gray-700 pt-6">
              <h3 className="text-xl font-semibold mb-4">Created By</h3>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-jarvis-primary to-jarvis-secondary flex items-center justify-center text-3xl text-white font-bold">
                  {authorName.charAt(0)}
                </div>
                <div>
                  <div className="text-lg font-semibold">{authorName}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Full-Stack Developer
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-3">
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors text-center font-medium"
                >
                  <span className="mr-2">🐙</span>
                  GitHub
                </a>
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
                >
                  <span className="mr-2">💼</span>
                  LinkedIn
                </a>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="border-t dark:border-gray-700 mt-6 pt-6">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                POWERED BY
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Next.js",
                  "OpenRouter",
                  "Pinecone",
                  "Tailwind",
                  "Framer Motion",
                ].map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-jarvis-primary bg-opacity-10 text-jarvis-primary rounded-full text-sm font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-jarvis-primary to-jarvis-secondary text-white rounded-full hover:shadow-lg transition-all font-medium"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
