import { useState, useRef, useCallback } from "react";
import api from "../utils/api";

const TYPES = [
  { id: "hr", label: "HR / Behavioral", desc: "Tell me about yourself, strengths, teamwork", color: "#00d4ff", icon: "👥" },
  { id: "technical", label: "Technical", desc: "DSA, coding concepts, problem solving", color: "#39ff8f", icon: "💻" },
  { id: "system-design", label: "System Design", desc: "Architecture, scalability, databases", color: "#ffb547", icon: "🏗️" },
];

function WaveformBars({ active }) {
  return (
    <div className={`flex items-center gap-1 h-8 ${active ? "opacity-100" : "opacity-0"}`}>
      {[...Array(7)].map((_, i) => (
        <div key={i} className="wave-bar h-4" style={{ animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
  );
}

function ScoreMeter({ label, score, color }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="font-body text-xs text-soft">{label}</span>
        <span className="font-mono text-xs" style={{ color }}>{score}</span>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function InterviewPage() {
  const [phase, setPhase] = useState("setup"); // setup | ready | recording | thinking | feedback | done
  const [type, setType] = useState(null);
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState(null);
  const [hint, setHint] = useState("");
  const [transcript, setTranscript] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [sessionResults, setSessionResults] = useState([]);
  const [questionNum, setQuestionNum] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");
  const [startTime] = useState(Date.now());

  const recognitionRef = useRef(null);
  const previousQuestions = sessionResults.map(r => r.question);

  async function fetchQuestion() {
    setError("");
    setPhase("thinking");
    try {
      const { data } = await api.post("/interview/question", {
        type, topic, previousQuestions,
      });
      setQuestion(data.question);
      setHint(data.hint);
      setTranscript("");
      setEvaluation(null);
      setPhase("ready");
    } catch {
      setError("Failed to fetch question. Check your connection.");
      setPhase("setup");
    }
  }

  function startRecording() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition not supported. Please type your answer below.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let final = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript + " ";
      }
      setTranscript(final);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      setPhase("ready");
    };

    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setPhase("recording");
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    setIsRecording(false);
    setPhase("ready");
  }

  async function submitAnswer() {
    const answer = transcript.trim();
    if (!answer || answer.length < 10) {
      setError("Please give a longer answer before submitting.");
      return;
    }

    setError("");
    setPhase("thinking");

    try {
      const { data } = await api.post("/interview/evaluate", {
        question, answer, type,
      });
      setEvaluation(data);
      setSessionResults(prev => [...prev, {
        question, userAnswer: answer,
        scores: data.scores,
        fillerWordCount: data.fillerWordCount,
        fillerWordsFound: data.fillerWordsFound,
        idealAnswer: data.idealAnswer,
        feedback: data.feedback,
        improvements: data.improvements,
      }]);
      setPhase("feedback");
    } catch {
      setError("Evaluation failed. Please try again.");
      setPhase("ready");
    }
  }

  async function finishSession() {
    const duration = Math.round((Date.now() - startTime) / 1000);
    try {
      await api.post("/interview/session", {
        type, topic, results: sessionResults, duration,
      });
    } catch { /* non-blocking */ }
    setPhase("done");
  }

  // ── SETUP SCREEN ──
  if (phase === "setup") {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        <div className="slide-up text-center">
          <p className="font-mono text-electric text-xs uppercase tracking-widest mb-2">New Session</p>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Choose your interview type</h1>
          <p className="font-body text-soft">Pick a category and optionally set a focus topic</p>
        </div>

        <div className="space-y-3 slide-up">
          {TYPES.map(t => (
            <button key={t.id} onClick={() => setType(t.id)}
              className={`w-full text-left card p-5 transition-all hover:scale-[1.01] ${type === t.id ? "glow-electric border-electric/50" : ""}`}
              style={type === t.id ? { borderColor: t.color + "80" } : {}}>
              <div className="flex items-center gap-4">
                <span className="text-3xl">{t.icon}</span>
                <div className="flex-1">
                  <p className="font-display font-bold text-white">{t.label}</p>
                  <p className="font-body text-xs text-soft mt-0.5">{t.desc}</p>
                </div>
                {type === t.id && (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: t.color }}>
                    <span className="text-void text-xs font-bold">✓</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="slide-up">
          <label className="block font-body text-sm text-soft mb-2">
            Topic / Focus Area <span className="text-muted">(optional)</span>
          </label>
          <input className="input-field" placeholder='e.g. "React hooks", "conflict resolution", "microservices"'
            value={topic} onChange={e => setTopic(e.target.value)} />
        </div>

        {error && <p className="text-danger font-body text-sm">{error}</p>}

        <button className="btn-primary w-full" disabled={!type} onClick={fetchQuestion}>
          Start Interview →
        </button>
      </div>
    );
  }

  // ── LOADING SCREEN ──
  if (phase === "thinking") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-2 border-electric border-t-transparent rounded-full animate-spin" />
        <p className="font-body text-soft">{evaluation ? "Evaluating your answer…" : "Generating question…"}</p>
      </div>
    );
  }

  // ── DONE SCREEN ──
  if (phase === "done") {
    const avg = Math.round(sessionResults.reduce((s, r) => s + r.scores.overall, 0) / sessionResults.length);
    const color = avg >= 80 ? "#39ff8f" : avg >= 60 ? "#ffb547" : "#ff4d6d";
    return (
      <div className="max-w-xl mx-auto px-6 py-12 text-center slide-up space-y-6">
        <div className="text-6xl">🎉</div>
        <h1 className="font-display text-3xl font-bold text-white">Session Complete!</h1>
        <div className="card p-8">
          <p className="font-body text-soft mb-2">Your average score</p>
          <p className="font-display font-bold text-6xl" style={{ color }}>{avg}</p>
          <p className="font-body text-soft mt-1">{questionNum - 1} question{questionNum > 2 ? "s" : ""} answered</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-ghost flex-1" onClick={() => { setPhase("setup"); setType(null); setSessionResults([]); setQuestionNum(1); }}>
            New Session
          </button>
          <a href="/dashboard" className="btn-primary flex-1 text-center">View Dashboard →</a>
        </div>
      </div>
    );
  }

  // ── INTERVIEW SCREEN (ready / recording / feedback) ──
  const selectedType = TYPES.find(t => t.id === type);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between slide-up">
        <div className="flex items-center gap-2">
          <span className="score-pill"
            style={{ background: selectedType.color + "20", color: selectedType.color, border: `1px solid ${selectedType.color}40` }}>
            {selectedType.icon} {selectedType.label}
          </span>
          {topic && <span className="font-body text-xs text-muted">· {topic}</span>}
        </div>
        <span className="font-mono text-xs text-muted">Q{questionNum}</span>
      </div>

      {/* Question card */}
      <div className="card p-6 slide-up" style={{ borderColor: selectedType.color + "30" }}>
        <p className="font-mono text-xs mb-3" style={{ color: selectedType.color }}>QUESTION</p>
        <p className="font-display text-xl font-semibold text-white leading-snug">{question}</p>
        {hint && (
          <div className="mt-4 px-3 py-2 rounded-lg bg-white/5 border border-border">
            <p className="font-body text-xs text-muted">💡 Hint: {hint}</p>
          </div>
        )}
      </div>

      {/* Recording area */}
      {phase !== "feedback" && (
        <div className="card p-6 slide-up space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-body text-sm text-soft">Your answer</p>
            <WaveformBars active={isRecording} />
          </div>

          {/* Transcript */}
          <div className="min-h-24 p-3 rounded-lg bg-surface border border-border">
            {transcript ? (
              <p className="font-body text-sm text-white leading-relaxed">{transcript}</p>
            ) : (
              <p className="font-body text-sm text-muted italic">
                {isRecording ? "Listening… speak now" : "Click record to start speaking, or type below"}
              </p>
            )}
          </div>

          {/* Type fallback */}
          <textarea
            className="input-field text-sm"
            rows={3}
            placeholder="Or type your answer here…"
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
          />

          {error && <p className="text-danger font-body text-sm">{error}</p>}

          {/* Controls */}
          <div className="flex gap-3">
            {!isRecording ? (
              <button onClick={startRecording}
                className="flex-1 btn-primary flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                Start Recording
              </button>
            ) : (
              <button onClick={stopRecording}
                className="flex-1 py-3 rounded-xl font-display font-bold text-sm transition-all"
                style={{ background: "#ff4d6d", color: "white" }}>
                ⏹ Stop Recording
              </button>
            )}
            <button onClick={submitAnswer} className="flex-1 btn-primary"
              disabled={!transcript.trim() || isRecording}
              style={{ background: "linear-gradient(135deg, #39ff8f, #00b860)", color: "#080b12" }}>
              Submit Answer →
            </button>
          </div>
        </div>
      )}

      {/* Feedback panel */}
      {phase === "feedback" && evaluation && (
        <div className="space-y-4 slide-up">
          {/* Score overview */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-white">AI Feedback</h2>
              <span className="score-pill text-lg font-bold"
                style={{
                  background: evaluation.scores.overall >= 70 ? "#39ff8f20" : "#ffb54720",
                  color: evaluation.scores.overall >= 70 ? "#39ff8f" : "#ffb547",
                  border: `1px solid ${evaluation.scores.overall >= 70 ? "#39ff8f40" : "#ffb54740"}`,
                  fontSize: 16,
                  padding: "6px 16px",
                }}>
                {evaluation.scores.overall} / 100
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <ScoreMeter label="Clarity" score={evaluation.scores.clarity} color="#00d4ff" />
              <ScoreMeter label="Relevance" score={evaluation.scores.relevance} color="#39ff8f" />
              <ScoreMeter label="Confidence" score={evaluation.scores.confidence} color="#ffb547" />
              <ScoreMeter label="Filler Words" score={evaluation.scores.fillerWords} color={evaluation.scores.fillerWords < 60 ? "#ff4d6d" : "#39ff8f"} />
            </div>

            {evaluation.fillerWordsFound?.length > 0 && (
              <div className="px-3 py-2 rounded-lg bg-danger/10 border border-danger/20">
                <p className="font-body text-xs text-danger">
                  Filler words detected ({evaluation.fillerWordCount}x): {evaluation.fillerWordsFound.join(", ")}
                </p>
              </div>
            )}
          </div>

          {/* Feedback text */}
          <div className="card p-5">
            <h3 className="font-display font-semibold text-white mb-2">Feedback</h3>
            <p className="font-body text-sm text-soft leading-relaxed">{evaluation.feedback}</p>
          </div>

          {/* Ideal answer */}
          <div className="card p-5 border-neon/20">
            <h3 className="font-display font-semibold text-white mb-2">
              <span className="text-neon">★</span> Model Answer
            </h3>
            <p className="font-body text-sm text-soft leading-relaxed">{evaluation.idealAnswer}</p>
          </div>

          {/* Improvements */}
          {evaluation.improvements?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-display font-semibold text-white mb-3">To improve</h3>
              <ul className="space-y-2">
                {evaluation.improvements.map((imp, i) => (
                  <li key={i} className="flex gap-2 font-body text-sm text-soft">
                    <span className="text-amber shrink-0">→</span> {imp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next actions */}
          <div className="flex gap-3">
            <button onClick={() => { setQuestionNum(n => n + 1); fetchQuestion(); }}
              className="flex-1 btn-primary">
              Next Question →
            </button>
            <button onClick={finishSession} className="flex-1 btn-ghost">
              Finish Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
