/**
 * Chat Page
 * Animated AI Chat Interface
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import Link from "next/link";
import AnimatedChatInterface from "../src/components/AnimatedChatInterface";
import SimpleVoiceChat from "../src/components/SimpleVoiceChat";
import { Mic } from "lucide-react";

export default function ChatPage() {
  const [showLiveChat, setShowLiveChat] = useState(false);
  
  return (
    <>
      <Head>
        <title>DiliGenie AI Assistant</title>
      </Head>

      <div className="h-screen flex flex-col bg-black">
        {/* Header */}
        <header className="bg-zinc-950 border-b border-zinc-800 text-white">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <motion.div
                  className="w-10 h-10"
                  animate={{ rotate: [0, 360] }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 100 120"
                    className="w-full h-full"
                  >
                    <defs>
                      <linearGradient
                        id="flameGrad1"
                        x1="50%"
                        y1="0%"
                        x2="50%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          style={{ stopColor: "#FF6B6B", stopOpacity: 1 }}
                        />
                        <stop
                          offset="100%"
                          style={{ stopColor: "#D63031", stopOpacity: 1 }}
                        />
                      </linearGradient>
                      <linearGradient
                        id="flameGrad2"
                        x1="50%"
                        y1="0%"
                        x2="50%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          style={{ stopColor: "#FF4757", stopOpacity: 1 }}
                        />
                        <stop
                          offset="100%"
                          style={{ stopColor: "#C23030", stopOpacity: 1 }}
                        />
                      </linearGradient>
                      <linearGradient
                        id="flameGrad3"
                        x1="50%"
                        y1="0%"
                        x2="50%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          style={{ stopColor: "#FFE66D", stopOpacity: 1 }}
                        />
                        <stop
                          offset="100%"
                          style={{ stopColor: "#FF8C42", stopOpacity: 1 }}
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d="M50,15 Q40,40 40,60 Q40,80 50,95 Q60,80 60,60 Q60,40 50,15 Z"
                      fill="url(#flameGrad1)"
                      opacity="0.9"
                    />
                    <path
                      d="M50,25 Q45,45 45,62 Q45,75 50,85 Q55,75 55,62 Q55,45 50,25 Z"
                      fill="url(#flameGrad2)"
                      opacity="0.95"
                    />
                    <path
                      d="M50,35 Q47,50 47,65 Q47,72 50,78 Q53,72 53,65 Q53,50 50,35 Z"
                      fill="url(#flameGrad3)"
                    />
                    <circle cx="50" cy="68" r="4" fill="#FFF" opacity="0.9" />
                  </svg>
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold">DiliGenie AI Assistant</h1>
                  <p className="text-sm text-zinc-400">
                    Your Personal AI Companion
                  </p>
                </div>
              </Link>

              <nav className="flex items-center gap-2">
                {/* DiliGenie Live Button */}
                <motion.button
                  onClick={() => setShowLiveChat(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
                >
                  <Mic className="w-4 h-4" />
                  DiliGenie Live
                </motion.button>
                
                <Link href="/dashboard">
                  <span className="px-4 py-2 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer">
                    Dashboard
                  </span>
                </Link>
                <Link href="/knowledge">
                  <span className="px-4 py-2 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer">
                    Knowledge
                  </span>
                </Link>
                <Link href="/">
                  <span className="px-4 py-2 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer">
                    Home
                  </span>
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Animated AI Chat */}
        <div className="flex-1 overflow-hidden">
          <AnimatedChatInterface />
        </div>
        
        {/* Live Voice Chat Modal */}
        <AnimatePresence>
          {showLiveChat && (
            <SimpleVoiceChat onClose={() => setShowLiveChat(false)} />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
