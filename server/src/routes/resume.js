import { Router } from "express";
import multer from "multer";
import Groq from "groq-sdk";
import { protect } from "../middleware/auth.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { PdfReader } = require("pdfreader");

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files allowed"));
  },
});

function getClient() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

function extractPDFText(buffer) {
  return new Promise((resolve, reject) => {
    const reader = new PdfReader();
    let text = "";
    let lastY = null;

    reader.parseBuffer(buffer, (err, item) => {
      if (err) {
        reject(err);
        return;
      }
      if (!item) {
        // End of file
        resolve(text.trim());
        return;
      }
      if (item.text) {
        // Add newline when Y position changes (new line in PDF)
        if (lastY !== null && item.y !== lastY) {
          text += "\n";
        }
        text += item.text + " ";
        lastY = item.y;
      }
    });
  });
}

async function analyzeWithGroq(resumeText) {
  const prompt = `You are an expert technical recruiter. Analyze this resume and return ONLY valid JSON (no markdown, no extra text):

Resume:
${resumeText.slice(0, 4000)}

Return exactly this JSON:
{
  "name": "<candidate name or Unknown>",
  "overallScore": <0-100>,
  "level": "<Junior | Mid | Senior>",
  "topSkills": ["<skill1>", "<skill2>", "<skill3>", "<skill4>", "<skill5>"],
  "missingSkills": ["<skill1>", "<skill2>", "<skill3>"],
  "suggestedTopics": [
    { "topic": "<topic>", "reason": "<why based on resume>", "priority": "<High|Medium|Low>" },
    { "topic": "<topic>", "reason": "<why>", "priority": "<High|Medium|Low>" },
    { "topic": "<topic>", "reason": "<why>", "priority": "<High|Medium|Low>" },
    { "topic": "<topic>", "reason": "<why>", "priority": "<High|Medium|Low>" }
  ],
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknesses": ["<weakness1>", "<weakness2>"],
  "summary": "<2-3 sentence honest assessment>",
  "interviewFocus": "<HR | Technical | System Design | All>",
  "yearsExperience": "<0-1 | 1-3 | 3-5 | 5+>"
}`;

  const response = await getClient().chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.choices[0].message.content
    .replace(/```json|```/g, "")
    .trim();

  return JSON.parse(text);
}

// PDF upload route
router.post("/analyze", protect, upload.single("resume"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const resumeText = await extractPDFText(req.file.buffer);

    if (!resumeText || resumeText.length < 50) {
      return res.status(400).json({
        error: "Could not extract text from PDF. Try the text paste option instead.",
      });
    }

    const analysis = await analyzeWithGroq(resumeText);
    res.json({ success: true, analysis });
  } catch (err) {
    next(err);
  }
});

// Text paste route
router.post("/analyze-text", protect, async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length < 50) {
      return res.status(400).json({ error: "Resume text too short" });
    }

    const analysis = await analyzeWithGroq(text);
    res.json({ success: true, analysis });
  } catch (err) {
    next(err);
  }
});

export default router;