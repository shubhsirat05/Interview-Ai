import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../utils/api.js";

const medals = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/leaderboard")
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-electric border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
      <div className="slide-up text-center">
        <p className="font-mono text-amber text-xs uppercase tracking-widest mb-2">This Month</p>
        <h1 className="font-display text-3xl font-bold text-white mb-2">🏆 Leaderboard</h1>
        <p className="font-body text-soft">Top performers ranked by average interview score</p>
      </div>

      {data?.userRank > 0 && (
        <div className="card p-4 flex items-center gap-3 slide-up"
          style={{ borderColor: "#00d4ff40", background: "rgba(0,212,255,0.05)" }}>
          <span className="font-mono text-electric text-2xl font-bold">#{data.userRank}</span>
          <div>
            <p className="font-body font-medium text-white text-sm">Your current rank</p>
            <p className="font-body text-xs text-muted">Keep practicing to climb higher</p>
          </div>
        </div>
      )}

      <div className="card overflow-hidden slide-up">
        {data?.leaderboard?.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-4xl mb-3">🎯</p>
            <p className="font-display font-bold text-white mb-1">No entries yet</p>
            <p className="font-body text-soft text-sm">Be the first to complete a session this month!</p>
          </div>
        ) : (
          data?.leaderboard?.map((entry, i) => {
            const isMe = entry._id?.toString() === user?._id;
            const scoreColor =
              entry.avgScore >= 80
                ? "#39ff8f"
                : entry.avgScore >= 60
                ? "#ffb547"
                : "#ff4d6d";

            return (
              <div
                key={i}
                className={`flex items-center gap-4 px-6 py-4 border-b border-border last:border-0 ${
                  isMe ? "bg-electric/5" : ""
                }`}
              >
                <div className="w-8 text-center">
                  {i < 3 ? (
                    <span className="text-xl">{medals[i]}</span>
                  ) : (
                    <span className="font-mono text-sm text-muted">#{i + 1}</span>
                  )}
                </div>

                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: isMe
                      ? "linear-gradient(135deg, #00d4ff, #39ff8f)"
                      : "linear-gradient(135deg, #1e2d4a, #4a5980)",
                  }}
                >
                  <span
                    className="font-display font-bold text-sm"
                    style={{ color: isMe ? "#080b12" : "#8899bb" }}
                  >
                    {entry.name[0].toUpperCase()}
                  </span>
                </div>

                <div className="flex-1">
                  <p
                    className={`font-body font-medium text-sm ${
                      isMe ? "text-electric" : "text-white"
                    }`}
                  >
                    {entry.name}{" "}
                    {isMe && (
                      <span className="text-xs text-muted">(you)</span>
                    )}
                  </p>
                  <p className="font-body text-xs text-muted">
                    {entry.totalSessions} session
                    {entry.totalSessions !== 1 ? "s" : ""}
                  </p>
                </div>

                <span
                  className="score-pill"
                  style={{
                    background: scoreColor + "20",
                    color: scoreColor,
                    border: `1px solid ${scoreColor}40`,
                  }}
                >
                  {entry.avgScore}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}