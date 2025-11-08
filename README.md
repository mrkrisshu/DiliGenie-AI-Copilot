# DiliGenie AI Assistant 🤖

[![CI/CD](https://github.com/krishnabantola/jarvis-rag-assistant/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/krishnabantola/jarvis-rag-assistant/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> A production-ready AI personal assistant with chat, voice, and document intelligence powered by OpenRouter and Pinecone. **Now with stunning animated UI and file upload!**

![DiliGenie AI Assistant](https://via.placeholder.com/1200x600/FF4757/FFFFFF?text=DiliGenie+AI+Assistant)

## 🚀 Quick Start Guide

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure APIs (15 minutes)

**✅ `.env` file already created!**

You need these API keys:

#### **Required: OpenRouter API** (for AI chat)

1. Visit https://openrouter.ai/keys
2. Sign up (get $6 free credits!)
3. Create API key
4. Add to `.env`:

```bash
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx
OPENROUTER_MODEL=google/gemini-flash-1.5
```

#### **Optional: Pinecone** (for document search/RAG)

1. Visit https://app.pinecone.io/
2. Create free account
3. Create index: `jarvis-knowledge` with dimension `384`
4. Add to `.env`:

```bash
PINECONE_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
PINECONE_ENVIRONMENT=us-east-1-aws
```

**📖 See `API-SETUP-GUIDE.md` for detailed instructions!**

### 3. Start Dev Server

```bash
npm run dev
```

### 4. Test Your Setup

- **API Test Page:** http://localhost:3001/api-test
- **Chat Interface:** http://localhost:3001/chat
- **Landing Page:** http://localhost:3001

## ✨ NEW Features

### 🎨 Animated Chat Interface

- Beautiful ambient gradient background
- Smooth message animations
- Mouse-following glow effects
- Glass-morphism design
- Typing indicators with animated dots

### 📎 File Upload System

- Upload PDF, TXT, DOC, DOCX, MD files
- Automatic chunking and processing
- Visual attachment display
- Integration with RAG search
- 10MB file size limit

### 🔥 DiliGenie Branding

- Custom flame logo animation
- Red/orange gradient theme
- Rotating logo in header
- Professional footer with social links

## 🎯 Available Pages

| Page          | URL          | Description                     |
| ------------- | ------------ | ------------------------------- |
| **Landing**   | `/`          | Animated red blob hero section  |
| **Chat**      | `/chat`      | AI chat with file upload ✨ NEW |
| **Dashboard** | `/dashboard` | Time, weather, news widgets     |
| **Knowledge** | `/knowledge` | Document management             |
| **API Tests** | `/api-test`  | Test your configuration ✨ NEW  |

## 🔌 API Endpoints

| Endpoint         | Description          | Status   |
| ---------------- | -------------------- | -------- |
| `/api/chat`      | AI chat with RAG     | ✅ Ready |
| `/api/upload`    | File upload          | ✅ NEW   |
| `/api/ingest`    | Document processing  | ✅ Ready |
| `/api/documents` | List documents       | ✅ Ready |
| `/api/summary`   | Conversation summary | ✅ Ready |
| `/api/history`   | Chat history         | ✅ Ready |
| `/api/stream`    | Streaming responses  | ✅ Ready |

## 💰 Cost Breakdown

### With Free Tiers:

- **OpenRouter:** $6 free credit = ~30,000 messages
- **Pinecone:** Free tier = 100K vectors
- **Total Monthly Cost:** $0 for personal use!

## 🧪 Testing

Visit http://localhost:3001/api-test to:

- ✅ Check API configuration
- ✅ Test chat endpoint
- ✅ Test RAG search
- ✅ Verify document upload

## 📚 Documentation

- **`API-SETUP-GUIDE.md`** - Complete API setup instructions
- **`.env.example`** - Environment variables template
- **`.env`** - Your configuration (already created ✅)

## 🎨 Jarvis-Style Landing Page

Experience the future of AI assistants with our **Anomalous Matter Hero** landing page featuring:

- ✨ **3D Interactive Animations** - Mouse-tracking perspective effects
- 🌟 **Floating Particles & Energy Lines** - Dynamic visual effects
- 💫 **Glowing Orbs** - Pulsing background elements
- 🎯 **Integrated Logo** - Jarvis branding in top-left corner
- 🚀 **Call-to-Action Buttons** - Direct access to Chat and Dashboard
- 📱 **Fully Responsive** - Optimized for all devices

**Visit `/` to see it in action!**

## ✨ Features

- 🎤 **Smart Voice + Chat Hybrid** - Voice input with Web Speech API + continuous conversation mode
- 📊 **Dynamic Dashboard** - Real-time widgets for weather, time, news, and quick notes
- 📄 **Upload & Ask** - PDF/document uploader with RAG-powered Q&A and source highlighting
- 🎭 **Animated Avatar** - Personalized assistant avatar reacting to listen/think/speak states
- 📝 **Conversation Summaries** - AI-generated insights with downloadable PDF reports
- 🗂️ **Knowledge Space** - Personal memory with document management (pin/delete)
- ⚡ **Command Palette** - Quick actions via `/commands` for productivity
- 🎨 **Stunning UI/UX** - Dark mode, gradients, smooth Framer Motion animations
- 💰 **Cost-Aware** - Built-in token estimation and budget tracking for demos
- 🚀 **Production-Ready** - Vercel-optimized with serverless API routes

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js Frontend                       │
│  (Chat UI, Dashboard, Voice, Upload, Avatar, Commands)       │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js API Routes                         │
│  /api/chat │ /api/stream │ /api/ingest │ /api/history       │
└──────┬──────────────┬────────────┬────────────┬─────────────┘
       │              │            │            │
       ▼              ▼            ▼            ▼
┌──────────┐   ┌──────────┐  ┌──────────┐  ┌──────────┐
│OpenRouter│   │ Pinecone │  │  SQLite  │  │  Cache   │
│   LLM    │   │  Vector  │  │ Database │  │ (Memory) │
└──────────┘   └──────────┘  └──────────┘  └──────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+ (for ingestion script)
- **OpenRouter API Key** ([Get one here](https://openrouter.ai/keys))
- **Pinecone API Key** ([Get one here](https://app.pinecone.io/))

### 1. Clone & Install

```bash
git clone https://github.com/krishnabantola/jarvis-rag-assistant.git
cd jarvis-rag-assistant
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your API keys:

```env
# REQUIRED: OpenRouter
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=google/gemini-flash-1.5

# REQUIRED: Pinecone
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=your_pinecone_environment
PINECONE_INDEX_NAME=jarvis-knowledge
```

### 3. Set Up Python Environment (for ingestion)

```bash
cd scripts
pip install -r requirements.txt
```

### 4. Ingest Sample Documents

```bash
python scripts/ingest.py --jsonl docs/sample_docs.jsonl
```

This creates embeddings and uploads to Pinecone. Wait for completion (~30 seconds).

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📚 User Guide

### Chat Interface

1. **Text Chat**: Type your message and press Enter
2. **Voice Input**: Click 🎤 to speak (uses Web Speech API)
3. **Continuous Mode**: Enable for hands-free conversation
4. **View Sources**: Click on response to see retrieved document chunks

### Upload Documents

1. Navigate to **Upload** tab
2. Drag & drop PDF/TXT files or click "Choose File"
3. Wait for processing (shows progress bar)
4. Switch to **Chat** and ask questions about your document!

### Dashboard

- **Time Widget**: Current time and date
- **Weather**: Live weather data (configure `WEATHER_API_KEY`)
- **News**: Latest headlines (configure `NEWS_API_KEY`)
- **Quick Notes**: Add/delete personal notes

### Knowledge Space

- View all uploaded documents
- **Pin** important documents for quick access
- **Delete** documents you no longer need
- See metadata (size, chunks, upload date)

### Command Palette

Press `/` anywhere to open the command palette:

- `/summarize` - Generate conversation summary
- `/translate` - Translate text
- `/idea` - Brainstorm ideas
- `/code` - Generate code snippet
- `/clear` - Clear conversation

### Conversation Summaries

1. Click **Summary** button in chat
2. Click "Generate Summary"
3. Download as PDF or TXT

---

## 💰 Demo on $6 Credits

### Recommended Settings

Use these settings in your `.env` to maximize your $6 OpenRouter credits:

```env
# Ultra-cheap model for demos
OPENROUTER_MODEL=google/gemini-flash-1.5

# Conservative token limits
MAX_TOKENS=256
TEMPERATURE=0.3

# Enable caching to reduce Pinecone calls
ENABLE_CACHE=1
CACHE_TTL_SECONDS=300

# RAG settings
TOP_K_RESULTS=3
CONVERSATION_HISTORY_LENGTH=5
```

### Cost Estimates

| Model                              | Cost per 1M tokens        | Est. Requests on $6 |
| ---------------------------------- | ------------------------- | ------------------- |
| `google/gemini-flash-1.5`          | $0.075 (in) / $0.30 (out) | ~6,000              |
| `meta-llama/llama-3.1-8b-instruct` | $0.06                     | ~10,000             |
| `mistralai/mistral-7b-instruct`    | $0.06                     | ~10,000             |

**Tip**: With the above settings, each request uses ~400 tokens (300 in + 100 out) = ~$0.0003. That's **20,000 requests** on $6!

### Cost Monitoring

- Each API response includes cost metadata in the console
- Check browser DevTools → Console for logs like:
  ```
  💰 Cost: $0.000045 | Tokens: 150 (100 in + 50 out)
  ```

---

## 🔧 Configuration

### Environment Variables

See `.env.example` for all available options. Key variables:

| Variable              | Description            | Default                   |
| --------------------- | ---------------------- | ------------------------- |
| `OPENROUTER_API_KEY`  | OpenRouter API key     | _required_                |
| `OPENROUTER_MODEL`    | LLM model to use       | `google/gemini-flash-1.5` |
| `PINECONE_API_KEY`    | Pinecone API key       | _required_                |
| `PINECONE_INDEX_NAME` | Pinecone index name    | `jarvis-knowledge`        |
| `MAX_TOKENS`          | Max tokens per request | `256`                     |
| `TEMPERATURE`         | LLM temperature        | `0.3`                     |
| `TOP_K_RESULTS`       | Number of RAG chunks   | `3`                       |
| `ENABLE_CACHE`        | Enable query caching   | `1`                       |

### Swapping Pinecone for Supabase

To use Supabase instead of Pinecone:

1. Set `DATABASE_TYPE=supabase` in `.env`
2. Add Supabase credentials:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   ```
3. Update `lib/database.js` to use Supabase client (see TODO comments)

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm test -- --coverage
```

Tests include:

- Unit tests for `lib/openrouter.js`
- Unit tests for `lib/cost-estimate.js`
- Integration smoke test for RAG flow (mocked)

---

## 🚢 Deployment

### Deploy to Vercel

1. **Install Vercel CLI**:

   ```bash
   npm i -g vercel
   ```

2. **Link Project**:

   ```bash
   vercel link
   ```

3. **Set Environment Variables** in Vercel Dashboard:

   - Go to your project → Settings → Environment Variables
   - Add all variables from `.env`

4. **Deploy**:
   ```bash
   vercel --prod
   ```

### GitHub Actions (Automated)

This repo includes `.github/workflows/ci.yml`:

- **On Push**: Runs tests and builds
- **On PR**: Deploys preview to Vercel

**Setup**:

1. Add secrets to GitHub repo:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

---

## 📖 API Reference

### POST `/api/chat`

Chat with RAG context.

**Request**:

```json
{
  "message": "What is Jarvis?",
  "conversationId": "optional-conv-id",
  "includeContext": true
}
```

**Response**:

```json
{
  "answer": "Jarvis is an AI assistant...",
  "conversationId": "conv-123",
  "sources": [
    {
      "id": "doc1_chunk_0",
      "source": "docs/intro.pdf",
      "score": 0.92,
      "text": "Jarvis is..."
    }
  ],
  "metadata": {
    "model": "google/gemini-flash-1.5",
    "usage": { "prompt_tokens": 120, "completion_tokens": 45 },
    "cost": { "totalCost": "0.000015" }
  }
}
```

### GET `/api/stream`

Streaming chat with SSE.

**Query Params**:

- `message` (required)
- `conversationId` (optional)
- `includeContext` (default: `true`)

**SSE Events**:

```json
{"type": "start", "sources": [...]}
{"type": "token", "content": "Hello"}
{"type": "done"}
```

### POST `/api/ingest`

Upload and ingest document.

**Request**: `multipart/form-data` with `file` field

**Response**:

```json
{
  "success": true,
  "docId": "abc123",
  "name": "document.pdf",
  "chunks": 12,
  "characters": 6543
}
```

### GET `/api/history`

Get conversation history.

**Query Params**:

- `conversationId` (optional): Get specific conversation
- `limit` (default: 20): Max messages

**Response**:

```json
{
  "conversations": [
    {
      "id": "conv-123",
      "title": "Chat about Jarvis",
      "created_at": "2024-11-06T10:00:00Z",
      "message_count": 8
    }
  ]
}
```

### GET `/api/summary`

Generate conversation summary.

**Query Params**:

- `conversationId` (required)

**Response**:

```json
{
  "conversationId": "conv-123",
  "messageCount": 8,
  "summary": "User learned about...",
  "transcript": "USER: What is...\nASSISTANT: ..."
}
```

---

## 📂 Project Structure

```
jarvis-rag-assistant/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions CI/CD
├── __tests__/
│   ├── lib/
│   │   ├── openrouter.test.js       # Unit tests
│   │   └── cost-estimate.test.js
│   └── integration/
│       └── rag-flow.test.js         # Integration tests
├── docs/
│   └── sample_docs.jsonl            # Sample documents for ingestion
├── examples/
│   └── demo_conversation.json       # Example conversation
├── lib/
│   ├── openrouter.js                # OpenRouter adapter
│   ├── pinecone.js                  # Pinecone vector DB
│   ├── cache.js                     # Query result caching
│   ├── cost-estimate.js             # Cost tracking
│   └── database.js                  # SQLite/Supabase DB
├── pages/
│   ├── api/
│   │   ├── chat.js                  # Chat endpoint
│   │   ├── stream.js                # SSE streaming
│   │   ├── ingest.js                # Document upload
│   │   ├── transcribe.js            # Audio transcription
│   │   ├── history.js               # Conversation history
│   │   ├── documents.js             # Document management
│   │   └── summary.js               # Conversation summary
│   ├── _app.js                      # Global app wrapper
│   ├── _document.js                 # HTML document
│   ├── index.js                     # Main chat page
│   ├── dashboard.js                 # Dashboard page
│   └── knowledge.js                 # Knowledge Space page
├── scripts/
│   ├── ingest.py                    # Python ingestion script
│   └── requirements.txt             # Python dependencies
├── src/
│   ├── components/
│   │   ├── ChatInterface.js         # Chat UI
│   │   ├── Avatar.js                # Animated avatar
│   │   ├── Dashboard.js             # Dashboard widgets
│   │   ├── CommandPalette.js        # Command mode
│   │   ├── UploadArea.js            # File upload UI
│   │   ├── KnowledgeSpace.js        # Document management
│   │   ├── AboutModal.js            # About/author modal
│   │   └── SummaryModal.js          # Summary modal
│   └── styles/
│       └── globals.css              # Global styles
├── .env.example                     # Environment template
├── .gitignore
├── jest.config.js                   # Jest configuration
├── jest.setup.js
├── next.config.js                   # Next.js config
├── package.json
├── postcss.config.js
├── tailwind.config.js               # Tailwind config
└── README.md
```

---

## 🎯 Demo Checklist for Krishna

Use this checklist to demo the project during your assessment:

### Pre-Demo Setup (5 minutes)

- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in `OPENROUTER_API_KEY` and `PINECONE_API_KEY`
- [ ] Install Python dependencies: `pip install -r scripts/requirements.txt`
- [ ] Ingest sample docs: `python scripts/ingest.py --jsonl docs/sample_docs.jsonl`
- [ ] Start dev server: `npm run dev`
- [ ] Open `http://localhost:3000`

### Demo Script (3–5 steps)

#### Step 1: Chat + Voice (2 min)

1. Show the main chat interface
2. Type: "What is Jarvis?" and send
3. Show the response with sources
4. Click 🎤 and say: "How do I optimize costs?"
5. Show voice-to-text and AI response

#### Step 2: Upload & Ask (2 min)

1. Click **Upload** tab
2. Drag & drop a sample PDF or create a `.txt` file
3. Wait for upload progress
4. Return to **Chat** tab
5. Ask: "What's in the document I just uploaded?"
6. Show retrieved chunks and source highlighting

#### Step 3: Dashboard + Knowledge (1 min)

1. Click **Dashboard** in header
2. Show time, weather, notes widgets
3. Add a quick note
4. Click **Knowledge** in header
5. Show uploaded documents
6. Pin and delete a document

#### Step 4: Commands + Summary (2 min)

1. Press `/` to open command palette
2. Navigate with arrows, select `/summarize`
3. Click "Generate Summary"
4. Show AI-generated summary
5. Download as PDF

#### Step 5: About + Portfolio Touch (1 min)

1. Click **About** button
2. Show author info (Krishna Bantola)
3. Show GitHub/LinkedIn links
4. (Optional) Play demo video if embedded

---

## 🛠️ Troubleshooting

### Common Issues

**Issue**: `OPENROUTER_API_KEY not configured`

- **Fix**: Check `.env` file and ensure key is set correctly

**Issue**: Pinecone index not found

- **Fix**: Run `python scripts/ingest.py` to create index and ingest data

**Issue**: Voice input not working

- **Fix**: Check browser permissions (Microphone access). Works best in Chrome.

**Issue**: PDF upload fails

- **Fix**: Ensure file size < 10MB and install `formidable` package

**Issue**: Dark mode not persisting

- **Fix**: Check browser localStorage is enabled

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👤 Author

**Krishna Bantola**

- GitHub: [@krishnabantola](https://github.com/krishnabantola)
- LinkedIn: [Krishna Bantola](https://linkedin.com/in/krishnabantola)

---

## 🙏 Acknowledgments

- [OpenRouter](https://openrouter.ai/) for unified LLM API access
- [Pinecone](https://pinecone.io/) for vector database
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations
- [sentence-transformers](https://www.sbert.net/) for embeddings

---

## 📊 Tech Stack

**Frontend**: Next.js, React, Tailwind CSS, Framer Motion
**Backend**: Next.js API Routes, Node.js
**AI/ML**: OpenRouter (LLM), sentence-transformers (embeddings)
**Database**: Pinecone (vectors), SQLite (conversations)
**DevOps**: Vercel, GitHub Actions, Jest

---

Made with ❤️ by Krishna Bantola
