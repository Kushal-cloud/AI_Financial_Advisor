from typing import Iterable

from .base import AIProvider


class DummyAIProvider(AIProvider):
    async def generate_reply(self, *, prompt: str, history: Iterable[dict]) -> str:
        """
        Simple, deterministic provider that applies a few financial heuristics
        and mirrors back the question with guidance. This is offline-safe.
        """
        lower = prompt.lower()
        tips: list[str] = []

        if "retire" in lower:
            tips.append(
                "For retirement, a common rule of thumb is saving 10-20% of your income, "
                "increasing that percentage if you start later or want to retire earlier."
            )
        if "emergency" in lower or "emergency fund" in lower:
            tips.append(
                "An emergency fund typically covers 3-6 months of essential expenses; "
                "higher job or income volatility often warrants a larger buffer."
            )
        if "risk" in lower or "aggressive" in lower or "conservative" in lower:
            tips.append(
                "Higher expected returns usually come with higher volatility. "
                "Align your risk level with both your time horizon and your ability "
                "to stay invested during market drawdowns."
            )
        if "house" in lower or "home" in lower:
            tips.append(
                "For short- to medium-term goals like buying a home in the next 3-5 years, "
                "consider a more conservative allocation to reduce the chance of needing money "
                "right after a market downturn."
            )

        if not tips:
            tips.append(
                "I can help you think through savings rate, risk level, and timelines for goals "
                "like retirement, buying a home, or building an emergency fund."
            )

        joined_tips = "\n\n".join(tips)
        return (
            "Here's a high-level, educational (not individualized) perspective based on your question:\n\n"
            f"{joined_tips}\n\n"
            "Your question was:\n"
            f"\"{prompt.strip()}\".\n\n"
            "For fully personalized advice that considers your full financial picture, "
            "please consult a licensed financial professional."
        )

