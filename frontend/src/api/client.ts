const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface ApiError {
  message: string;
}

async function request<T>(
  path: string,
  options: {
    method?: HttpMethod;
    body?: unknown;
    token?: string | null;
  } = {}
): Promise<T> {
  const { method = "GET", body, token } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let detail: string | undefined;
    try {
      const data = (await res.json()) as { detail?: string };
      detail = data.detail;
    } catch {
      // ignore
    }
    throw new Error(detail || `Request failed with status ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as unknown as T;
  }

  return (await res.json()) as T;
}

export interface User {
  id: number;
  email: string;
  full_name?: string | null;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserProfile {
  id: number;
  user_id: number;
  age?: number | null;
  annual_income?: number | null;
  savings_rate?: number | null;
  risk_tolerance?: string | null;
  investment_horizon_years?: number | null;
}

export interface FinancialGoal {
  id: number;
  user_id: number;
  name: string;
  goal_type: string;
  target_amount: number;
  current_amount: number;
  target_year: number;
  created_at: string;
}

export interface AdvisorMessage {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

export interface AdvisorChatResponse {
  reply: string;
  messages: AdvisorMessage[];
}

export const api = {
  async register(payload: { email: string; full_name?: string; password: string }) {
    return request<User>("/auth/register", { method: "POST", body: payload });
  },

  async login(email: string, password: string) {
    const form = new URLSearchParams();
    form.set("username", email);
    form.set("password", password);

    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { detail?: string };
      throw new Error(data.detail || "Login failed");
    }

    return (await res.json()) as TokenResponse;
  },

  me(token: string | null) {
    return request<User>("/auth/me", { token });
  },

  getProfile(token: string | null) {
    return request<UserProfile>("/profile/me", { token });
  },

  updateProfile(token: string | null, payload: Partial<UserProfile>) {
    return request<UserProfile>("/profile/me", { method: "PUT", body: payload, token });
  },

  listGoals(token: string | null) {
    return request<FinancialGoal[]>("/goals/", { token });
  },

  createGoal(
    token: string | null,
    payload: Pick<
      FinancialGoal,
      "name" | "goal_type" | "target_amount" | "current_amount" | "target_year"
    >
  ) {
    return request<FinancialGoal>("/goals/", { method: "POST", body: payload, token });
  },

  deleteGoal(token: string | null, id: number) {
    return request<void>(`/goals/${id}`, { method: "DELETE", token });
  },

  chat(token: string | null, message: string, history: AdvisorMessage[] = []) {
    return request<AdvisorChatResponse>("/advisor/chat", {
      method: "POST",
      body: { message, history },
      token,
    });
  },
};

