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
          <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
          <p className="text-sm text-slate-400 mt-1">
            Capture the big things you are planning for and track progress toward each target.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <form
          onSubmit={handleCreate}
          className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-4 space-y-3 shadow-soft-card/40"
        >
          <h2 className="text-sm font-semibold mb-1">Create a goal</h2>
          {error && (
            <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs mb-1 text-slate-300">Name</label>
            <input
              required
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Retirement at 65"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1 text-slate-300">Goal type</label>
              <select
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
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
              <label className="block text-xs mb-1 text-slate-300">Target year</label>
              <input
                type="number"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                value={targetYear}
                onChange={(e) => setTargetYear(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1 text-slate-300">Target amount</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs mb-1 text-slate-300">Current amount</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="w-full rounded-md bg-emerald-500 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {creating ? "Adding..." : "Add goal"}
          </button>
          <p className="text-[11px] text-slate-500">
            This is an educational sandbox. For personalized recommendations, consult a licensed
            professional advisor.
          </p>
        </form>

        <div className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Your goals</h2>
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
                  className="flex items-start justify-between gap-3 rounded-md border border-slate-800/80 bg-slate-900/60 px-3 py-2"
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

