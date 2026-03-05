import textwrap

import numpy as np
import pandas as pd
import streamlit as st

from ai_advisor import get_financial_guidance
from config import ensure_gemini_configured
from finance_analysis import FinancialInputs, analyze_financial_health
from utils import format_currency, format_ratio_as_percent, split_advice_into_sections
from visualization import (
    cashflow_bar_chart,
    emergency_fund_progress_chart,
    expense_breakdown_pie,
)


st.set_page_config(
    page_title="AI Financial Advisor (Streamlit)",
    page_icon="💸",
    layout="wide",
)


def load_custom_css() -> None:
    try:
        with open("styles.css", "r", encoding="utf-8") as f:
            st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)
    except FileNotFoundError:
        pass


load_custom_css()

st.title("AI Financial Advisor")
st.caption(
    "Educational sandbox for budget, savings, and goals — powered by Gemini. Not licensed financial advice."
)


with st.sidebar:
    st.subheader("Household snapshot")
    st.write("Provide monthly numbers for a simplified overview.")

    col_income, col_savings = st.columns(2)
    with col_income:
        monthly_income = st.number_input(
            "Monthly income (after tax)",
            min_value=0.0,
            value=5000.0,
            step=100.0,
        )
    with col_savings:
        liquid_savings = st.number_input(
            "Liquid savings (cash, short-term)",
            min_value=0.0,
            value=15000.0,
            step=500.0,
        )

    fixed_expenses = st.number_input(
        "Fixed expenses (rent, utilities, insurance)",
        min_value=0.0,
        value=2500.0,
        step=100.0,
    )
    variable_expenses = st.number_input(
        "Variable expenses (groceries, dining, lifestyle)",
        min_value=0.0,
        value=1200.0,
        step=100.0,
    )
    debt_payments = st.number_input(
        "Monthly debt payments (loans, cards)",
        min_value=0.0,
        value=400.0,
        step=50.0,
    )

    risk_profile = st.selectbox(
        "Risk profile",
        ["Conservative", "Moderate", "Aggressive"],
        index=1,
    )

    st.markdown("---")
    st.subheader("Goals")
    goals = st.multiselect(
        "What are you mainly planning for?",
        ["Build emergency fund", "Pay down debt", "Retirement", "Buy a home", "Education", "Travel", "Other"],
        default=["Build emergency fund", "Retirement"],
    )

    st.markdown("---")
    st.subheader("AI question (optional)")
    user_question = st.text_area(
        "Ask a question for the AI to focus on, or leave blank for a general overview.",
        height=80,
        placeholder="Example: How should I balance paying off debt vs saving for an emergency fund?",
    )

    run_analysis = st.button("Run analysis", type="primary")


inputs = FinancialInputs(
    monthly_income=monthly_income,
    fixed_expenses=fixed_expenses,
    variable_expenses=variable_expenses,
    debt_payments=debt_payments,
    liquid_savings=liquid_savings,
    risk_profile=risk_profile,
)

metrics = analyze_financial_health(inputs)

overview_tab, chatbot_tab, goals_tab = st.tabs(
    ["📊 Financial overview", "🤖 AI chatbot", "🎯 Goals & action plan"]
)


with overview_tab:
    st.subheader("Summary metrics")
    col1, col2, col3, col4 = st.columns(4)

    total_expenses_val = inputs.fixed_expenses + inputs.variable_expenses
    monthly_savings_val = max(inputs.monthly_income - total_expenses_val, 0.0)

    def _savings_badge():
        r = metrics.savings_ratio
        if r >= 0.2:
            return '<span class="metric-badge metric-badge--ok">Healthy</span>'
        if r >= 0.1:
            return '<span class="metric-badge metric-badge--warn">Moderate</span>'
        return '<span class="metric-badge metric-badge--risk">Low</span>'

    def _emergency_badge():
        m = metrics.months_of_expenses_covered
        if m >= 6:
            return '<span class="metric-badge metric-badge--ok">OK</span>'
        if m >= 3:
            return '<span class="metric-badge metric-badge--warn">Building</span>'
        return '<span class="metric-badge metric-badge--risk">Low</span>'

    with col1:
        st.metric(
            "Savings rate",
            format_ratio_as_percent(metrics.savings_ratio),
            help="Portion of income left after expenses.",
        )
        st.markdown(_savings_badge(), unsafe_allow_html=True)
    with col2:
        st.metric(
            "Debt ratio",
            format_ratio_as_percent(metrics.debt_ratio),
            help="Portion of income going to debt payments.",
        )
    with col3:
        st.metric(
            "Emergency fund target",
            format_currency(metrics.emergency_fund_target),
            help="Suggested buffer based on your expenses and risk profile.",
        )
    with col4:
        st.metric(
            "Months of expenses covered",
            f"{metrics.months_of_expenses_covered:.1f} months",
            help="How long your current liquid savings could cover expenses.",
        )
        st.markdown(_emergency_badge(), unsafe_allow_html=True)

    st.markdown("### Cashflow and expenses")
    col_cf, col_exp = st.columns(2)
    with col_cf:
        fig_cf = cashflow_bar_chart(
            income=inputs.monthly_income,
            total_expenses=total_expenses_val,
            savings=monthly_savings_val,
        )
        st.pyplot(fig_cf, use_container_width=True)
    with col_exp:
        fig_exp = expense_breakdown_pie(
            fixed_expenses=inputs.fixed_expenses,
            variable_expenses=inputs.variable_expenses,
        )
        st.pyplot(fig_exp, use_container_width=True)

    st.markdown("### Emergency fund readiness")
    fig_ef = emergency_fund_progress_chart(
        current_savings=inputs.liquid_savings,
        target_savings=metrics.emergency_fund_target,
    )
    st.pyplot(fig_ef, use_container_width=True)

    readiness = np.clip(metrics.months_of_expenses_covered / 6.0, 0.0, 1.0)
    st.progress(readiness, text="Progress toward a 6-month emergency buffer")


with chatbot_tab:
    st.subheader("Conversational guidance")
    st.write(
        "This chatbot provides educational guidance only and cannot replace a licensed "
        "financial advisor."
    )

    if "chat_history" not in st.session_state:
        st.session_state.chat_history = []

    for msg in st.session_state.chat_history:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    prompt = st.chat_input("Ask a question about your budget, savings, or goals...")

    if prompt or (run_analysis and not prompt and not st.session_state.chat_history):
        question = prompt or user_question
        with st.chat_message("user"):
            st.markdown(question or "Give me a high-level overview of my situation.")

        st.session_state.chat_history.append({"role": "user", "content": question or ""})

        with st.chat_message("assistant"):
            with st.spinner("Thinking with Gemini..."):
                ensure_gemini_configured()
                guidance = get_financial_guidance(
                    metrics=metrics,
                    raw_inputs={
                        "monthly_income": inputs.monthly_income,
                        "fixed_expenses": inputs.fixed_expenses,
                        "variable_expenses": inputs.variable_expenses,
                        "debt_payments": inputs.debt_payments,
                        "liquid_savings": inputs.liquid_savings,
                        "risk_profile": inputs.risk_profile,
                    },
                    goals=goals,
                    user_question=question,
                )

                sections = split_advice_into_sections(guidance)
                for section in sections:
                    st.markdown(textwrap.dedent(section).strip())
                    st.markdown("---")

        st.session_state.chat_history.append({"role": "assistant", "content": guidance})


with goals_tab:
    st.subheader("Goal-based planning")
    st.write(
        "Rough heuristics to think about saving toward your goals. This is intentionally simple "
        "and should not be treated as a strict prescription."
    )

    if not goals:
        st.info("Select at least one goal in the sidebar to see a rough breakdown.")
    else:
        total_monthly_savings = max(inputs.monthly_income - total_expenses_val, 0.0)
        if total_monthly_savings <= 0:
            st.warning(
                "Right now your expenses are equal to or above your income. "
                "Consider reducing costs or increasing income before assigning money to goals."
            )
        else:
            st.write("A simple suggested allocation of your monthly savings might look like:")
            base_alloc = 1.0 / len(goals)
            df_rows = []
            for g in goals:
                weight = base_alloc
                if "emergency" in g.lower():
                    weight += 0.15
                if "debt" in g.lower():
                    weight += 0.1
                allocation = total_monthly_savings * (weight / (base_alloc * len(goals) + 0.25))
                df_rows.append(
                    {
                        "Goal": g,
                        "Suggested monthly amount": allocation,
                    }
                )

            df = pd.DataFrame(df_rows)
            df["Suggested monthly amount"] = df["Suggested monthly amount"].apply(format_currency)
            st.dataframe(df, use_container_width=True, hide_index=True)

    st.markdown("---")
    st.caption(
        "All figures are simplified and rounded. For tax-aware, product-specific, or legally "
        "binding guidance, work with a licensed advisor."
    )

