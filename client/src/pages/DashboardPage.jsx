import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../utils/api.js";

const typeLabel = { hr: "HR / Behavioral", technical: "Technical", "system-design": "System Design" };
const typeColor = { hr: "#00d4ff", technical: "#39ff8f", "system-design": "#ffb547" };

function ScoreGauge({ score }) {
  const color = score >= 80 ? "#39ff8f" : score >= 60 ? "#ffb547" : "#ff4d6d";
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#1e2d4a" strokeWidth="10" />
          <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * (1 - score / 100)}`}
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-3xl" style={{ color }}>{score}</span>
          <span className="font-body text-xs text-muted">avg score</span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/stats")
      .then(res => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-electric border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const radarData = stats?.weakAreas?.length ? [
    { area: "Clarity", score: 100 - (stats.weakAreas.find(w => w.area === "clarity")?.count || 0) * 10 },
    { area: "Relevance", score: 100 - (stats.weakAreas.find(w => w.area === "relevance")?.count || 0) * 10 },
    { area: "Confidence", score: 100 - (stats.weakAreas.find(w => w.area === "confidence")?.count || 0) * 10 },
    { area: "Filler Words", score: 100 - (stats.weakAreas.find(w => w.area === "fillerWords")?.count || 0) * 10 },
  ] : [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="slide-up flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-mono text-electric text-xs uppercase tracking-widest mb-1">Dashboard</p>
          <h1 className="font-display text-3xl font-bold text-white">
            Hey, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="font-body text-soft mt-1">Track your progress and sharpen your skills</p>
        </div>
        <Link to="/interview" className="btn-primary self-start sm:self-auto">
          + New Practice Session
        </Link>
      </div>

      {stats?.totalSessions === 0 ? (
        /* Empty state */
        <div className="card p-12 text-center slide-up">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">No sessions yet</h2>
          <p className="font-body text-soft mb-6">Start your first mock interview to see your progress here</p>
          <Link to="/interview" className="btn-primary inline-block">Start Practicing →</Link>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 slide-up">
            {[
              { label: "Total Sessions", value: stats.totalSessions, color: "#00d4ff" },
              { label: "Avg Score", value: `${stats.avgScore}`, color: stats.avgScore >= 70 ? "#39ff8f" : "#ffb547" },
              { label: "HR Sessions", value: stats.typeBreakdown?.hr || 0, color: "#00d4ff" },
              { label: "Technical", value: stats.typeBreakdown?.technical || 0, color: "#39ff8f" },
            ].map((stat, i) => (
              <div key={i} className="card p-5">
                <p className="font-body text-xs text-muted mb-2 uppercase tracking-wide">{stat.label}</p>
                <p className="font-display text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Progress chart */}
            <div className="card p-6 lg:col-span-2 slide-up">
              <h2 className="font-display font-bold text-white mb-4">Score Progress</h2>
              {stats.progressChart?.length > 1 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={stats.progressChart}>
                    <XAxis dataKey="date" tick={{ fill: "#4a5980", fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#4a5980", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: "#141b2d", border: "1px solid #1e2d4a", borderRadius: 8 }}
                      labelStyle={{ color: "#8899bb" }}
                      itemStyle={{ color: "#00d4ff" }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#00d4ff" strokeWidth={2.5}
                      dot={{ fill: "#00d4ff", r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted font-body text-sm">
                  Complete more sessions to see your trend
                </div>
              )}
            </div>

            {/* Avg score gauge */}
            <div className="card p-6 flex flex-col items-center justify-center slide-up">
              <h2 className="font-display font-bold text-white mb-4">Overall Rating</h2>
              <ScoreGauge score={stats.avgScore} />
              <p className="font-body text-xs text-muted mt-3">
                {stats.avgScore >= 80 ? "🔥 Excellent form!" : stats.avgScore >= 60 ? "📈 Keep improving" : "💪 Keep practicing"}
              </p>
            </div>
          </div>

          {/* Weak areas + Recent sessions */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Weak areas */}
            <div className="card p-6 slide-up">
              <h2 className="font-display font-bold text-white mb-4">⚠ Weak Areas</h2>
              {stats.weakAreas?.length > 0 ? (
                <div className="space-y-3">
                  {stats.weakAreas.map(({ area, count }) => (
                    <div key={area}>
                      <div className="flex justify-between mb-1">
                        <span className="font-body text-sm capitalize text-soft">{area.replace(/([A-Z])/g, " $1")}</span>
                        <span className="font-mono text-xs text-danger">{count}x flagged</span>
                      </div>
                      <div className="h-1.5 bg-border rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-danger transition-all"
                          style={{ width: `${Math.min(100, count * 20)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-body text-sm text-muted">No weak areas detected yet. Keep going!</p>
              )}
            </div>

            {/* Recent sessions */}
            <div className="card p-6 slide-up">
              <h2 className="font-display font-bold text-white mb-4">Recent Sessions</h2>
              <div className="space-y-3">
                {stats.recentSessions?.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-body text-sm font-medium text-white">{typeLabel[s.type]}</p>
                      <p className="font-body text-xs text-muted">
                        {new Date(s.completedAt).toLocaleDateString()}
                        {s.topic ? ` · ${s.topic}` : ""}
                      </p>
                    </div>
                    <span className="score-pill"
                      style={{
                        background: `${s.overallScore >= 70 ? "#39ff8f" : s.overallScore >= 50 ? "#ffb547" : "#ff4d6d"}20`,
                        color: s.overallScore >= 70 ? "#39ff8f" : s.overallScore >= 50 ? "#ffb547" : "#ff4d6d",
                        border: `1px solid ${s.overallScore >= 70 ? "#39ff8f" : s.overallScore >= 50 ? "#ffb547" : "#ff4d6d"}40`,
                      }}>
                      {s.overallScore}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
