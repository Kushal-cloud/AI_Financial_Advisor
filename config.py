import os

from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


def ensure_gemini_configured() -> None:
  """
  Ensure the Gemini API key is present.

  Streamlit will surface this error clearly if the key is missing.
  """
  if not GEMINI_API_KEY:
    raise RuntimeError(
      "GEMINI_API_KEY is not set. Create a .env file based on .env.example "
      "and add your Gemini API key from Google AI Studio."
    )

