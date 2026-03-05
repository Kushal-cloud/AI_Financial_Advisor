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
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {user?.full_name ? `Hi, ${user.full_name.split(" ")[0]}` : "Your dashboard"}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track your goals, see your savings picture, and explore scenarios with the AI advisor.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-soft-card/40">
          <div className="text-xs text-slate-400 mb-1">Savings rate</div>
          <div className="text-2xl font-semibold">
            {profile?.savings_rate != null ? `${Math.round(profile.savings_rate * 100)}%` : "—"}
          </div>
          <p className="mt-2 text-xs text-slate-400">
            A rule of thumb is saving 10–20% of gross income, more if you started later or have
            ambitious goals.
          </p>
        </div>
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-soft-card/40">
          <div className="text-xs text-slate-400 mb-1">Goals funded</div>
          <div className="text-2xl font-semibold">
            {totalTarget > 0 ? `${Math.round((totalCurrent / totalTarget) * 100)}%` : "—"}
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Based on your defined goals. You can refine amounts and timelines on the Goals tab.
          </p>
        </div>
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-soft-card/40">
          <div className="text-xs text-slate-400 mb-1">Risk posture</div>
          <div className="text-2xl font-semibold capitalize">
            {profile?.risk_tolerance || "Not set"}
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Match risk to both your time horizon and ability to stay invested through volatility.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Snapshot</h2>
            {loading && <span className="text-xs text-slate-500">Loading...</span>}
          </div>
          <dl className="space-y-2 text-xs">
            <div className="flex justify-between">
              <dt className="text-slate-400">Age</dt>
              <dd>{profile?.age ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Annual income</dt>
              <dd>
                {profile?.annual_income != null
                  ? `$${profile.annual_income.toLocaleString()}`
                  : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Investment horizon</dt>
              <dd>
                {profile?.investment_horizon_years != null
                  ? `${profile.investment_horizon_years} years`
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Goals overview</h2>
          </div>
          {goals.length === 0 ? (
            <p className="text-xs text-slate-400">
              No goals yet. Start by defining a retirement, home, education, or emergency fund
              target on the Goals tab.
            </p>
          ) : (
            <ul className="space-y-2 text-xs">
              {goals.slice(0, 4).map((g) => (
                <li
                  key={g.id}
                  className="flex items-center justify-between rounded-md border border-slate-800/80 bg-slate-900/60 px-3 py-2"
                >
                  <div>
                    <div className="font-medium">{g.name}</div>
                    <div className="text-slate-400">
                      {g.goal_type} • target ${g.target_amount.toLocaleString()} by {g.target_year}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs">
                      ${g.current_amount.toLocaleString()} / ${g.target_amount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400">
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

