/**
 * API Testing Page
 * Test all API endpoints
 */

import { useState } from "react";
import Head from "next/head";

export default function APITestPage() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const testAPI = async (name, endpoint, options = {}) => {
    setLoading((prev) => ({ ...prev, [name]: true }));
    try {
      const response = await fetch(endpoint, options);
      const data = await response.json();
      setResults((prev) => ({
        ...prev,
        [name]: { success: response.ok, data, status: response.status },
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [name]: { success: false, error: error.message, status: "error" },
      }));
    }
    setLoading((prev) => ({ ...prev, [name]: false }));
  };

  const tests = [
    {
      name: "Chat API (Basic)",
      test: () =>
        testAPI("/api/chat", "/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: "Hello! Are you working?",
            includeContext: false,
          }),
        }),
    },
    {
      name: "Chat API (with RAG)",
      test: () =>
        testAPI("/api/chat", "/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: "What documents do you have?",
            includeContext: true,
          }),
        }),
    },
    {
      name: "Documents API",
      test: () => testAPI("/api/documents", "/api/documents"),
    },
  ];

  return (
    <>
      <Head>
        <title>API Testing - DiliGenie</title>
      </Head>

      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">🧪 API Testing Dashboard</h1>
          <p className="text-zinc-400 mb-8">
            Test your API endpoints to verify everything is configured correctly
          </p>

          {/* Configuration Status */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">📋 Configuration Status</h2>
            <div className="space-y-2">
              <ConfigItem
                label="OpenRouter API Key"
                value={process.env.OPENROUTER_API_KEY}
              />
              <ConfigItem
                label="OpenRouter Model"
                value={process.env.OPENROUTER_MODEL}
              />
              <ConfigItem
                label="Pinecone API Key"
                value={process.env.PINECONE_API_KEY}
              />
              <ConfigItem
                label="Pinecone Index"
                value={process.env.PINECONE_INDEX_NAME}
              />
              <ConfigItem
                label="Streaming Enabled"
                value={process.env.NEXT_PUBLIC_ENABLE_STREAMING}
              />
            </div>
          </div>

          {/* API Tests */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">🎯 API Endpoint Tests</h2>
            {tests.map((test) => (
              <div
                key={test.name}
                className="bg-zinc-950 border border-zinc-800 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{test.name}</h3>
                  <button
                    onClick={test.test}
                    disabled={loading[test.name]}
                    className="px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading[test.name] ? "Testing..." : "Test"}
                  </button>
                </div>

                {results[test.name] && (
                  <div className="mt-4">
                    <div
                      className={`px-4 py-3 rounded-lg border ${
                        results[test.name].success
                          ? "bg-green-500/10 border-green-500/30 text-green-200"
                          : "bg-red-500/10 border-red-500/30 text-red-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">
                          {results[test.name].success
                            ? "✅ Success"
                            : "❌ Failed"}
                        </span>
                        <span className="text-xs opacity-70">
                          Status: {results[test.name].status}
                        </span>
                      </div>
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(
                          results[test.name].data || results[test.name].error,
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Setup Guide Link */}
          <div className="mt-8 bg-violet-500/10 border border-violet-500/30 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-2">📖 Need Help?</h3>
            <p className="text-zinc-300 mb-4">
              Check the API Setup Guide for detailed configuration instructions.
            </p>
            <a
              href="/API-SETUP-GUIDE.md"
              target="_blank"
              className="inline-block px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
            >
              View Setup Guide
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

function ConfigItem({ label, value }) {
  const isSet = value && value !== "undefined" && value !== "";
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-800">
      <span className="text-zinc-400">{label}</span>
      <span
        className={`px-3 py-1 rounded-full text-xs ${
          isSet
            ? "bg-green-500/20 text-green-300"
            : "bg-red-500/20 text-red-300"
        }`}
      >
        {isSet ? "✓ Configured" : "✗ Missing"}
      </span>
    </div>
  );
}

// This runs on the server to check env variables
export async function getServerSideProps() {
  return {
    props: {},
  };
}
