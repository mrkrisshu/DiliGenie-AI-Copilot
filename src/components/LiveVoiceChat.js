/**
 * LiveVoiceChat Component
 * Continuous voice interaction like Alexa/Jarvis
 * Completely hands-free - just speak and DiliGenie responds
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX, X } from "lucide-react";

export default function LiveVoiceChat({ onClose }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [status, setStatus] = useState("Ready to talk...");
  const [useContext, setUseContext] = useState(true);

  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);
  const isProcessingRef = useRef(false);
  const utteranceRef = useRef(null); // Store current utterance
  const voiceRef = useRef(null); // Store selected voice

  // Initialize Speech Recognition and Synthesis
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initialize Speech Recognition (Voice Input)
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1];
        const text = lastResult[0].transcript;
        
        console.log("👤 User said:", text);
        setTranscript(text);
        
        // Check if user wants to stop the entire conversation
        if (text.toLowerCase().includes("stop talking") || 
            text.toLowerCase().includes("goodbye") ||
            text.toLowerCase().includes("bye bye")) {
          stopListening();
          speak("Goodbye! Call me anytime.");
          setTimeout(() => onClose(), 3000);
          return;
        }

        // Don't stop recognition - just process the question
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          handleVoiceQuestion(text);
        }
      };

      recognitionRef.current.onerror = (event) => {
        // Ignore all errors, just keep going
        console.log("Recognition event:", event.error);
      };

      recognitionRef.current.onend = () => {
        // Always restart unless user explicitly stopped
        if (isListening) {
          setTimeout(() => {
            try {
              if (recognitionRef.current && isListening) {
                recognitionRef.current.start();
              }
            } catch (e) {
              console.log("Recognition restart error:", e);
            }
          }, 500);
        }
      };
    }

    // Initialize Speech Synthesis (Voice Output)
    if ("speechSynthesis" in window) {
      synthesisRef.current = window.speechSynthesis;
      
      // Load voices (needed for some browsers)
      const loadVoices = () => {
        const voices = synthesisRef.current.getVoices();
        console.log("=== VOICES LOADED ===");
        console.log("Available voices:", voices.length);
        voices.forEach((voice, i) => {
          console.log(`${i + 1}. ${voice.name} (${voice.lang}) ${voice.localService ? '[Local]' : '[Remote]'}`);
        });
        
        // Test if speech synthesis works
        if (voices.length > 0) {
          console.log("✅ Speech synthesis is available");
        } else {
          console.warn("⚠️ No voices found - speech may not work");
        }
      };
      
      // Try to load voices immediately
      const voices = synthesisRef.current.getVoices();
      if (voices.length > 0) {
        loadVoices();
      } else {
        // Wait for voices to load
        synthesisRef.current.onvoiceschanged = () => {
          loadVoices();
          synthesisRef.current.onvoiceschanged = null; // Remove listener after first load
        };
        
        // Also try after a delay (some browsers need this)
        setTimeout(loadVoices, 500);
      }
    } else {
      console.error("❌ Speech synthesis NOT supported in this browser");
    }

    return () => {
      stopListening();
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, [isListening, isSpeaking]);

  const startListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported. Please use Chrome, Edge, or Safari.");
      return;
    }

    // Check if speech synthesis is available
    if (!synthesisRef.current) {
      alert("Text-to-speech not supported in this browser.");
      return;
    }

    // Prime the audio system with a test utterance
    const primer = new SpeechSynthesisUtterance("");
    synthesisRef.current.speak(primer);
    
    setIsListening(true);
    setStatus("Listening...");
    
    try {
      recognitionRef.current.start();
      console.log("✅ Voice recognition started");
    } catch (e) {
      console.log("Recognition start error:", e);
      setStatus("Error starting. Click again.");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    setStatus("Stopped");
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log("Recognition stop error:", e);
      }
    }
  };

  const speak = (text) => {
    if (!synthesisRef.current) {
      console.error("❌ Speech synthesis not available");
      setResponse(text);
      return;
    }

    console.log("🔊 Speaking:", text.substring(0, 50) + "...");
    
    // Cancel any existing speech
    synthesisRef.current.cancel();
    
    // Small delay to ensure cancel completes
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      
      // Get or use cached voice
      if (!voiceRef.current) {
        const voices = synthesisRef.current.getVoices();
        voiceRef.current = voices.find(voice => voice.name.includes('Zira'))
          || voices.find(voice => voice.name.toLowerCase().includes('female'))
          || voices.find(voice => voice.lang.startsWith('en-US'))
          || voices[0];
        console.log("Selected voice:", voiceRef.current?.name);
      }
      
      if (voiceRef.current) {
        utterance.voice = voiceRef.current;
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = "en-US";

      utterance.onstart = () => {
        console.log("✅ AUDIO PLAYING");
        setIsSpeaking(true);
        setStatus("Speaking...");
      };

      utterance.onend = () => {
        console.log("✅ Audio ended");
        setIsSpeaking(false);
        isProcessingRef.current = false;
        setStatus("Listening...");
      };

      utterance.onerror = (event) => {
        console.log("Speech error (ignoring):", event.error);
        setIsSpeaking(false);
        isProcessingRef.current = false;
      };

      // Actually speak
      synthesisRef.current.speak(utterance);
      setResponse(text);
      
      // Debug check
      setTimeout(() => {
        console.log("Status check - speaking:", synthesisRef.current.speaking, "pending:", synthesisRef.current.pending);
      }, 100);
    }, 100);
  };

  const handleVoiceQuestion = async (question) => {
    setStatus("Thinking...");
    
    try {
      console.log("Sending question to API:", question);
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          conversationId: conversationId,
          includeContext: useContext,
        }),
      });

      console.log("API Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("API Response data:", data);
      
      // Update conversation ID for context
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      // API returns 'answer' not 'response'
      const aiResponse = data.answer || data.response;
      
      // Speak the response
      if (aiResponse) {
        speak(aiResponse);
      } else {
        console.error("No answer in response:", data);
        throw new Error("No answer received from API");
      }
      
    } catch (error) {
      console.error("Error getting response:", error);
      const errorMessage = "Sorry, I encountered an error. " + (error.message || "Please try again.");
      speak(errorMessage);
      setStatus("Ready - Try again");
      setTimeout(() => {
        setStatus("Listening...");
      }, 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopListening();
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {/* Animated Flame Logo */}
            <motion.svg
              width="40"
              height="40"
              viewBox="0 0 100 100"
              className="text-orange-500"
            >
              <motion.path
                d="M50 10 Q 60 30, 50 50 Q 40 30, 50 10 Z"
                fill="currentColor"
                animate={{
                  d: [
                    "M50 10 Q 60 30, 50 50 Q 40 30, 50 10 Z",
                    "M50 15 Q 65 35, 50 55 Q 35 35, 50 15 Z",
                    "M50 10 Q 60 30, 50 50 Q 40 30, 50 10 Z",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.path
                d="M50 30 Q 55 40, 50 60 Q 45 40, 50 30 Z"
                fill="#ff6b35"
                animate={{
                  d: [
                    "M50 30 Q 55 40, 50 60 Q 45 40, 50 30 Z",
                    "M50 35 Q 58 45, 50 65 Q 42 45, 50 35 Z",
                    "M50 30 Q 55 40, 50 60 Q 45 40, 50 30 Z",
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.path
                d="M50 45 Q 52 50, 50 70 Q 48 50, 50 45 Z"
                fill="#ffaa00"
                animate={{
                  d: [
                    "M50 45 Q 52 50, 50 70 Q 48 50, 50 45 Z",
                    "M50 48 Q 54 53, 50 73 Q 46 53, 50 48 Z",
                    "M50 45 Q 52 50, 50 70 Q 48 50, 50 45 Z",
                  ],
                }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.svg>
            <div>
              <h2 className="text-2xl font-bold text-white">DiliGenie Live</h2>
              <p className="text-sm text-gray-400">Hands-free voice assistant</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopListening();
              onClose();
            }}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main Voice Indicator */}
        <div className="flex flex-col items-center justify-center py-12 mb-8">
          <motion.div
            animate={
              isListening
                ? {
                    scale: [1, 1.2, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(59, 130, 246, 0.5)",
                      "0 0 0 30px rgba(59, 130, 246, 0)",
                      "0 0 0 0 rgba(59, 130, 246, 0)",
                    ],
                  }
                : {}
            }
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`w-32 h-32 rounded-full flex items-center justify-center ${
              isListening
                ? "bg-gradient-to-br from-blue-500 to-cyan-500"
                : "bg-zinc-800"
            }`}
          >
            {isSpeaking ? (
              <Volume2 className="w-16 h-16 text-white" />
            ) : isListening ? (
              <Mic className="w-16 h-16 text-white" />
            ) : (
              <MicOff className="w-16 h-16 text-gray-400" />
            )}
          </motion.div>

          <p className="mt-6 text-lg font-medium text-white">{status}</p>
        </div>

        {/* Transcript & Response */}
        <div className="space-y-4 mb-6 max-h-48 overflow-y-auto">
          {transcript && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-4"
            >
              <p className="text-xs text-blue-400 mb-1 font-medium">You said:</p>
              <p className="text-white">{transcript}</p>
            </motion.div>
          )}

          {response && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-cyan-900/30 border border-cyan-500/30 rounded-xl p-4"
            >
              <p className="text-xs text-cyan-400 mb-1 font-medium">DiliGenie:</p>
              <p className="text-white">{response}</p>
            </motion.div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useContext"
                checked={useContext}
                onChange={(e) => setUseContext(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="useContext" className="text-sm text-gray-400">
                Use document context
              </label>
            </div>
            
            {/* Test Audio Button */}
            <button
              onClick={() => {
                console.log("🎵 Test Audio clicked");
                speak("Hi! I'm DiliGenie. I can hear you perfectly.");
              }}
              className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-all flex items-center gap-2 border border-orange-400 shadow-lg shadow-orange-500/20"
            >
              <Volume2 className="w-4 h-4" />
              🔊 Test Audio First!
            </button>
          </div>

          <button
            onClick={isListening ? stopListening : startListening}
            className={`px-8 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
              isListening
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5" />
                Stop
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                Start Talking
              </>
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <p className="text-xs text-gray-400 leading-relaxed">
            <span className="text-orange-400 font-bold">⚠️ IMPORTANT:</span> Click <span className="text-orange-400 font-medium">"🔊 Test Audio First!"</span> button and make sure you hear my voice. 
            Then click <span className="text-cyan-400 font-medium">"Start Talking"</span> and speak naturally. 
            Say <span className="text-orange-400 font-medium">"goodbye"</span> to end conversation.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
