/**
 * ChatInterface Component
 * Main chat UI with voice input, message list, and streaming support
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function ChatInterface({ conversationId, onNewConversation }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [continuousMode, setContinuousMode] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [currentConvId, setCurrentConvId] = useState(conversationId);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  // Initialize Web Speech API
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("Voice input detected:", transcript);
        setInput(transcript);
        if (continuousMode) {
          handleSend(transcript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
        
        if (event.error === 'no-speech') {
          console.log("No speech detected. Try speaking again.");
        } else if (event.error === 'audio-capture') {
          alert("Microphone not found or not working. Please check your microphone.");
        } else if (event.error === 'not-allowed') {
          alert("Microphone permission denied. Please allow microphone access.");
        } else {
          alert("Voice input error: " + event.error);
        }
      };

      recognitionRef.current.onstart = () => {
        console.log("Voice recognition started. Start speaking...");
        setIsRecording(true);
      };

      recognitionRef.current.onend = () => {
        console.log("Voice recognition ended.");
        setIsRecording(false);
        if (continuousMode) {
          // Restart in continuous mode
          setTimeout(() => {
            if (continuousMode && recognitionRef.current) {
              recognitionRef.current.start();
              setIsRecording(true);
            }
          }, 500);
        }
      };
    }
  }, [continuousMode]);

  const handleVoiceInput = async () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        // Request microphone permission first
        await navigator.mediaDevices.getUserMedia({ audio: true });
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Microphone permission error:", error);
        if (error.name === 'NotAllowedError') {
          alert("Microphone access denied. Please allow microphone access in your browser settings.");
        } else if (error.name === 'NotFoundError') {
          alert("No microphone found. Please connect a microphone and try again.");
        } else {
          alert("Could not start voice input: " + error.message);
        }
      }
    }
  };

  const handleSend = async (messageText = null) => {
    const text = messageText || input;
    if (!text.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setStreamingText("");

    try {
      const useStreaming = process.env.NEXT_PUBLIC_ENABLE_STREAMING === "1";

      if (useStreaming) {
        // Streaming mode
        const queryParams = new URLSearchParams({
          message: text,
          conversationId: currentConvId || "",
          includeContext: "true",
        });

        const eventSource = new EventSource(`/api/stream?${queryParams}`);
        let fullResponse = "";

        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);

          if (data.type === "token") {
            fullResponse += data.content;
            setStreamingText(fullResponse);
          } else if (data.type === "done") {
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: fullResponse,
                timestamp: new Date(),
              },
            ]);
            setStreamingText("");
            setIsLoading(false);
            eventSource.close();
          } else if (data.type === "error") {
            console.error("Streaming error:", data.error);
            eventSource.close();
            setIsLoading(false);
          }
        };

        eventSource.onerror = () => {
          eventSource.close();
          setIsLoading(false);
        };
      } else {
        // Non-streaming mode
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            conversationId: currentConvId,
            includeContext: true,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to send message");
        }

        if (!currentConvId) {
          setCurrentConvId(data.conversationId);
          onNewConversation?.(data.conversationId);
        }

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.answer,
            sources: data.sources,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${error.message}`,
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-white text-black"
                    : msg.isError
                    ? "bg-red-500 text-white"
                    : "bg-zinc-900 border border-zinc-800 text-white"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <span className="text-xs opacity-50 mt-2 block">
                  {format(msg.timestamp, "HH:mm")}
                </span>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 text-xs opacity-70">
                    Sources: {msg.sources.map((s) => s.source).join(", ")}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Streaming indicator */}
        {streamingText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-zinc-900 border border-zinc-800 text-white">
              <p className="whitespace-pre-wrap">{streamingText}</p>
              <span className="inline-block w-2 h-4 ml-1 bg-white animate-pulse"></span>
            </div>
          </motion.div>
        )}

        {/* Loading indicator */}
        {isLoading && !streamingText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-800 p-4 bg-black">
        <div className="flex items-center gap-2 mb-3">
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={continuousMode}
              onChange={(e) => setContinuousMode(e.target.checked)}
              className="rounded bg-zinc-900 border-zinc-700"
            />
            Continuous conversation
          </label>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1 rounded-full px-5 py-3 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
            disabled={isLoading}
          />

          <button
            onClick={handleVoiceInput}
            className={`p-3 rounded-full transition-all ${
              isRecording
                ? "bg-red-500 text-white animate-pulse"
                : "bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800"
            }`}
            disabled={isLoading}
          >
            🎤
          </button>

          <button
            onClick={() => handleSend()}
            className="px-6 py-3 bg-white text-black rounded-full hover:bg-zinc-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            disabled={isLoading || !input.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
