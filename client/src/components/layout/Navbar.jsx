import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const navLinks = [
  { path: "/dashboard", label: "Dashboard" },
   { path: "/resume", label: "Resume" },
  { path: "/interview", label: "Practice" },
  { path: "/leaderboard", label: "Leaderboard" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric to-cyan-600 flex items-center justify-center">
            <span className="text-void font-display font-bold text-sm">AI</span>
          </div>
          <span className="font-display font-bold text-lg text-white">
            Interview<span className="text-electric">AI</span>
          </span>
        </Link>

        {user && (
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.path} to={link.path}
                className={`px-4 py-2 rounded-lg font-body text-sm font-medium transition-all ${
                  location.pathname === link.path
                    ? "bg-electric/10 text-electric"
                    : "text-soft hover:text-white hover:bg-white/5"
                }`}>
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-electric to-neon flex items-center justify-center">
                <span className="text-void font-display font-bold text-xs">
                  {user.name[0].toUpperCase()}
                </span>
              </div>
              <span className="font-body text-sm text-soft">{user.name}</span>
            </div>
            <button onClick={handleLogout} className="btn-ghost text-sm py-2 px-4">Logout</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost text-sm py-2 px-4">Login</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}