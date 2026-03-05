import { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150",
          isActive
            ? "bg-slate-800 text-white shadow-sm"
            : "text-slate-300 hover:bg-slate-800/80 hover:text-white",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-950/95 via-slate-950 to-slate-950 text-slate-100">
      <header className="border-b border-slate-800/70 bg-slate-950/60 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="relative h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-400/50 flex items-center justify-center text-emerald-300 font-bold shadow-[0_0_25px_rgba(16,185,129,0.35)] group-hover:scale-105 transition-transform">
              <span className="absolute inset-0 rounded-xl bg-emerald-500/10 blur-md" />
              <span className="relative">AI</span>
            </span>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight">
                AI Financial Advisor
              </span>
              <span className="text-xs text-slate-400">
                Intelligent, goal-based planning workspace
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-2">
            <NavItem to="/" label="Dashboard" />
            <NavItem to="/goals" label="Goals" />
            <NavItem to="/advisor" label="Advisor Chat" />
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="text-xs text-right">
                  <div className="font-medium text-slate-50">
                    {user.full_name || user.email}
                  </div>
                  <div className="text-slate-400">Signed in</div>
                </div>
                <button
                  onClick={logout}
                  className="text-xs px-3 py-1.5 rounded-md bg-slate-900 text-slate-200 hover:bg-slate-800 border border-slate-700/80 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-xs px-3 py-1.5 rounded-md bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-medium shadow-[0_10px_30px_rgba(16,185,129,0.45)]"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="rounded-3xl border border-slate-800/80 bg-slate-950/60 shadow-soft-card backdrop-blur-xl">
            <div className="border-b border-slate-800/60 bg-gradient-to-r from-slate-950/60 via-slate-900/60 to-slate-950/60 px-5 py-3 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400/80 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
              <span className="h-2 w-2 rounded-full bg-sky-400/70" />
              <span className="h-2 w-2 rounded-full bg-indigo-500/70" />
              <span className="ml-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Planning Environment
              </span>
            </div>
            <div className="px-5 py-5">{children}</div>
          </div>
        </div>
      </main>
      <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        Educational demo only – not financial advice.
      </footer>
    </div>
  );
}

