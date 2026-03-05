AI Financial Advisor
=====================

Overview
--------

AI Financial Advisor is a full-stack web application that provides a personalized, AI-powered financial planning experience. It combines:

- User onboarding and risk profiling
- Goal-based financial planning
- Portfolio simulation and basic asset allocation logic
- An AI-powered conversational assistant to explain recommendations and answer questions

This project is designed as a reference implementation with a clean separation between frontend and backend and room to plug in a real LLM provider.

Tech Stack
----------

- **Backend**: Python, FastAPI, SQLAlchemy, Pydantic, SQLite (dev) / PostgreSQL-ready (prod)
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Auth**: Simple email/password with JWT-based sessions
- **AI Layer**: Pluggable LLM provider abstraction (default: dummy/local reasoning with optional OpenAI-compatible API)

Project Structure
-----------------

The repository is organized as a monorepo with separate frontend and backend folders:

- `backend/` - FastAPI application, database models, services, and AI advisor engine
- `frontend/` - React + TypeScript single-page app with a modern dashboard UI

Getting Started
---------------

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env  # then edit .env to add secrets (e.g. LLM API key)

uvicorn app.main:app --reload
```

The backend will be available at `http://localhost:8000`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at the URL printed in the terminal, typically `http://localhost:5173`.

Environment Configuration
-------------------------

Backend `.env` (see `.env.example` for full list):

- `APP_ENV` - `development` or `production`
- `DATABASE_URL` - Database connection string (defaults to SQLite file `sqlite:///./ai_financial_advisor.db`)
- `JWT_SECRET_KEY` - Secret key for signing JWTs
- `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` - Access token lifetime in minutes
- `LLM_PROVIDER` - `dummy` or `openai` (extensible)
- `LLM_API_KEY` - API key for external LLM (if used)

Frontend `.env`:

- `VITE_API_BASE_URL` - Backend API base URL (e.g. `http://localhost:8000`)

Core Features
-------------

- **User Accounts & Profiles**
  - Sign up / sign in / sign out
  - User profile with age, income, savings, and risk tolerance

- **Goals & Planning**
  - Define financial goals (e.g. retirement, house, education)
  - Basic projections using conservative assumptions

- **Portfolio Simulation**
  - Simple risk-based model portfolios
  - Simulated returns and volatility ranges

- **AI Advisor**
  - Chat-style interface for questions about goals and portfolios
  - Combines rule-based checks (e.g. savings rate, diversification) with LLM-style explanations

Development Notes
-----------------

- This project is structured to be readable and extensible rather than fully production-hardened.
- The AI layer is abstracted via a provider interface; you can plug in any OpenAI-compatible API or keep the default dummy provider for offline development.

Next Steps
----------

- Integrate with a real brokerage or account aggregation API
- Enhance risk modelling and Monte Carlo simulations
- Add multi-currency and tax considerations

