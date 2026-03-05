import { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-white/10 text-white border border-white/10"
            : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent",
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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-display font-bold text-lg shadow-glow-sm group-hover:shadow-glow group-hover:border-emerald-400/50 transition-all duration-300">
              <span className="absolute inset-0 rounded-2xl bg-emerald-500/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative">AI</span>
            </span>
            <div className="flex flex-col">
              <span className="font-display font-semibold text-sm tracking-tight text-slate-50">
                AI Financial Advisor
              </span>
              <span className="text-[11px] text-slate-500 uppercase tracking-widest">
                Planning workspace
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            <NavItem to="/" label="Dashboard" />
            <NavItem to="/goals" label="Goals" />
            <NavItem to="/advisor" label="Advisor" />
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="text-xs text-right hidden sm:block">
                  <div className="font-medium text-slate-100">
                    {user.full_name || user.email}
                  </div>
                  <div className="text-slate-500 text-[11px]">Signed in</div>
                </div>
                <button
                  onClick={logout}
                  className="text-xs px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-xs px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-semibold shadow-glow-sm hover:shadow-glow transition-all duration-300"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="glass-panel overflow-hidden">
            <div className="border-b border-white/5 px-5 py-3 flex items-center gap-2 bg-slate-900/30">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
              <span className="h-2 w-2 rounded-full bg-cyan-400/80" />
              <span className="h-2 w-2 rounded-full bg-violet-500/80" />
              <span className="ml-2 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                Secure session
              </span>
            </div>
            <div className="px-5 py-6 animate-fade-in">{children}</div>
          </div>
        </div>
      </main>
      <footer className="border-t border-white/5 py-4 text-center text-[11px] text-slate-500 uppercase tracking-wider">
        Educational use only · Not financial advice
      </footer>
    </div>
  );
}

