/**
 * Knowledge Space Page
 * Manage documents and memory
 */

import Head from "next/head";
import Link from "next/link";
import KnowledgeSpace from "../src/components/KnowledgeSpace";
import { motion } from "framer-motion";

export default function KnowledgePage() {
  return (
    <>
      <Head>
        <title>Knowledge Base - DiliGenie AI Assistant</title>
      </Head>

      <div className="min-h-screen bg-black">
        {/* Header - Mobile Optimized */}
        <header className="bg-zinc-950 border-b border-zinc-800 text-white safe-top">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2">
              <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <motion.div
                  className="w-8 h-8 sm:w-10 sm:h-10"
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
                          style={{ stopColor: "#FFD93D", stopOpacity: 1 }}
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
                          style={{ stopColor: "#FFA94D", stopOpacity: 1 }}
                        />
                        <stop
                          offset="100%"
                          style={{ stopColor: "#FFE66D", stopOpacity: 1 }}
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d="M50,10 Q35,30 40,50 Q30,55 35,70 Q40,85 50,110 Q60,85 65,70 Q70,55 60,50 Q65,30 50,10 Z"
                      fill="url(#flameGrad1)"
                      opacity="0.9"
                    >
                      <animate
                        attributeName="d"
                        dur="2s"
                        repeatCount="indefinite"
                        values="M50,10 Q35,30 40,50 Q30,55 35,70 Q40,85 50,110 Q60,85 65,70 Q70,55 60,50 Q65,30 50,10 Z;
                              M50,15 Q38,28 42,48 Q32,58 37,72 Q42,88 50,105 Q58,88 63,72 Q68,58 58,48 Q62,28 50,15 Z;
                              M50,10 Q35,30 40,50 Q30,55 35,70 Q40,85 50,110 Q60,85 65,70 Q70,55 60,50 Q65,30 50,10 Z"
                      />
                    </path>
                    <path
                      d="M50,25 Q42,35 45,50 Q40,58 45,70 Q48,80 50,95 Q52,80 55,70 Q60,58 55,50 Q58,35 50,25 Z"
                      fill="url(#flameGrad2)"
                      opacity="0.8"
                    >
                      <animate
                        attributeName="d"
                        dur="1.5s"
                        repeatCount="indefinite"
                        values="M50,25 Q42,35 45,50 Q40,58 45,70 Q48,80 50,95 Q52,80 55,70 Q60,58 55,50 Q58,35 50,25 Z;
                              M50,28 Q44,33 46,48 Q42,60 46,72 Q48,82 50,92 Q52,82 54,72 Q58,60 54,48 Q56,33 50,28 Z;
                              M50,25 Q42,35 45,50 Q40,58 45,70 Q48,80 50,95 Q52,80 55,70 Q60,58 55,50 Q58,35 50,25 Z"
                      />
                    </path>
                    <ellipse
                      cx="50"
                      cy="95"
                      rx="8"
                      ry="5"
                      fill="#FFE66D"
                      opacity="0.6"
                    >
                      <animate
                        attributeName="ry"
                        dur="1s"
                        repeatCount="indefinite"
                        values="5;7;5"
                      />
                    </ellipse>
                  </svg>
                </motion.div>
                <div className="hidden xs:block">
                  <h1 className="text-base sm:text-lg md:text-xl font-bold leading-tight">
                    DiliGenie AI Assistant
                  </h1>
                  <p className="text-xs text-zinc-400 hidden sm:block">Knowledge Base</p>
                </div>
              </Link>

              <nav className="flex items-center gap-1 sm:gap-2">
                <Link href="/chat">
                  <span className="touch-target px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer">
                    Chat
                  </span>
                </Link>
                <Link href="/dashboard">
                  <span className="touch-target px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer hidden sm:inline-block">
                    Dashboard
                  </span>
                </Link>
                <Link href="/">
                  <span className="touch-target px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer hidden md:inline-block">
                    Home
                  </span>
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Knowledge Space Content */}
        <KnowledgeSpace />
      </div>
    </>
  );
}
