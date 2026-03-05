from __future__ import annotations

from typing import Sequence

import matplotlib.pyplot as plt
import seaborn as sns


sns.set_theme(style="darkgrid")


def cashflow_bar_chart(
    income: float,
    total_expenses: float,
    savings: float,
):
    """
    Bar chart comparing income, expenses, and savings.
    """
    labels: Sequence[str] = ["Income", "Expenses", "Savings"]
    values: Sequence[float] = [income, total_expenses, max(savings, 0.0)]
    colors = ["#22c55e", "#f97316", "#38bdf8"]

    fig, ax = plt.subplots(figsize=(5, 3))
    ax.bar(labels, values, color=colors)
    ax.set_ylabel("Amount")
    ax.set_title("Monthly cashflow overview")
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    return fig


def expense_breakdown_pie(
    fixed_expenses: float,
    variable_expenses: float,
):
    """
    Pie chart of fixed vs variable expenses.
    """
    fixed = max(fixed_expenses, 0.0)
    variable = max(variable_expenses, 0.0)
    total = fixed + variable
    if total <= 0:
        fixed = variable = 1.0

    fig, ax = plt.subplots(figsize=(4, 4))
    ax.pie(
        [fixed, variable],
        labels=["Fixed", "Variable"],
        autopct="%1.0f%%",
        colors=["#60a5fa", "#f97316"],
        startangle=90,
        wedgeprops={"linewidth": 1, "edgecolor": "white"},
    )
    ax.set_title("Expense mix")
    return fig


def emergency_fund_progress_chart(
    current_savings: float,
    target_savings: float,
):
    """
    Bar chart comparing current and target emergency fund.
    """
    current = max(current_savings, 0.0)
    target = max(target_savings, 0.0)

    labels = ["Current", "Target"]
    values = [current, target]
    colors = ["#22c55e", "#e5e7eb"]

    fig, ax = plt.subplots(figsize=(5, 3))
    ax.bar(labels, values, color=colors)
    ax.set_ylabel("Amount")
    ax.set_title("Emergency fund status")
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    return fig

