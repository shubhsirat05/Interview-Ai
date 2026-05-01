import { Router } from "express";
import Groq from "groq-sdk";
import { protect } from "../middleware/auth.js";
import Session from "../models/Session.js";

const router = Router();

function getClient() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

const FILLER_WORDS = ["um", "uh", "like", "you know", "basically", "literally", "actually", "so", "right", "okay"];

function countFillers(text) {
  const lower = text.toLowerCase();
  const found = [];
  FILLER_WORDS.forEach(w => {
    const regex = new RegExp(`\\b${w}\\b`, "gi");
    const matches = lower.match(regex);
    if (matches) found.push(...matches);
  });
  return { count: found.length, words: [...new Set(found)] };
}

router.post("/question", protect, async (req, res, next) => {
  try {
    const { type, topic, previousQuestions = [] } = req.body;
    const typeMap = {
      hr: "HR / behavioral",
      technical: "technical coding / programming",
      "system-design": "system design / architecture",
    };

    const prompt = `Generate 1 ${typeMap[type] || "HR"} interview question${topic ? ` about ${topic}` : ""}.
${previousQuestions.length ? `Do NOT repeat these: ${previousQuestions.join(", ")}` : ""}
Return ONLY a JSON object: { "question": "<the question>", "hint": "<one short hint for answering well>" }
No markdown, no preamble, just raw JSON.`;

    const response = await getClient().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.choices[0].message.content
      .replace(/```json|```/g, "")
      .trim();

    res.json(JSON.parse(text));
  } catch (err) { next(err); }
});

router.post("/evaluate", protect, async (req, res, next) => {
  try {
    const { question, answer, type } = req.body;

    if (!answer || answer.trim().length < 10)
      return res.status(400).json({ error: "Answer too short" });

    const fillerData = countFillers(answer);

    const prompt = `You are a senior interviewer evaluating a candidate's answer.

Question: "${question}"
Candidate's Answer: "${answer}"
Interview Type: ${type}

Score the answer and return ONLY valid JSON (no markdown, no extra text):
{
  "scores": {
    "clarity": <0-100>,
    "relevance": <0-100>,
    "confidence": <0-100>,
    "fillerWords": <0-100, 100 means no filler words>,
    "overall": <0-100>
  },
  "feedback": "<2-3 sentence direct honest feedback>",
  "idealAnswer": "<a model answer in 3-5 sentences>",
  "improvements": ["<specific improvement 1>", "<specific improvement 2>", "<specific improvement 3>"],
  "strengths": ["<what they did well>"]
}`;

    const response = await getClient().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.choices[0].message.content
      .replace(/```json|```/g, "")
      .trim();

    const evaluation = JSON.parse(text);

    evaluation.fillerWordCount = fillerData.count;
    evaluation.fillerWordsFound = fillerData.words;
    if (fillerData.count > 5) {
      evaluation.scores.fillerWords = Math.max(10, 100 - fillerData.count * 10);
    }

    res.json(evaluation);
  } catch (err) { next(err); }
});

router.post("/session", protect, async (req, res, next) => {
  try {
    const { type, topic, results, duration } = req.body;

    const avgScores = { clarity: 0, relevance: 0, confidence: 0, fillerWords: 0 };
    results.forEach(r => {
      Object.keys(avgScores).forEach(k => {
        avgScores[k] += r.scores[k] || 0;
      });
    });
    Object.keys(avgScores).forEach(k => {
      avgScores[k] = avgScores[k] / results.length;
    });

    const weakAreas = Object.entries(avgScores)
      .filter(([, v]) => v < 65)
      .map(([k]) => k);

    const session = await Session.create({
      userId: req.user._id,
      type, topic, results, duration, weakAreas,
    });

    res.status(201).json({ session });
  } catch (err) { next(err); }
});

export default router;
