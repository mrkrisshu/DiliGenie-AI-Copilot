/**
 * Simple Voice Chat - Ultra Reliable, Zero Cost
 * Uses OpenRouter (your existing setup) + Web Speech API (free)
 * No complex logic, just works!
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX, X, Loader } from "lucide-react";
import { Component as AILoader } from "@/components/ui/ai-loader";

export default function SimpleVoiceChat({ onClose }) {
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false); // New state for listening
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [conversationId, setConversationId] = useState(null);

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const isActiveRef = useRef(false); // Track active state in ref for closures
  const isProcessingRef = useRef(false); // Track processing state
  const isSpeakingRef = useRef(false); // Track speaking state
  const errorCountRef = useRef(0); // Track consecutive errors
  const lastErrorTimeRef = useRef(0); // Track last error time

  // Initialize on mount
  useEffect(() => {
    // Setup speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // Keep listening continuously
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = async (event) => {
        // Get the latest result
        const lastResultIndex = event.results.length - 1;
        const text = event.results[lastResultIndex][0].transcript;
        
        console.log("👤 You said:", text);
        setTranscript(text);
        setIsListening(false); // User finished speaking
        
        // Stop recognition while processing
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log("Stop during processing:", e.message);
        }
        
        // Process the question
        await handleQuestion(text);
      };

      recognitionRef.current.onerror = (event) => {
        console.log("⚠️ Recognition error:", event.error);
        
        // Track error rate
        const now = Date.now();
        if (now - lastErrorTimeRef.current < 3000) {
          errorCountRef.current++;
        } else {
          errorCountRef.current = 1;
        }
        lastErrorTimeRef.current = now;
        
        // If too many errors in short time, stop trying
        if (errorCountRef.current > 5) {
          console.log("🛑 Too many errors, stopping recognition");
          setError("Voice recognition unavailable. Please check your microphone and try again.");
          setIsActive(false);
          isActiveRef.current = false;
          errorCountRef.current = 0;
          return;
        }
        
        // Ignore 'aborted' errors (normal when we stop manually)
        if (event.error === 'aborted') {
          return;
        }
        
        if (event.error === 'no-speech') {
          console.log("No speech detected, will auto-restart...");
          setError("");
        } else if (event.error === 'network') {
          console.log("Network error - will retry...");
          setError("Connection issue - retrying...");
        } else {
          setError(`Error: ${event.error}`);
        }
      };

      recognitionRef.current.onend = () => {
        console.log("🔴 Recognition ended");
        setIsListening(false); // Stop listening indicator
        
        // Auto-restart if still active and not processing/speaking (use refs for current values)
        if (isActiveRef.current && !isProcessingRef.current && !isSpeakingRef.current) {
          console.log("🔄 Auto-restarting recognition (no activity detected)...");
          
          // Add longer delay if we've had recent errors
          const delay = errorCountRef.current > 0 ? 2000 : 500;
          
          setTimeout(() => {
            if (isActiveRef.current && recognitionRef.current && !isProcessingRef.current && !isSpeakingRef.current) {
              try {
                recognitionRef.current.start();
                setIsListening(true); // Start listening indicator
                console.log("✅ Recognition restarted!");
                // Reset error count on successful restart
                if (errorCountRef.current > 0) {
                  errorCountRef.current = Math.max(0, errorCountRef.current - 1);
                }
              } catch (e) {
                if (e.message.includes('already started')) {
                  console.log("Recognition already running");
                } else {
                  console.log("Restart error:", e.message);
                  errorCountRef.current++;
                }
              }
            }
          }, delay);
        }
      };
    }

    // Setup speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      // Load voices
      const loadVoices = () => {
        const voices = synthRef.current.getVoices();
        console.log(`Loaded ${voices.length} voices`);
      };
      
      if (synthRef.current.getVoices().length > 0) {
        loadVoices();
      } else {
        synthRef.current.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [isActive, isProcessing]);

  // Auto-start listening when modal opens
  useEffect(() => {
    const timer = setTimeout(() => {
      if (recognitionRef.current && !isActive) {
        startVoiceChat();
      }
    }, 500); // Small delay to ensure everything is initialized

    return () => clearTimeout(timer);
  }, []); // Run only once on mount

  // Handle user question
  const handleQuestion = async (question) => {
    setIsProcessing(true);
    isProcessingRef.current = true; // Update ref
    setError("");

    try {
      // Call your existing chat API
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          conversationId: conversationId,
          includeContext: true, // Use RAG context
        }),
      });

      if (!res.ok) throw new Error('API request failed');

      const data = await res.json();
      const answer = data.answer || data.response || "I didn't understand that.";
      
      console.log("AI response:", answer);
      setResponse(answer);
      setConversationId(data.conversationId);

      // Speak the response
      speak(answer);
      
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to get response. Please try again.");
      speak("Sorry, I encountered an error. Please try again.");
    } finally {
      setIsProcessing(false);
      isProcessingRef.current = false; // Update ref
    }
  };

  // Speak text using browser TTS
  const speak = (text) => {
    if (!synthRef.current) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    // Wait a bit then speak
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Get female voice
      const voices = synthRef.current.getVoices();
      const femaleVoice = voices.find(v => v.name.includes('Zira')) 
        || voices.find(v => v.name.includes('Female'))
        || voices.find(v => v.lang === 'en-US')
        || voices[0];
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        isSpeakingRef.current = true; // Update ref
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        isSpeakingRef.current = false; // Update ref
        
        // Auto-restart listening after speaking (use ref to get current state)
        console.log("🔄 Speech ended. isActiveRef.current:", isActiveRef.current);
        if (isActiveRef.current && recognitionRef.current) {
          console.log("🔄 Restarting listening after speech...");
          setTimeout(() => {
            try {
              recognitionRef.current.start();
              setIsListening(true); // Start listening indicator
              console.log("✅ Listening again!");
            } catch (e) {
              console.log("Restart note:", e.message);
            }
          }, 800); // Wait a bit for user to think
        } else {
          console.log("❌ Not restarting - isActive is false");
        }
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        isSpeakingRef.current = false; // Update ref
      };

      synthRef.current.speak(utterance);
    }, 100);
  };

  // Start voice chat
  const startVoiceChat = () => {
    setIsActive(true);
    isActiveRef.current = true; // Update ref
    setError("");
    
    try {
      recognitionRef.current.start();
      setIsListening(true); // Start listening indicator
      console.log("✅ Voice chat started - isActiveRef set to true");
    } catch (e) {
      setError("Failed to start. Please allow microphone access.");
      console.error("Start error:", e);
    }
  };

  // Stop voice chat
  const stopVoiceChat = () => {
    setIsActive(false);
    isActiveRef.current = false; // Update ref
    setIsListening(false); // Stop listening indicator
    console.log("🛑 Voice chat stopped - isActiveRef set to false");
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    
    setIsSpeaking(false);
    isSpeakingRef.current = false; // Update ref
    setIsProcessing(false);
    isProcessingRef.current = false; // Update ref
    console.log("Voice chat stopped");
  };

  // Test audio
  const testAudio = () => {
    speak("Hi! I'm DiliGenie. Your voice assistant is working perfectly!");
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
        className="relative w-full max-w-2xl bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Close Button Only */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 pt-16 space-y-6">
          {/* AI Loader - Show when user is speaking or assistant is responding */}
          {(isListening || isSpeaking) && (
            <div className="relative h-64 flex items-center justify-center">
              <AILoader 
                size={200} 
                text={isListening ? "Listening..." : "Speaking..."} 
                embedded={true}
              />
            </div>
          )}

          {/* Status - Only show when not listening/speaking */}
          {!isListening && !isSpeaking && (
            <div className="text-center">
              {isActive ? (
                <div className="space-y-2">
                  {isProcessing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="inline-block"
                      >
                        <Loader className="w-8 h-8 text-cyan-400" />
                      </motion.div>
                      <p className="text-sm font-medium text-gray-300">Thinking...</p>
                    </>
                  ) : (
                    <>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="inline-block"
                      >
                        <Mic className="w-8 h-8 text-orange-400" />
                      </motion.div>
                      <p className="text-sm font-medium text-gray-300">Ready to listen</p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-green-400"
                      >
                        ✓ Ask me anything
                      </motion.p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="inline-block"
                  >
                    <Loader className="w-8 h-8 text-cyan-400" />
                  </motion.div>
                  <p className="text-sm text-gray-400">Starting voice chat...</p>
                </div>
              )}
            </div>
          )}

          {/* Transcript & Response */}
          <div className="space-y-3">
            {transcript && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4"
              >
                <p className="text-xs text-blue-400 mb-1 font-medium">You:</p>
                <p className="text-white text-sm">{transcript}</p>
              </motion.div>
            )}

            {response && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-cyan-900/20 border border-cyan-500/30 rounded-xl p-4"
              >
                <p className="text-xs text-cyan-400 mb-1 font-medium">DiliGenie:</p>
                <p className="text-white text-sm">{response}</p>
              </motion.div>
            )}
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-900/20 border border-red-500/30 rounded-xl p-3"
            >
              <p className="text-sm text-red-400">{error}</p>
            </motion.div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            {/* Stop Button - Only show when active */}
            {isActive && (
              <button
                onClick={stopVoiceChat}
                className="px-8 py-3 rounded-xl font-medium bg-red-500 hover:bg-red-600 text-white transition-all flex items-center gap-2 shadow-lg"
              >
                <MicOff className="w-5 h-5" />
                Stop
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
