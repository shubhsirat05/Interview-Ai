import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #39ff8f, transparent)" }} />
      </div>
      <div className="w-full max-w-md slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-neon to-teal-500 mb-4">
            <span className="text-void font-display font-bold text-xl">AI</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Start practicing</h1>
          <p className="font-body text-soft">Create your free account in seconds</p>
        </div>
        <div className="card p-8">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm font-body">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-body text-sm text-soft mb-1.5">Full Name</label>
              <input type="text" className="input-field" placeholder="Alex Kumar"
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div>
              <label className="block font-body text-sm text-soft mb-1.5">Email</label>
              <input type="email" className="input-field" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div>
              <label className="block font-body text-sm text-soft mb-1.5">Password</label>
              <input type="password" className="input-field" placeholder="Min. 6 characters"
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
            </div>
            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}
              style={{ background: "linear-gradient(135deg, #39ff8f, #00b860)", color: "#080b12" }}>
              {loading ? "Creating account…" : "Create Account →"}
            </button>
          </form>
          <p className="text-center font-body text-sm text-soft mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-electric hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}