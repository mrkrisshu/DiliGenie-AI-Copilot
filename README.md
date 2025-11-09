# DiliGenie — AI Assistant

[![Watch Demo](https://img.shields.io/badge/▶️-Watch%20Demo-red?style=for-the-badge)](https://www.youtube.com/watch?v=JaczvHQWy_k)

A production-ready personal AI assistant with chat, voice, document Q&A (RAG), and a beautiful UI. This README has been cleaned to remove duplicates and organize setup, usage, and references.

## Quick Links
- Live demo video: https://www.youtube.com/watch?v=JaczvHQWy_k
- Local app: http://localhost:3000 (or 3001 depending on config)
- Deployed (Live): 
https://dili-genie-ai-copilot.vercel.app/
## Features

-   Live Converstions
- 💬 AI Chat with context memory
- 🎤 Voice chat (Web Speech API)
- 📄 Document upload + RAG (PDF/TXT/MD)
- 🔍 Pinecone vector search for document retrieval
- 📊 Dashboard: weather, news, quick stats
- ✨ Animated UI with Framer Motion & Tailwind

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS, Framer Motion  
- Backend: Next.js API Routes, Node.js  
- AI/ML: OpenRouter (LLM), Pinecone (vectors), sentence-transformers (embeddings)  
- Storage: Pinecone (vectors), SQLite (conversations)  
- DevOps & Testing: Vercel, GitHub Actions, Jest

## Prerequisites

- Node.js 18+ and npm
- Python 3.8+ (for ingestion scripts)
- OpenRouter API key (https://openrouter.ai/keys)
- Pinecone API key (https://app.pinecone.io/)

## Quick Start

1. Clone and install
```bash
git clone https://github.com/mrkrisshu/DiliGenie-AI-Copilot.git
cd DiliGenie-AI-Copilot
npm install
```

2. Create and configure `.env` (copy from `.env.example`)
```bash
cp .env.example .env
```
Example `.env` entries:
```env
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=google/gemini-flash-1.5
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
PINECONE_INDEX_NAME=diligenie-knowledge
MAX_TOKENS=256
TEMPERATURE=0.3
TOP_K_RESULTS=3
```

3. (Optional) Set up Python env & ingest sample docs
```bash
cd scripts
pip install -r requirements.txt
python ingest.py --jsonl ../docs/sample_docs.jsonl
```

4. Run dev server
```bash
npm run dev
```
Open http://localhost:3000 (or http://localhost:3001 depending on port config).

## API Endpoints (overview)

- POST `/api/chat` — Chat with RAG context
- GET `/api/stream` — SSE streaming chat
- POST `/api/ingest` — Upload and ingest documents
- GET `/api/documents` — List documents
- GET `/api/history` — Conversation history
- GET `/api/summary` — Conversation summary

Refer to the in-project API docs or the source files under `pages/api/` for full request/response shapes.

## Configuration & Cost Tips

- Use a conservative model and token limits for demos:
```env
OPENROUTER_MODEL=google/gemini-flash-1.5
MAX_TOKENS=256
TEMPERATURE=0.3
ENABLE_CACHE=1
CACHE_TTL_SECONDS=300
TOP_K_RESULTS=3
CONVERSATION_HISTORY_LENGTH=5
```
- OpenRouter often provides small credits for testing; monitor token usage in logs.

## Project Structure (trimmed)
```
.
├── pages/             # Next.js pages & API routes
├── src/components/    # React components
├── lib/               # API adapters (openrouter, pinecone, etc.)
├── scripts/           # Ingestion scripts (Python)
├── docs/              # Sample documents
├── .env.example
├── package.json
└── README.md
```

## Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch
```

Tests include unit tests for adapters and an integration smoke test for the RAG flow (mocked).

## Deployment

- Deploy to Vercel (recommended). Add environment variables in the Vercel dashboard, then:
```bash
vercel --prod
```
- CI is configured via `.github/workflows/ci.yml` to run tests and builds.

## Troubleshooting (common)

- OPENROUTER_API_KEY not configured → verify `.env`
- Pinecone index not found → run ingestion script to create index and upload embeddings
- Voice input not working → check browser microphone permissions
- PDF upload fails → ensure file size < 10MB and `formidable` is installed on the server

## Author

**Krishna Bantola**

- GitHub: https://github.com/krishnabantola
- LinkedIn: https://linkedin.com/in/krishnabantola

Made with ❤️ by Krishna Bantola

## License

MIT — see the LICENSE file for details.

## Acknowledgments

- OpenRouter, Pinecone, Next.js, Tailwind CSS, Framer Motion, sentence-transformers
