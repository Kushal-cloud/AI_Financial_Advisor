import { FormEvent, useState } from "react";
import { api, AdvisorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

export function AdvisorPage() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<AdvisorMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !input.trim()) return;
    const prompt = input.trim();
    setInput("");
    setError(null);
    const optimisticHistory: AdvisorMessage[] = [
      ...messages,
      { role: "user", content: prompt },
    ];
    setMessages(optimisticHistory);
    setSending(true);
    try {
      const res = await api.chat(token, prompt, optimisticHistory);
      setMessages((prev) => [...prev, ...res.messages.slice(-1)]);
    } catch (err) {
      setError((err as Error).message);
      setMessages((prev) => prev.filter((m, idx) => !(idx === prev.length - 1 && m.role === "user" && m.content === prompt)));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold mb-1 tracking-tight">Advisor chat</h1>
        <p className="text-sm text-slate-400">
          Ask planning questions, explore trade-offs, and get educational guidance. Responses are
          not personalized advice.
        </p>
      </div>
      <div className="flex-1 rounded-xl border border-slate-800/80 bg-slate-900/70 flex flex-col overflow-hidden shadow-soft-card/40">
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 text-sm">
          {messages.length === 0 && (
            <div className="text-slate-400 text-xs">
              Try asking: “How much should I save for an emergency fund?” or “How aggressive should
              my portfolio be for retirement in 25 years?”
            </div>
          )}
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`max-w-xl rounded-lg px-3 py-2 ${
                m.role === "user"
                  ? "ml-auto bg-emerald-500/15 border border-emerald-400/60 shadow-[0_8px_22px_rgba(16,185,129,0.35)]"
                  : "mr-auto bg-slate-800/80 border border-slate-700/80"
              }`}
            >
              <div className="text-[10px] mb-1 text-slate-400 uppercase tracking-wide">
                {m.role === "user" ? "You" : "Advisor"}
              </div>
              <div className="whitespace-pre-wrap text-xs leading-relaxed">{m.content}</div>
            </div>
          ))}
          {sending && (
            <div className="mr-auto max-w-xs rounded-lg bg-slate-800/80 border border-slate-700 px-3 py-2 text-[11px] text-slate-400">
              Thinking about your question...
            </div>
          )}
        </div>
        <form
          onSubmit={handleSubmit}
          className="border-t border-slate-800 bg-slate-900/90 px-4 py-3 flex items-end gap-3"
        >
          <textarea
            rows={2}
            className="flex-1 resize-none rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            placeholder="Ask a planning question…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="px-4 py-2 rounded-md bg-emerald-500 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            Send
          </button>
        </form>
      </div>
      {error && (
        <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/40 rounded-md px-3 py-2">
          {error}
        </div>
      )}
    </div>
  );
}

