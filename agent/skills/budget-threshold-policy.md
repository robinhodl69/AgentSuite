---
skill_id: budget-threshold-policy
process: budget_control
purpose: Compare current and projected spend against monthly category budgets.
required_inputs:
  - budgets
  - categorized_expenses
  - budget_policy
decision_rules:
  - Alert when consumption reaches the alert threshold.
  - Consider projected month-end spend, not only current accumulated spend.
approval_requirements:
  - Escalate when a category lacks a budget definition.
output_contract:
  - budget_decisions
failure_modes:
  - missing month budget
  - late budget uploads
---
# Budget Threshold Policy

The agent should give finance a preventive signal before overspending becomes irreversible. Projected burn rate matters as much as current percentage used.

