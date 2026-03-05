from __future__ import annotations

from typing import Any, Mapping

from google import genai

from config import GEMINI_API_KEY, GEMINI_MODEL, ensure_gemini_configured
from finance_analysis import FinancialMetrics
from utils import build_advice_system_prompt


def _get_client() -> genai.Client:
    ensure_gemini_configured()
    return genai.Client(api_key=GEMINI_API_KEY)


def build_financial_context(
    metrics: FinancialMetrics,
    raw_inputs: Mapping[str, Any],
    goals: list[str],
) -> str:
    """
    Turn numeric metrics and user inputs into a natural-language context block.
    """
    goals_text = ", ".join(goals) if goals else "No explicit goals provided."

    return (
        "Here is the user's current financial snapshot (approximate, monthly):\n"
        f"- Savings ratio (portion of income saved): {metrics.savings_ratio:.2%}\n"
        f"- Debt ratio (portion of income to debt payments): {metrics.debt_ratio:.2%}\n"
        f"- Emergency fund target: ${metrics.emergency_fund_target:,.0f}\n"
        f"- Emergency fund gap (additional savings needed): ${metrics.emergency_fund_gap:,.0f}\n"
        f"- Months of expenses currently covered by liquid savings: {metrics.months_of_expenses_covered:.1f}\n\n"
        "User-declared goals or priorities:\n"
        f"- {goals_text}\n\n"
        "Raw numeric inputs (may be approximate):\n"
        f"- Monthly income: ${raw_inputs.get('monthly_income', 0):,.0f}\n"
        f"- Fixed expenses: ${raw_inputs.get('fixed_expenses', 0):,.0f}\n"
        f"- Variable expenses: ${raw_inputs.get('variable_expenses', 0):,.0f}\n"
        f"- Debt payments: ${raw_inputs.get('debt_payments', 0):,.0f}\n"
        f"- Liquid savings: ${raw_inputs.get('liquid_savings', 0):,.0f}\n"
        f"- Risk profile: {raw_inputs.get('risk_profile', 'not specified')}\n"
    )


def get_financial_guidance(
    *,
    metrics: FinancialMetrics,
    raw_inputs: Mapping[str, Any],
    goals: list[str],
    user_question: str | None = None,
) -> str:
    """
    Call Gemini to generate educational financial guidance.
    """
    client = _get_client()

    system_prompt = build_advice_system_prompt()
    context_block = build_financial_context(metrics, raw_inputs, goals)

    if user_question:
        user_prompt = (
            f"{context_block}\n\n"
            "User question (focus on this, but still consider the overall picture):\n"
            f"{user_question}"
        )
    else:
        user_prompt = (
            f"{context_block}\n\n"
            "Please provide a concise, educational overview of this situation, "
            "highlighting budgeting, savings, debt management, and investment "
            "considerations suitable for a beginner."
        )

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=[
            {"role": "system", "parts": [{"text": system_prompt}]},
            {"role": "user", "parts": [{"text": user_prompt}]},
        ],
    )

    # The SDK exposes `.text` as a convenience for the primary text output.
    text = getattr(response, "text", None)
    return text or "I was not able to generate a response. Please try again."


def test_gemini_connectivity() -> str:
    """
    Activity 1.3: quick test prompt to validate connectivity and permissions.
    """
    client = _get_client()
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents="Reply with one short sentence confirming that the Gemini API is working.",
    )
    return getattr(response, "text", "").strip()


if __name__ == "__main__":
    # Simple CLI test for Activity 1.3
    print("Testing Gemini connectivity...")
    try:
        message = test_gemini_connectivity()
        print("Gemini response:", message)
    except Exception as exc:  # pragma: no cover - for manual use
        print("Gemini connectivity test failed:", exc)

