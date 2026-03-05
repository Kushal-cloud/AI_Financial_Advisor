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
        <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-50">Advisor chat</h1>
        <p className="text-sm text-slate-500 mt-1">
          Ask planning questions and get educational guidance. Not personalized advice.
        </p>
      </div>
      <div className="flex-1 glass-panel flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 text-sm">
          {messages.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/10 bg-slate-800/30 p-6 text-center">
              <p className="text-slate-500 text-xs mb-1">Suggested questions</p>
              <p className="text-slate-400 text-sm">
                “How much should I save for an emergency fund?” · “How aggressive should my portfolio be for retirement?”
              </p>
            </div>
          )}
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`max-w-xl rounded-2xl px-4 py-3 ${
                m.role === "user"
                  ? "ml-auto bg-emerald-500/10 border border-emerald-400/30 shadow-glow-sm"
                  : "mr-auto bg-slate-800/50 border border-white/5"
              }`}
            >
              <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">
                {m.role === "user" ? "You" : "Advisor"}
              </div>
              <div className="whitespace-pre-wrap text-xs leading-relaxed text-slate-200">{m.content}</div>
            </div>
          ))}
          {sending && (
            <div className="mr-auto max-w-xs rounded-2xl bg-slate-800/50 border border-white/5 px-4 py-2.5 text-[11px] text-slate-500 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Thinking…
            </div>
          )}
        </div>
        <form
          onSubmit={handleSubmit}
          className="border-t border-white/5 bg-slate-900/50 px-4 py-3 flex items-end gap-3"
        >
          <textarea
            rows={2}
            className="flex-1 resize-none rounded-xl border border-white/10 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-colors"
            placeholder="Ask a planning question…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 shadow-glow-sm transition-all duration-300"
          >
            Send
          </button>
        </form>
      </div>
      {error && (
        <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5">
          {error}
        </div>
      )}
    </div>
  );
}

