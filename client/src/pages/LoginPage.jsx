import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #00d4ff, transparent)" }} />
      </div>
      <div className="w-full max-w-md slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-electric to-cyan-600 mb-4">
            <span className="text-void font-display font-bold text-xl">AI</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="font-body text-soft">Continue your interview prep journey</p>
        </div>
        <div className="card p-8">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm font-body">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-body text-sm text-soft mb-1.5">Email</label>
              <input type="email" className="input-field" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div>
              <label className="block font-body text-sm text-soft mb-1.5">Password</label>
              <input type="password" className="input-field" placeholder="••••••••"
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
            </div>
            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>
          <p className="text-center font-body text-sm text-soft mt-6">
            No account?{" "}
            <Link to="/register" className="text-electric hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}