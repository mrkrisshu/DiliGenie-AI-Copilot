/**
 * CommandPalette Component
 * Command mode with shortcuts like /summarize, /translate, etc.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COMMANDS = [
  {
    id: "summarize",
    label: "/summarize",
    description: "Summarize the conversation",
    icon: "📝",
  },
  {
    id: "translate",
    label: "/translate",
    description: "Translate text to another language",
    icon: "🌐",
  },
  { id: "idea", label: "/idea", description: "Brainstorm ideas", icon: "💡" },
  {
    id: "code",
    label: "/code",
    description: "Generate code snippet",
    icon: "💻",
  },
  {
    id: "explain",
    label: "/explain",
    description: "Explain a concept",
    icon: "📚",
  },
  {
    id: "improve",
    label: "/improve",
    description: "Improve writing",
    icon: "✨",
  },
  {
    id: "question",
    label: "/question",
    description: "Ask a question",
    icon: "❓",
  },
  {
    id: "clear",
    label: "/clear",
    description: "Clear conversation",
    icon: "🗑️",
  },
];

export default function CommandPalette({ isOpen, onClose, onExecute }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(0);

  const filteredCommands = COMMANDS.filter(
    (cmd) =>
      cmd.label.includes(search.toLowerCase()) ||
      cmd.description.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelected(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected(
          (prev) =>
            (prev - 1 + filteredCommands.length) % filteredCommands.length
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selected]) {
          handleExecute(filteredCommands[selected]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selected, filteredCommands]);

  const handleExecute = (command) => {
    onExecute(command);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-32"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="p-4 border-b dark:border-gray-700">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelected(0);
              }}
              placeholder="Type a command or search..."
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-jarvis-primary"
              autoFocus
            />
          </div>

          {/* Commands List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length > 0 ? (
              filteredCommands.map((cmd, idx) => (
                <motion.div
                  key={cmd.id}
                  whileHover={{ backgroundColor: "rgba(0, 217, 255, 0.1)" }}
                  className={`p-4 cursor-pointer transition-colors ${
                    selected === idx
                      ? "bg-jarvis-primary bg-opacity-10"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => handleExecute(cmd)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cmd.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-jarvis-primary">
                        {cmd.label}
                      </div>
                      <div className="text-sm opacity-70">
                        {cmd.description}
                      </div>
                    </div>
                    {selected === idx && (
                      <span className="text-xs text-jarvis-primary">
                        ↵ Enter
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No commands found
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-600 dark:text-gray-400 flex items-center justify-between">
            <div>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded">
                ↑
              </kbd>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded ml-1">
                ↓
              </kbd>
              <span className="ml-2">Navigate</span>
            </div>
            <div>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded">
                ↵
              </kbd>
              <span className="ml-2">Execute</span>
            </div>
            <div>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded">
                Esc
              </kbd>
              <span className="ml-2">Close</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
