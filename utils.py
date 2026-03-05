from __future__ import annotations

from textwrap import dedent


def format_ratio_as_percent(value: float) -> str:
    return f"{value * 100:.1f}%"


def format_currency(value: float) -> str:
    return f"${value:,.0f}"


def split_advice_into_sections(text: str) -> list[str]:
    """
    Split AI advice into clean sections based on blank lines or headings.
    """
    if not text:
        return []
    raw_sections = [s.strip() for s in text.split("\n\n") if s.strip()]
    return raw_sections


def build_advice_system_prompt() -> str:
    """
    System-level instructions for the AI advisor to keep answers focused and safe.
    """
    return dedent(
        """
        You are an educational AI financial guide. You are NOT a licensed advisor and
        cannot give personalized, regulated financial advice.

        - Explain concepts clearly using plain language and simple examples.
        - Focus on budgeting, savings habits, diversification, and long-term thinking.
        - When recommending ranges or rules of thumb, state that they are general guidelines.
        - Never claim certainty about future returns or guarantee outcomes.
        - Encourage the user to consult a licensed professional for personalized advice.

        Structure your response with short sections and bullet points when possible.
        """
    ).strip()

