import { FormEvent, useEffect, useState } from "react";
import { api, FinancialGoal } from "../api/client";
import { useAuth } from "../context/AuthContext";

const GOAL_TYPES = [
  { value: "retirement", label: "Retirement" },
  { value: "home", label: "Home" },
  { value: "education", label: "Education" },
  { value: "emergency_fund", label: "Emergency fund" },
  { value: "custom", label: "Custom" },
];

export function GoalsPage() {
  const { token } = useAuth();
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [goalType, setGoalType] = useState("retirement");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetYear, setTargetYear] = useState(new Date().getFullYear() + 20 + "");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!token) return;
      setError(null);
      setLoading(true);
      try {
        const data = await api.listGoals(token);
        if (!cancelled) setGoals(data);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setCreating(true);
    setError(null);
    try {
      const goal = await api.createGoal(token, {
        name,
        goal_type: goalType,
        target_amount: Number(targetAmount || 0),
        current_amount: Number(currentAmount || 0),
        target_year: Number(targetYear),
        id: 0,
        user_id: 0,
        created_at: "",
      } as unknown as FinancialGoal);
      setGoals((prev) => [goal, ...prev]);
      setName("");
      setTargetAmount("");
      setCurrentAmount("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    await api.deleteGoal(token, id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-50">Goals</h1>
          <p className="text-sm text-slate-500 mt-1">
            Define targets and track progress.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <form
          onSubmit={handleCreate}
          className="glass-panel p-5 space-y-4"
        >
          <h2 className="font-display text-sm font-semibold text-slate-200">Create a goal</h2>
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-200">
              {error}
            </div>
          )}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">Name</label>
            <input
              required
              className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Retirement at 65"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">Goal type</label>
              <select
                className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100"
                value={goalType}
                onChange={(e) => setGoalType(e.target.value)}
              >
                {GOAL_TYPES.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">Target year</label>
              <input
                type="number"
                className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100"
                value={targetYear}
                onChange={(e) => setTargetYear(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">Target amount</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">Current amount</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 shadow-glow-sm transition-all duration-300"
          >
            {creating ? "Adding…" : "Add goal"}
          </button>
          <p className="text-[11px] text-slate-500">
            Educational sandbox. Consult a licensed advisor for personalized advice.
          </p>
        </form>

        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-sm font-semibold text-slate-200">Your goals</h2>
            {loading && <span className="text-xs text-slate-500">Loading...</span>}
          </div>
          {goals.length === 0 ? (
            <p className="text-xs text-slate-400">
              No goals yet. Use the form to define what you are working toward.
            </p>
          ) : (
            <ul className="space-y-2 text-xs">
              {goals.map((g) => (
                <li
                  key={g.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-slate-800/40 px-3 py-2.5"
                >
                  <div>
                    <div className="font-medium">{g.name}</div>
                    <div className="text-slate-400">
                      {g.goal_type} • target ${g.target_amount.toLocaleString()} by {g.target_year}
                    </div>
                    <div className="mt-1">
                      <span className="text-[11px] text-slate-400">
                        ${g.current_amount.toLocaleString()} saved (
                        {Math.round((g.current_amount / g.target_amount) * 100)}% funded)
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="text-[11px] text-slate-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

