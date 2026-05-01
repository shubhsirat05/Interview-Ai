import { Router } from "express";
import User from "../models/User.js";
import { signToken, protect } from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already registered" });

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);
    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) { next(err); }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(user._id);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) { next(err); }
});

router.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});

export default router;