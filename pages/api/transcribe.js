/**
 * POST /api/transcribe
 * Transcribe audio to text
 * Supports client-side fallback or remote Whisper server
 */

const formidable = require("formidable");
const fs = require("fs");
const path = require("path");

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Call remote Whisper API (if configured)
 */
async function transcribeWithWhisper(audioPath) {
  const whisperUrl = process.env.WHISPER_API_URL;

  if (!whisperUrl) {
    throw new Error("WHISPER_API_URL not configured");
  }

  const audioData = fs.readFileSync(audioPath);
  const formData = new FormData();
  formData.append("audio_file", new Blob([audioData]));

  const response = await fetch(whisperUrl, {
    method: "POST",
    headers: {
      ...(process.env.WHISPER_API_KEY && {
        Authorization: `Bearer ${process.env.WHISPER_API_KEY}`,
      }),
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Whisper API error: ${response.status}`);
  }

  const result = await response.json();
  return result.text || result.transcription;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check if Whisper is configured
    const hasWhisper = !!process.env.WHISPER_API_URL;

    if (!hasWhisper) {
      // Fallback: suggest client-side transcription
      return res.status(200).json({
        useClientSide: true,
        message: "Use Web Speech API on client side",
      });
    }

    // Parse audio upload
    const form = formidable({
      uploadDir: path.join(process.cwd(), "tmp"),
      keepExtensions: true,
      maxFileSize: 25 * 1024 * 1024, // 25MB
    });

    const tmpDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Audio parse error:", err);
        return res.status(400).json({ error: "Failed to parse audio" });
      }

      try {
        const audioFile = files.audio
          ? Array.isArray(files.audio)
            ? files.audio[0]
            : files.audio
          : null;

        if (!audioFile) {
          return res.status(400).json({ error: "No audio file provided" });
        }

        // Transcribe with Whisper
        const transcription = await transcribeWithWhisper(audioFile.filepath);

        // Clean up
        fs.unlinkSync(audioFile.filepath);

        res.status(200).json({
          transcription,
          success: true,
        });
      } catch (error) {
        console.error("Transcription error:", error);
        res.status(500).json({
          error: "Failed to transcribe audio",
          details: error.message,
          useClientSide: true,
        });
      }
    });
  } catch (error) {
    console.error("Transcribe API error:", error);
    res.status(500).json({
      error: "Failed to process transcription request",
      details: error.message,
    });
  }
}
