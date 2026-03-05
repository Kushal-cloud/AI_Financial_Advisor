import { useEffect, useState } from "react";
import { api, FinancialGoal, UserProfile } from "../api/client";
import { useAuth } from "../context/AuthContext";

export function DashboardPage() {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!token) return;
      try {
        const [p, g] = await Promise.all([api.getProfile(token), api.listGoals(token)]);
        if (!cancelled) {
          setProfile(p);
          setGoals(g);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
  const totalCurrent = goals.reduce((sum, g) => sum + g.current_amount, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-50">
            {user?.full_name ? `Hi, ${user.full_name.split(" ")[0]}` : "Dashboard"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track goals, savings, and explore scenarios with the AI advisor.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="metric-card animate-slide-up">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-2">Savings rate</div>
          <div className="font-display text-2xl font-semibold text-emerald-400">
            {profile?.savings_rate != null ? `${Math.round(profile.savings_rate * 100)}%` : "—"}
          </div>
          <p className="mt-3 text-xs text-slate-500 leading-relaxed">
            10–20% of income is a common target; adjust for timeline and goals.
          </p>
        </div>
        <div className="metric-card animate-slide-up">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-2">Goals funded</div>
          <div className="font-display text-2xl font-semibold text-cyan-400">
            {totalTarget > 0 ? `${Math.round((totalCurrent / totalTarget) * 100)}%` : "—"}
          </div>
          <p className="mt-3 text-xs text-slate-500 leading-relaxed">
            Progress across your defined goals. Edit in Goals.
          </p>
        </div>
        <div className="metric-card animate-slide-up">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-2">Risk posture</div>
          <div className="font-display text-2xl font-semibold text-violet-400 capitalize">
            {profile?.risk_tolerance || "Not set"}
          </div>
          <p className="mt-3 text-xs text-slate-500 leading-relaxed">
            Align with time horizon and tolerance for volatility.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass-panel p-5 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-sm font-semibold text-slate-200">Profile snapshot</h2>
            {loading && <span className="text-[11px] text-slate-500 animate-pulse">Loading…</span>}
          </div>
          <dl className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-white/5">
              <dt className="text-slate-500">Age</dt>
              <dd className="text-slate-200">{profile?.age ?? "—"}</dd>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <dt className="text-slate-500">Annual income</dt>
              <dd className="text-slate-200">
                {profile?.annual_income != null ? `$${profile.annual_income.toLocaleString()}` : "—"}
              </dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-slate-500">Investment horizon</dt>
              <dd className="text-slate-200">
                {profile?.investment_horizon_years != null ? `${profile.investment_horizon_years} yr` : "—"}
              </dd>
            </div>
          </dl>
        </div>
        <div className="glass-panel p-5 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-sm font-semibold text-slate-200">Goals overview</h2>
          </div>
          {goals.length === 0 ? (
            <p className="text-xs text-slate-500">
              No goals yet. Add retirement, home, education, or emergency targets in Goals.
            </p>
          ) : (
            <ul className="space-y-2 text-xs">
              {goals.slice(0, 4).map((g) => (
                <li
                  key={g.id}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-800/40 px-3 py-2.5"
                >
                  <div>
                    <div className="font-medium text-slate-200">{g.name}</div>
                    <div className="text-slate-500">
                      {g.goal_type} · ${g.target_amount.toLocaleString()} by {g.target_year}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-300">
                      ${g.current_amount.toLocaleString()} / ${g.target_amount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-emerald-400/90">
                      {Math.round((g.current_amount / g.target_amount) * 100)}% funded
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

