# ElevenLabs Voice Chat Setup Guide

## Overview
DiliGenie now supports **real-time AI voice conversations** powered by ElevenLabs Conversational AI SDK. This provides natural, human-like voice interactions similar to Gemini Notebook LLM or Alexa.

## Features
✅ **Real-time voice conversation** - Continuous bidirectional chat like a phone call  
✅ **Natural AI voice** - Human-like speech powered by ElevenLabs  
✅ **Hands-free operation** - Just speak and DiliGenie responds  
✅ **Mute/unmute controls** - Toggle audio during conversation  
✅ **Professional UI** - Beautiful modal interface with status indicators  

## Setup Instructions

### Step 1: Create ElevenLabs Account
1. Go to https://elevenlabs.io/
2. Click "Sign Up" and create a free account
3. Verify your email address

### Step 2: Create Conversational AI Agent
1. Log in to your ElevenLabs dashboard
2. Navigate to **"Conversational AI"** section in the sidebar
3. Click **"Create Agent"**
4. Configure your agent:
   - **Name**: DiliGenie Assistant
   - **Voice**: Choose a natural-sounding voice (recommended: female voice for consistency)
   - **Language**: English
   - **Personality**: Set instructions like:
     ```
     You are DiliGenie, a helpful AI assistant specialized in software development, 
     data structures, algorithms, and programming. You provide clear, concise answers 
     with examples when helpful. You're friendly, professional, and encouraging.
     ```
   - **Knowledge Base** (optional): Upload relevant documents or connect to your knowledge sources

5. Click **"Save"** or **"Create Agent"**

### Step 3: Get Your Agent ID
1. After creating the agent, open its details page
2. Look for the **Agent ID** (usually starts with `agt_...`)
3. Copy this ID

### Step 4: Configure Environment Variables
1. Open your `.env` file in the project root
2. Find the ElevenLabs section:
   ```env
   # ElevenLabs Conversational AI
   NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your-agent-id-here
   ```
3. Replace `your-agent-id-here` with your actual Agent ID:
   ```env
   NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agt_abc123xyz789
   ```
4. Save the file

### Step 5: Restart Development Server
1. Stop the current dev server (Ctrl+C in terminal)
2. Start it again:
   ```bash
   npm run dev
   ```

### Step 6: Test Voice Chat
1. Open http://localhost:3001/chat
2. Click the **"DiliGenie Live"** button (orange gradient button in header)
3. Allow microphone access when prompted
4. Click **"Start Conversation"**
5. Speak your question naturally
6. DiliGenie will respond with voice!

## Usage Tips

### During Conversation
- **Speak naturally** - No need to pause or use specific keywords
- **Wait for response** - AI will respond after processing your question
- **Mute if needed** - Click the volume icon to mute/unmute AI voice
- **End anytime** - Click "End Conversation" button to stop

### Troubleshooting

**No microphone permission?**
- Check browser settings → Allow microphone for localhost
- Try Chrome or Edge (best compatibility)

**Agent ID not working?**
- Verify the Agent ID is correct (starts with `agt_`)
- Make sure it's added to `.env` as `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`
- Restart the dev server after adding the ID

**Connection errors?**
- Check your ElevenLabs account has available credits
- Verify your internet connection
- Check browser console for detailed error messages

**Voice quality issues?**
- Choose a high-quality voice in ElevenLabs dashboard
- Check your speaker/headphone volume
- Test with different voices to find the best one

## Cost & Pricing

ElevenLabs offers:
- **Free tier**: Limited characters/month (great for testing)
- **Starter**: $5/month (25,000 characters)
- **Creator**: $22/month (100,000 characters)
- **Pro**: $99/month (500,000 characters)

Voice conversations use characters based on AI responses. Average conversation uses ~200-500 characters per response.

## API Integration Details

The component uses:
- `@11labs/react` - React SDK for ElevenLabs
- `@11labs/client` - Core client library
- `useConversation` hook - Manages real-time voice session

## Advantages Over Web Speech API

**ElevenLabs** ✅:
- Natural, human-like voices
- Consistent cross-browser experience
- Professional-grade audio quality
- Built-in conversation management
- Real-time streaming
- Multiple language support

**Web Speech API** ❌:
- Robotic voices
- Browser-specific bugs (especially with speech synthesis)
- Interrupted/canceled errors
- Inconsistent behavior
- Limited voice options
- No conversation state management

## Next Steps

1. Complete the setup above
2. Test basic conversation
3. Customize agent personality in ElevenLabs dashboard
4. Add domain allow-listing for production (in ElevenLabs security settings)
5. Monitor usage in ElevenLabs dashboard

## Support

For issues or questions:
- ElevenLabs Docs: https://elevenlabs.io/docs
- ElevenLabs Support: support@elevenlabs.io
- Project Issues: Check browser console for errors

---

**Enjoy your new AI voice assistant powered by ElevenLabs! 🎙️✨**
