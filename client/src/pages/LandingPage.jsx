import { Link } from "react-router-dom";

const features = [
  { icon: "🎙️", title: "Speak Your Answer", desc: "Use your mic — just like a real interview. AI transcribes and analyzes your speech." },
  { icon: "🤖", title: "Instant AI Feedback", desc: "Get scored on clarity, relevance, confidence, and filler words in seconds." },
  { icon: "📈", title: "Track Progress", desc: "Visual dashboard shows your score trends and weak areas over time." },
  { icon: "🏆", title: "Leaderboard", desc: "Compete with other candidates and see how you rank this month." },
];

const types = [
  { label: "HR / Behavioral", icon: "👥", color: "#00d4ff" },
  { label: "Technical", icon: "💻", color: "#39ff8f" },
  { label: "System Design", icon: "🏗️", color: "#ffb547" },
];

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-8"
            style={{ background: "radial-gradient(circle, rgba(0,212,255,0.12), transparent 70%)" }} />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full opacity-5"
            style={{ background: "radial-gradient(circle, #39ff8f, transparent)" }} />
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "linear-gradient(#1e2d4a 1px, transparent 1px), linear-gradient(90deg, #1e2d4a 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-electric/30 bg-electric/10 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
            <span className="font-mono text-xs text-electric">Powered by Llama 3.3 · Groq</span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-6">
            Ace your next
            <span className="relative inline-block ml-3">
              <span style={{ color: "#00d4ff" }}>interview</span>
              <span className="absolute -bottom-1 left-0 w-full h-0.5 rounded"
                style={{ background: "linear-gradient(90deg, #00d4ff, #39ff8f)" }} />
            </span>
            <br />with AI coaching
          </h1>
          <p className="font-body text-lg text-soft leading-relaxed mb-10 max-w-xl mx-auto">
            Speak your answers out loud. Get instant AI feedback on content, confidence, filler words, and how to improve — just like a real mock interview.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-base px-8 py-4">Start Practicing Free →</Link>
            <Link to="/login" className="btn-ghost text-base px-8 py-4">Sign In</Link>
          </div>
        </div>

        <div className="relative z-10 flex gap-3 mt-16 slide-up" style={{ animationDelay: "200ms" }}>
          {types.map(t => (
            <div key={t.label} className="card px-4 py-2.5 flex items-center gap-2">
              <span>{t.icon}</span>
              <span className="font-body text-sm" style={{ color: t.color }}>{t.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="font-mono text-xs text-electric uppercase tracking-widest mb-2">Why InterviewAI</p>
          <h2 className="font-display text-3xl font-bold text-white">Everything you need to prepare</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <div key={i} className="card p-6 hover:border-electric/30 transition-all hover:scale-[1.01]">
              <span className="text-3xl mb-3 block">{f.icon}</span>
              <h3 className="font-display font-bold text-white mb-2">{f.title}</h3>
              <p className="font-body text-sm text-soft leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-xl mx-auto px-6 py-20 text-center">
        <div className="card p-10"
          style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.08), rgba(57,255,143,0.05))", borderColor: "rgba(0,212,255,0.2)" }}>
          <h2 className="font-display text-3xl font-bold text-white mb-3">Ready to stand out?</h2>
          <p className="font-body text-soft mb-6">Join candidates who are practicing smarter</p>
          <Link to="/register" className="btn-primary text-base px-8 py-4 inline-block">Create Free Account →</Link>
        </div>
      </section>
    </div>
  );
}