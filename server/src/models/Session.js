import mongoose from "mongoose";

const questionResultSchema = new mongoose.Schema({
  question: String,
  userAnswer: String,
  scores: {
    clarity: Number,
    relevance: Number,
    confidence: Number,
    fillerWords: Number,
    overall: Number,
  },
  fillerWordCount: Number,
  fillerWordsFound: [String],
  idealAnswer: String,
  feedback: String,
  improvements: [String],
});

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["hr", "technical", "system-design"], required: true },
  topic: String,
  results: [questionResultSchema],
  overallScore: { type: Number, default: 0 },
  weakAreas: [String],
  duration: Number,
  completedAt: { type: Date, default: Date.now },
});

sessionSchema.pre("save", function (next) {
  if (this.results.length > 0) {
    const avg = this.results.reduce((s, r) => s + r.scores.overall, 0) / this.results.length;
    this.overallScore = Math.round(avg);
  }
  next();
});

export default mongoose.model("Session", sessionSchema);