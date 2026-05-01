import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api.js";

const priorityColor = {
  High: { bg: "#ff4d6d20", color: "#ff4d6d", border: "#ff4d6d40" },
  Medium: { bg: "#ffb54720", color: "#ffb547", border: "#ffb54740" },
  Low: { bg: "#39ff8f20", color: "#39ff8f", border: "#39ff8f40" },
};

export default function ResumePage() {
  const [mode, setMode] = useState("upload");
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  function handleFile(f) {
    if (f?.type !== "application/pdf") {
      setError("Please upload a PDF file only");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("File too large. Max 5MB");
      return;
    }
    setFile(f);
    setError("");
  }

  async function handleAnalyze() {
    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      let data;
      if (mode === "upload") {
        if (!file) {
          setError("Please select a PDF file");
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append("resume", file);
        const res = await api.post("/resume/analyze", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        data = res.data;
      } else {
        if (!resumeText.trim() || resumeText.length < 50) {
          setError("Please paste your resume text");
          setLoading(false);
          return;
        }
        const res = await api.post("/resume/analyze-text", { text: resumeText });
        data = res.data;
      }
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to analyze resume");
    } finally {
      setLoading(false);
    }
  }

  const scoreColor = analysis
    ? analysis.overallScore >= 75 ? "#39ff8f"
    : analysis.overallScore >= 50 ? "#ffb547"
    : "#ff4d6d"
    : "#00d4ff";

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="slide-up">
        <p className="font-mono text-electric text-xs uppercase tracking-widest mb-2">
          AI Resume Analyzer
        </p>
        <h1 className="font-display text-3xl font-bold text-white mb-2">
          Analyze your résumé
        </h1>
        <p className="font-body text-soft">
          Upload PDF or paste text — AI tells you exactly what to practice
        </p>
      </div>

      {!analysis && (
        <div className="slide-up space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-2 p-1 bg-surface rounded-xl border border-border w-fit">
            <button
              onClick={() => setMode("upload")}
              className={`px-5 py-2 rounded-lg font-body text-sm font-medium transition-all ${
                mode === "upload" ? "bg-electric text-void" : "text-soft hover:text-white"
              }`}
            >
              📎 Upload PDF
            </button>
            <button
              onClick={() => setMode("paste")}
              className={`px-5 py-2 rounded-lg font-body text-sm font-medium transition-all ${
                mode === "paste" ? "bg-electric text-void" : "text-soft hover:text-white"
              }`}
            >
              📝 Paste Text
            </button>
          </div>

          {/* Upload mode */}
          {mode === "upload" && (
            <div className="space-y-3">
              <div
                onClick={() => inputRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFile(e.dataTransfer.files[0]);
                }}
                className={`card p-12 text-center cursor-pointer transition-all border-2 border-dashed ${
                  dragOver ? "border-electric bg-electric/5"
                  : file ? "border-neon bg-neon/5"
                  : "border-border hover:border-electric/50"
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
                {file ? (
                  <div>
                    <div className="text-4xl mb-3">📄</div>
                    <p className="font-display font-bold text-neon">{file.name}</p>
                    <p className="font-body text-xs text-muted mt-1">
                      {(file.size / 1024).toFixed(0)} KB · Click to change
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="text-5xl mb-4">📎</div>
                    <p className="font-display font-bold text-white mb-1">
                      Drop your PDF here
                    </p>
                    <p className="font-body text-sm text-soft">
                      or click to browse · PDF only · Max 5MB
                    </p>
                    <p className="font-body text-xs text-muted mt-2">
                      ⚠ Canva / image-based PDFs won't work
                    </p>
                  </div>
                )}
              </div>

              {/* Tip box */}
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber/10 border border-amber/20">
                <span className="text-amber text-sm shrink-0 mt-0.5">💡</span>
                <p className="font-body text-xs text-soft leading-relaxed">
                  <span className="text-amber font-medium">Tip:</span> Only
                  text-based PDFs work (Word → PDF, Google Docs → PDF). If
                  your resume was made in{" "}
                  <span className="text-white font-medium">Canva</span>, it
                  won't work here — use the{" "}
                  <button
                    onClick={() => setMode("paste")}
                    className="text-electric underline hover:no-underline"
                  >
                    Paste Text
                  </button>{" "}
                  option instead — works for all resume formats!
                </p>
              </div>

              {/* Supported formats */}
              <div className="flex flex-wrap gap-2">
                <span className="font-body text-xs text-muted">✅ Works with:</span>
                {["Google Docs PDF", "MS Word PDF", "LibreOffice PDF"].map((f, i) => (
                  <span key={i} className="font-body text-xs px-2 py-0.5 rounded-full bg-neon/10 text-neon border border-neon/20">
                    {f}
                  </span>
                ))}
                <span className="font-body text-xs text-muted ml-2">❌ Won't work:</span>
                {["Canva PDF", "Scanned PDF"].map((f, i) => (
                  <span key={i} className="font-body text-xs px-2 py-0.5 rounded-full bg-danger/10 text-danger border border-danger/20">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Paste mode */}
          {mode === "paste" && (
            <div className="card p-5">
              <label className="block font-body text-sm text-soft mb-2">
                Paste your resume text below
              </label>
              <textarea
                rows={12}
                className="input-field text-sm font-mono leading-relaxed"
                placeholder={`SHUBHSIRAT KAUR\nshubh130105@gmail.com\n\nEDUCATION\nB.Tech CSE — GNDU Amritsar (2023-2027)\n\nSKILLS\nReact.js, Node.js, MongoDB...\n\nPROJECTS\nAI Mock Interview Coach...`}
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
              />
              <div className="flex justify-between mt-2">
                <p className="font-body text-xs text-muted">
                  Copy all text from your resume and paste it here
                </p>
                <span className={`font-mono text-xs ${resumeText.length > 4000 ? "text-danger" : "text-muted"}`}>
                  {resumeText.length} / 4000
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm font-body">
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-void border-t-transparent rounded-full animate-spin" />
                Analyzing your resume...
              </span>
            ) : (
              "Analyze Resume →"
            )}
          </button>
        </div>
      )}

      {/* Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Score card */}
          <div className="card p-6 slide-up flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-28 h-28 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#1e2d4a" strokeWidth="10" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={scoreColor}
                  strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - analysis.overallScore / 100)}`}
                  style={{ transition: "stroke-dashoffset 1s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display font-bold text-2xl" style={{ color: scoreColor }}>
                  {analysis.overallScore}
                </span>
                <span className="font-body text-xs text-muted">/100</span>
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 mb-1 justify-center sm:justify-start flex-wrap">
                <h2 className="font-display text-xl font-bold text-white">
                  {analysis.name}
                </h2>
                <span className="score-pill text-xs"
                  style={{ background: "#00d4ff20", color: "#00d4ff", border: "1px solid #00d4ff40" }}>
                  {analysis.level}
                </span>
                <span className="score-pill text-xs"
                  style={{ background: "#ffb54720", color: "#ffb547", border: "1px solid #ffb54740" }}>
                  {analysis.yearsExperience} yrs
                </span>
              </div>
              <p className="font-body text-sm text-soft leading-relaxed">
                {analysis.summary}
              </p>
            </div>
          </div>

          {/* Top Skills */}
          <div className="card p-5 slide-up">
            <h3 className="font-display font-bold text-white mb-3">✅ Top Skills Found</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.topSkills?.map((skill, i) => (
                <span key={i} className="score-pill"
                  style={{ background: "#39ff8f20", color: "#39ff8f", border: "1px solid #39ff8f40" }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Missing Skills */}
          <div className="card p-5 slide-up">
            <h3 className="font-display font-bold text-white mb-3">⚠ Missing Skills to Add</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.missingSkills?.map((skill, i) => (
                <span key={i} className="score-pill"
                  style={{ background: "#ff4d6d20", color: "#ff4d6d", border: "1px solid #ff4d6d40" }}>
                  + {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Suggested Topics */}
          <div className="card p-5 slide-up">
            <h3 className="font-display font-bold text-white mb-4">
              🎯 What to Practice
            </h3>
            <div className="space-y-3">
              {analysis.suggestedTopics?.map((t, i) => {
                const c = priorityColor[t.priority] || priorityColor.Medium;
                return (
                  <div key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/3 border border-border">
                    <span className="score-pill text-xs shrink-0 mt-0.5"
                      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
                      {t.priority}
                    </span>
                    <div className="flex-1">
                      <p className="font-body font-medium text-sm text-white">{t.topic}</p>
                      <p className="font-body text-xs text-muted mt-0.5">{t.reason}</p>
                    </div>
                    <Link
                      to={`/interview?topic=${encodeURIComponent(t.topic)}`}
                      className="text-xs font-body text-electric hover:underline shrink-0"
                    >
                      Practice →
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strengths + Weaknesses */}
          <div className="grid sm:grid-cols-2 gap-4 slide-up">
            <div className="card p-5">
              <h3 className="font-display font-bold text-white mb-3">💪 Strengths</h3>
              <ul className="space-y-2">
                {analysis.strengths?.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm font-body text-soft">
                    <span className="text-neon shrink-0">◆</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-5">
              <h3 className="font-display font-bold text-white mb-3">📉 Areas to Improve</h3>
              <ul className="space-y-2">
                {analysis.weaknesses?.map((w, i) => (
                  <li key={i} className="flex gap-2 text-sm font-body text-soft">
                    <span className="text-danger shrink-0">◆</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="card p-6 text-center slide-up"
            style={{
              background: "linear-gradient(135deg, rgba(0,212,255,0.08), rgba(57,255,143,0.05))",
              borderColor: "rgba(0,212,255,0.2)"
            }}>
            <p className="font-display font-bold text-white mb-1">Ready to practice?</p>
            <p className="font-body text-soft text-sm mb-4">
              Start with your highest priority topics
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/interview" className="btn-primary">
                Start Interview →
              </Link>
              <button
                onClick={() => { setAnalysis(null); setFile(null); setResumeText(""); }}
                className="btn-ghost"
              >
                Analyze Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}