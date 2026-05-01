import { Router } from "express";
import { protect } from "../middleware/auth.js";
import Session from "../models/Session.js";

const router = Router();

router.get("/stats", protect, async (req, res, next) => {
  try {
    const sessions = await Session.find({ userId: req.user._id }).sort({ completedAt: -1 });
    const totalSessions = sessions.length;
    const avgScore = totalSessions
      ? Math.round(sessions.reduce((s, sess) => s + sess.overallScore, 0) / totalSessions)
      : 0;

    const progressChart = sessions.slice(0, 10).reverse().map(s => ({
      date: s.completedAt.toISOString().split("T")[0],
      score: s.overallScore,
      type: s.type,
    }));

    const weakAreaCount = {};
    sessions.forEach(s => {
      s.weakAreas.forEach(area => {
        weakAreaCount[area] = (weakAreaCount[area] || 0) + 1;
      });
    });
    const weakAreas = Object.entries(weakAreaCount)
      .sort((a, b) => b[1] - a[1])
      .map(([area, count]) => ({ area, count }));

    const typeBreakdown = { hr: 0, technical: 0, "system-design": 0 };
    sessions.forEach(s => { typeBreakdown[s.type] = (typeBreakdown[s.type] || 0) + 1; });

    res.json({ totalSessions, avgScore, progressChart, weakAreas, typeBreakdown, recentSessions: sessions.slice(0, 5) });
  } catch (err) { next(err); }
});

router.get("/leaderboard", protect, async (req, res, next) => {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const leaderboard = await Session.aggregate([
      { $match: { completedAt: { $gte: since } } },
      { $group: { _id: "$userId", avgScore: { $avg: "$overallScore" }, totalSessions: { $sum: 1 } }},
      { $sort: { avgScore: -1 } },
      { $limit: 10 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $project: { name: "$user.name", avgScore: { $round: ["$avgScore", 0] }, totalSessions: 1 }},
    ]);

    const userRank = leaderboard.findIndex(u => u._id.toString() === req.user._id.toString()) + 1;
    res.json({ leaderboard, userRank });
  } catch (err) { next(err); }
});

export default router;