# 🔧 DiliGenie API Setup Guide

## 📋 Required APIs and Configuration

### 1️⃣ **OpenRouter API** (REQUIRED for AI Chat)

**Purpose:** Powers the AI chat responses

**Setup Steps:**

1. Go to https://openrouter.ai/
2. Sign up for a free account
3. Get $6 free credits
4. Go to https://openrouter.ai/keys
5. Create a new API key
6. Copy the key and paste it in `.env`:
   ```
   OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx
   ```

**Recommended Models (Cost-Effective):**

- `google/gemini-flash-1.5` - Fast and very cheap ✅ (Recommended)
- `anthropic/claude-3-haiku` - Good quality, moderate cost
- `meta-llama/llama-3.1-8b-instruct` - Ultra cheap
- `mistralai/mistral-7b-instruct` - Cheap and decent

**Cost Estimates:**

- Gemini Flash: ~$0.01 per 1000 messages
- Your $6 credit = ~600,000 messages!

---

### 2️⃣ **Pinecone API** (REQUIRED for RAG/Document Search)

**Purpose:** Vector database for document embeddings and semantic search

**Setup Steps:**

1. Go to https://www.pinecone.io/
2. Sign up for free (Free tier: 1 index, 100K vectors)
3. Create a new project
4. Go to "API Keys" section
5. Copy your API key and environment
6. Create an index:
   - Name: `jarvis-knowledge`
   - Dimensions: `384`
   - Metric: `cosine`
7. Add to `.env`:
   ```
   PINECONE_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   PINECONE_ENVIRONMENT=us-east-1-aws
   PINECONE_INDEX_NAME=jarvis-knowledge
   PINECONE_DIMENSION=384
   ```

---

### 3️⃣ **Optional: OpenAI API** (For better embeddings)

**Purpose:** Better quality embeddings (instead of local transformer)

**Setup Steps:**

1. Go to https://platform.openai.com/
2. Create account (requires payment method)
3. Go to API keys section
4. Create new key
5. Add to `.env`:
   ```
   OPENAI_API_KEY=sk-xxxxxxxxxxxxx
   EMBEDDING_MODEL=text-embedding-3-small
   ```

**Note:** Local embeddings work fine for most use cases!

---

## 🎯 API Endpoints

### Available APIs:

1. **`/api/chat`** - Main chat endpoint

   - Method: POST
   - Handles AI conversations with RAG context
   - Supports streaming responses

2. **`/api/upload`** - File upload endpoint ✅ NEW

   - Method: POST
   - Accepts: PDF, TXT, DOC, DOCX, MD
   - Max size: 10MB
   - Automatically chunks and processes documents

3. **`/api/ingest`** - Document ingestion

   - Method: POST
   - Processes documents and stores in Pinecone
   - Creates embeddings for semantic search

4. **`/api/documents`** - List uploaded documents

   - Method: GET
   - Returns all documents in knowledge base

5. **`/api/summary`** - Conversation summary

   - Method: POST
   - Generates summary of chat conversation

6. **`/api/history`** - Chat history

   - Method: GET/POST
   - Manages conversation history

7. **`/api/stream`** - Streaming responses
   - Method: GET
   - Server-sent events for real-time AI responses

---

## ✅ Quick Start Checklist

### Minimum Required (for basic chat):

- [ ] Create `.env` file (already created ✅)
- [ ] Add OpenRouter API key
- [ ] Set `OPENROUTER_MODEL=google/gemini-flash-1.5`
- [ ] Set `NEXT_PUBLIC_ENABLE_STREAMING=1`

### For RAG/Document Upload:

- [ ] Add Pinecone API key
- [ ] Add Pinecone environment
- [ ] Create Pinecone index named `jarvis-knowledge`
- [ ] Set dimensions to `384`

### Test Your Setup:

```bash
# 1. Make sure .env is configured
# 2. Restart dev server
npm run dev

# 3. Visit http://localhost:3001/chat
# 4. Try sending a message
# 5. Try uploading a document (PDF/TXT)
```

---

## 🧪 Testing APIs

### Test Chat API (without RAG):

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, who are you?"}'
```

### Test Upload API:

```bash
curl -X POST http://localhost:3001/api/upload \
  -F "file=@/path/to/your/document.pdf"
```

---

## 💰 Cost Breakdown

### With $6 OpenRouter Credit:

- **Gemini Flash 1.5:**
  - Input: $0.00001 per 1K tokens
  - Output: $0.00002 per 1K tokens
  - Average chat: ~200 tokens
  - **~30,000 chat messages** with $6!

### Pinecone (Free Tier):

- 1 index (sufficient for personal use)
- 100K vectors (enough for ~500 documents)
- **Completely FREE**

### Total Monthly Cost:

- **$0** (using free tiers)
- OpenRouter credit lasts months!

---

## 🔍 Environment Variables Explained

```bash
# AI Model
OPENROUTER_API_KEY=           # Your OpenRouter API key
OPENROUTER_MODEL=             # Which AI model to use

# Vector Database
PINECONE_API_KEY=             # Your Pinecone API key
PINECONE_ENVIRONMENT=         # Pinecone region (e.g., us-east-1-aws)
PINECONE_INDEX_NAME=          # Your index name
PINECONE_DIMENSION=384        # Embedding dimensions

# Behavior
NEXT_PUBLIC_ENABLE_STREAMING=1  # Enable real-time streaming
MAX_TOKENS=2048               # Max response length
TEMPERATURE=0.7               # Creativity (0-1)
TOP_K_RESULTS=3               # Documents to retrieve
```

---

## 🐛 Troubleshooting

### Error: "OpenRouter API key not found"

- Check `.env` file exists
- Make sure `OPENROUTER_API_KEY` is set
- Restart dev server

### Error: "Pinecone connection failed"

- Verify API key is correct
- Check environment matches your Pinecone setup
- Ensure index exists with correct dimensions

### Upload fails

- Check file size (max 10MB)
- Verify file type is allowed
- Check `uploads/` folder permissions

### Chat not working

- Check browser console for errors
- Verify `/api/chat` endpoint is responding
- Check OpenRouter credits haven't expired

---

## 📝 Next Steps

1. **Get API Keys** (10 minutes)

   - OpenRouter: https://openrouter.ai/keys
   - Pinecone: https://app.pinecone.io/

2. **Update .env file** (2 minutes)

   - Add your API keys
   - Save the file

3. **Restart Server** (1 minute)

   ```bash
   npm run dev
   ```

4. **Test Everything** (5 minutes)
   - Visit http://localhost:3001/chat
   - Send a message
   - Upload a document
   - Chat about the document

---

## 🎉 You're All Set!

Once configured, you'll have:

- ✅ AI chat with streaming responses
- ✅ Document upload and RAG search
- ✅ Voice input support
- ✅ Beautiful animated UI
- ✅ Conversation history
- ✅ Document summarization

**Estimated Setup Time:** 15-20 minutes
**Monthly Cost:** $0 (using free tiers)

Enjoy your DiliGenie AI Assistant! 🚀
