/**
 * ElevenLabs Conversational AI Voice Chat
 * Real-time voice conversation using ElevenLabs SDK
 * Based on: https://github.com/leonvanzyl/elevenlabs-nextjs-conversational-ai
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX, X, AlertCircle } from "lucide-react";
import { useConversation } from "@11labs/react";

export default function ElevenLabsVoiceChat({ onClose }) {
  const [hasPermission, setHasPermission] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [conversationStarted, setConversationStarted] = useState(false);

  // Initialize ElevenLabs conversation
  const conversation = useConversation({
    onConnect: () => {
      console.log("✅ Connected to ElevenLabs");
      setConversationStarted(true);
      setErrorMessage("");
    },
    onDisconnect: () => {
      console.log("❌ Disconnected from ElevenLabs");
      setConversationStarted(false);
    },
    onMessage: (message) => {
      console.log("📩 Received message:", message);
    },
    onError: (error) => {
      const errorMsg = typeof error === "string" ? error : error.message;
      setErrorMessage(errorMsg);
      console.error("❌ ElevenLabs Error:", error);
    },
  });

  const { status, isSpeaking } = conversation;

  // Request microphone permission on mount
  useEffect(() => {
    const requestMicPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasPermission(true);
        console.log("✅ Microphone permission granted");
      } catch (error) {
        setErrorMessage("Microphone access denied. Please allow microphone in browser settings.");
        console.error("❌ Microphone access error:", error);
      }
    };

    requestMicPermission();
  }, []);

  // Start conversation with DiliGenie
  const handleStartConversation = async () => {
    try {
      // Check if agent ID is configured
      const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
      
      if (!agentId) {
        setErrorMessage(
          "ElevenLabs Agent ID not configured. Please add NEXT_PUBLIC_ELEVENLABS_AGENT_ID to your .env file."
        );
        return;
      }

      console.log("🚀 Starting conversation with agent:", agentId);
      
      const conversationId = await conversation.startSession({
        agentId: agentId,
      });
      
      console.log("✅ Conversation started:", conversationId);
    } catch (error) {
      setErrorMessage("Failed to start conversation. Check console for details.");
      console.error("❌ Error starting conversation:", error);
    }
  };

  // End conversation
  const handleEndConversation = async () => {
    try {
      await conversation.endSession();
      console.log("✅ Conversation ended");
    } catch (error) {
      setErrorMessage("Failed to end conversation");
      console.error("❌ Error ending conversation:", error);
    }
  };

  // Toggle mute/unmute
  const toggleMute = async () => {
    try {
      await conversation.setVolume({ volume: isMuted ? 1 : 0 });
      setIsMuted(!isMuted);
      console.log(isMuted ? "🔊 Unmuted" : "🔇 Muted");
    } catch (error) {
      setErrorMessage("Failed to change volume");
      console.error("❌ Error changing volume:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-2xl bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-gradient-to-r from-blue-900/20 to-cyan-900/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center animate-pulse">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">DiliGenie Live</h2>
              <p className="text-sm text-cyan-400">Powered by ElevenLabs AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Display */}
          <div className="text-center">
            {status === "connected" ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full"
              >
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-400 text-sm font-medium">
                  {isSpeaking ? "AI Speaking..." : "Listening..."}
                </span>
              </motion.div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-full">
                <div className="w-2 h-2 rounded-full bg-gray-500" />
                <span className="text-gray-400 text-sm font-medium">
                  {hasPermission ? "Ready to start" : "Waiting for microphone..."}
                </span>
              </div>
            )}
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-400">{errorMessage}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Permission Warning */}
          {!hasPermission && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl"
            >
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-400">
                Microphone access is required for voice conversation. Please allow microphone access in your browser.
              </p>
            </motion.div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {/* Mute Toggle */}
            {status === "connected" && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={toggleMute}
                className="p-3 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-all"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-gray-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-cyan-400" />
                )}
              </motion.button>
            )}

            {/* Start/Stop Button */}
            {status === "connected" ? (
              <button
                onClick={handleEndConversation}
                className="px-8 py-3 rounded-xl font-medium bg-red-500 hover:bg-red-600 text-white transition-all flex items-center gap-2 shadow-lg shadow-red-500/20"
              >
                <MicOff className="w-5 h-5" />
                End Conversation
              </button>
            ) : (
              <button
                onClick={handleStartConversation}
                disabled={!hasPermission}
                className={`px-8 py-3 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg ${
                  hasPermission
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-blue-500/20"
                    : "bg-zinc-800 text-gray-500 cursor-not-allowed"
                }`}
              >
                <Mic className="w-5 h-5" />
                Start Conversation
              </button>
            )}
          </div>

          {/* Instructions */}
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <p className="text-xs text-gray-400 leading-relaxed">
              <span className="text-cyan-400 font-medium">💡 How it works:</span> Click "Start Conversation" and speak naturally. 
              DiliGenie will respond with human-like voice powered by ElevenLabs AI. 
              Click "End Conversation" when you're done.
            </p>
          </div>

          {/* Setup Instructions (if not configured) */}
          {!process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl space-y-2">
              <p className="text-sm text-blue-400 font-medium">🔧 Setup Required:</p>
              <ol className="text-xs text-blue-300 space-y-1 list-decimal list-inside">
                <li>Create an account at elevenlabs.io</li>
                <li>Create a Conversational AI agent</li>
                <li>Copy your Agent ID</li>
                <li>Add NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your-agent-id to .env file</li>
                <li>Restart the dev server</li>
              </ol>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
