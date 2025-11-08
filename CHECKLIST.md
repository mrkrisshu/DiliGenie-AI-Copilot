# 🎯 Quick Start Checklist for Krishna

## ⚡ Pre-Demo Setup (5 minutes)

### 1. Environment Setup

- [ ] Navigate to project directory: `cd c:\Users\mrkri\Desktop\Delgen22`
- [ ] Copy environment file: `copy .env.example .env`
- [ ] Edit `.env` and add your keys:
  - [ ] `OPENROUTER_API_KEY=sk-or-v1-...` ([Get here](https://openrouter.ai/keys))
  - [ ] `PINECONE_API_KEY=...` ([Get here](https://app.pinecone.io/))
  - [ ] `PINECONE_ENVIRONMENT=us-east-1-aws` (or your region)
  - [ ] `PINECONE_INDEX_NAME=jarvis-knowledge`

### 2. Install Dependencies

```powershell
# Node.js dependencies
npm install

# Python dependencies (for ingestion)
cd scripts
pip install -r requirements.txt
cd ..
```

### 3. Ingest Sample Documents

```powershell
python scripts\ingest.py --jsonl docs\sample_docs.jsonl
```

⏱️ This takes ~30 seconds. Wait for "INGESTION SUMMARY" message.

### 4. Start Development Server

```powershell
npm run dev
```

🌐 Open http://localhost:3000

---

## 🎬 Demo Script (5 minutes)

### Demo Step 1: Chat + Voice (90 seconds)

**Actions**:

1. ✅ Open http://localhost:3000
2. ✅ Type in chat: "What is Jarvis?"
3. ✅ Press Enter and show response with sources
4. ✅ Click 🎤 microphone button
5. ✅ Say: "How do I optimize costs?"
6. ✅ Show voice-to-text working and AI response

**What to highlight**:

- Real-time RAG retrieval (sources shown)
- Voice input with Web Speech API
- Streaming responses (if enabled)
- Cost metadata in browser console (F12)

---

### Demo Step 2: Upload & Ask (90 seconds)

**Actions**:

1. ✅ Click **Upload** tab in sidebar
2. ✅ Create a test file OR drag existing PDF:
   ```
   Create test.txt with content:
   "This is a demo document about machine learning.
   Neural networks are powerful AI models."
   ```
3. ✅ Drag test.txt into upload area
4. ✅ Wait for upload progress (shows 100%)
5. ✅ Click **Chat** tab
6. ✅ Type: "What's in the document I just uploaded?"
7. ✅ Show retrieved chunks from your document

**What to highlight**:

- Automatic chunking and embedding
- Progress bar during upload
- Document appears in sources
- RAG working with user's own documents

---

### Demo Step 3: Dashboard + Knowledge Space (60 seconds)

**Actions**:

1. ✅ Click **Dashboard** in header
2. ✅ Show widgets:
   - Current time (live)
   - Weather (mock data)
   - News (mock data)
   - Quick notes
3. ✅ Add a quick note: "Demo successful!"
4. ✅ Click **Knowledge** in header
5. ✅ Show uploaded documents list
6. ✅ Click **Pin** on a document
7. ✅ Click **Delete** on test document

**What to highlight**:

- Modular dashboard with real-time data
- Personal notes stored in localStorage
- Document management (pin/delete)
- Clean, modern UI with gradients

---

### Demo Step 4: Command Palette + Summary (60 seconds)

**Actions**:

1. ✅ Press `/` key (anywhere)
2. ✅ Show command palette appearing
3. ✅ Navigate with arrow keys
4. ✅ Select `/summarize` and press Enter
5. ✅ Click "Generate Summary" button
6. ✅ Wait for AI to generate summary
7. ✅ Click "Download PDF" to show export

**What to highlight**:

- Keyboard-driven workflow
- AI-powered conversation analysis
- PDF export functionality
- Multiple command options available

---

### Demo Step 5: Portfolio Touch (30 seconds)

**Actions**:

1. ✅ Click **About** button in header
2. ✅ Show modal with:
   - Your name: Krishna Bantola
   - GitHub link
   - LinkedIn link
   - Tech stack badges
3. ✅ Toggle **Dark Mode** (moon icon bottom-right)
4. ✅ Show smooth transitions

**What to highlight**:

- Professional portfolio integration
- Full dark mode support
- Smooth animations with Framer Motion
- Author information clearly displayed

---

## 🐛 Quick Troubleshooting

### Issue: "OPENROUTER_API_KEY is not configured"

**Fix**: Check `.env` file exists and has correct key format

### Issue: "Pinecone index not found"

**Fix**: Re-run ingestion: `python scripts\ingest.py --jsonl docs\sample_docs.jsonl`

### Issue: Voice not working

**Fix**: Allow microphone permissions in browser (Chrome recommended)

### Issue: Upload fails

**Fix**: Check file size < 10MB, ensure `tmp` folder exists

### Issue: Can't see uploaded document in Knowledge Space

**Fix**: Refresh page or check `data\jarvis.db` exists

---

## 💰 Cost Awareness (Important!)

With recommended settings, you get approximately:

- **~20,000 requests on $6** using `google/gemini-flash-1.5`
- Each request: ~$0.0003 (400 tokens avg)

**Current settings in `.env`**:

```env
OPENROUTER_MODEL=google/gemini-flash-1.5  # Cheapest quality model
MAX_TOKENS=256                              # Conservative limit
TEMPERATURE=0.3                             # Low for consistency
ENABLE_CACHE=1                              # Reduce Pinecone calls
```

**Monitor usage**:

- Check console (F12) for cost per request
- View OpenRouter dashboard: https://openrouter.ai/activity

---

## 🚀 Deploy to Vercel (After Demo)

### Quick Deploy

```powershell
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Add Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all keys from `.env`
3. Redeploy

**Public URL**: `https://your-project.vercel.app`

---

## ✅ Post-Demo Checklist

- [ ] All features demonstrated successfully
- [ ] No console errors
- [ ] Voice input worked
- [ ] Document upload worked
- [ ] RAG retrieval showed sources
- [ ] Dashboard widgets displayed
- [ ] Knowledge Space functioned
- [ ] Command palette opened
- [ ] Summary generated
- [ ] About modal showed author info
- [ ] Dark mode toggled smoothly

---

## 📝 Key Talking Points

1. **Full-Stack RAG System**: "Built a complete RAG pipeline with Next.js, OpenRouter LLMs, and Pinecone vectors"

2. **Cost-Conscious Design**: "Implemented cost tracking, caching, and budget warnings to demo on just $6 credits"

3. **Modern UI/UX**: "Used Tailwind CSS and Framer Motion for a polished, production-ready interface with dark mode"

4. **Voice + Multi-Modal**: "Integrated Web Speech API for voice input with continuous conversation mode"

5. **Document Intelligence**: "Users can upload PDFs and chat with them using semantic search and chunked embeddings"

6. **Developer Experience**: "Complete with tests, CI/CD, comprehensive docs, and one-command deployment to Vercel"

7. **Scalability**: "Serverless architecture on Vercel with SQLite/Supabase option for conversations"

---

## 🎓 Technical Highlights to Mention

- **RAG Implementation**: Chunking with overlap, sentence-transformers embeddings, Pinecone query with caching
- **Streaming**: SSE-based streaming from OpenRouter for real-time responses
- **State Management**: React hooks for UI state, localStorage for persistence
- **API Design**: RESTful Next.js API routes with proper error handling
- **Cost Optimization**: Token estimation, query caching, conservative defaults
- **Testing**: Jest unit tests + integration tests with mocks
- **DevOps**: GitHub Actions CI/CD, automated Vercel deployments

---

**Good luck with your demo, Krishna! 🚀**

Remember: If something breaks, stay calm and check the troubleshooting section above. You've got this! 💪
