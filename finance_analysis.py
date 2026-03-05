from __future__ import annotations

from dataclasses import dataclass


@dataclass
class FinancialInputs:
    monthly_income: float
    fixed_expenses: float
    variable_expenses: float
    debt_payments: float
    liquid_savings: float
    risk_profile: str


@dataclass
class FinancialMetrics:
    savings_ratio: float  # portion of income saved (0-1)
    debt_ratio: float  # portion of income going to debt (0-1)
    emergency_fund_target: float  # recommended emergency fund amount
    emergency_fund_gap: float  # how much more is needed
    months_of_expenses_covered: float  # current savings / monthly expenses


def _safe_divide(numerator: float, denominator: float) -> float:
    if denominator <= 0:
        return 0.0
    return numerator / denominator


def calculate_savings_ratio(income: float, total_expenses: float) -> float:
    """
    Savings ratio = (income - expenses) / income.
    If income <= 0, returns 0.
    """
    savings = max(income - total_expenses, 0.0)
    return _safe_divide(savings, income)


def calculate_debt_ratio(income: float, debt_payments: float) -> float:
    """
    Debt ratio = debt payments / income.
    If income <= 0, returns 0.
    """
    return _safe_divide(debt_payments, income)


def calculate_emergency_fund_target(
    monthly_expenses: float,
    risk_profile: str,
) -> float:
    """
    Emergency fund target in currency units.

    - Conservative / unstable income: 6 months
    - Moderate: 4-5 months
    - Aggressive / very stable: 3 months
    """
    profile = (risk_profile or "").lower()
    if "conservative" in profile:
        months = 6
    elif "aggressive" in profile:
        months = 3
    else:
        months = 4.5
    return max(monthly_expenses, 0.0) * months


def analyze_financial_health(inputs: FinancialInputs) -> FinancialMetrics:
    total_expenses = max(inputs.fixed_expenses + inputs.variable_expenses, 0.0)
    monthly_income = max(inputs.monthly_income, 0.0)

    savings_ratio = calculate_savings_ratio(monthly_income, total_expenses)
    debt_ratio = calculate_debt_ratio(monthly_income, max(inputs.debt_payments, 0.0))

    monthly_expenses_for_emergency = total_expenses + max(inputs.debt_payments, 0.0)
    emergency_target = calculate_emergency_fund_target(
        monthly_expenses_for_emergency, inputs.risk_profile
    )
    emergency_gap = max(emergency_target - max(inputs.liquid_savings, 0.0), 0.0)

    months_of_expenses_covered = _safe_divide(
        max(inputs.liquid_savings, 0.0), monthly_expenses_for_emergency
    )

    return FinancialMetrics(
        savings_ratio=savings_ratio,
        debt_ratio=debt_ratio,
        emergency_fund_target=emergency_target,
        emergency_fund_gap=emergency_gap,
        months_of_expenses_covered=months_of_expenses_covered,
    )

