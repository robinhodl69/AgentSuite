---
skill_id: budget-blocking-policy
process: budget_control
purpose: Block or escalate expenses once critical budget thresholds are exceeded.
required_inputs:
  - budget_decisions
  - budget_policy
decision_rules:
  - Block over-budget expenses when block_on_critical is enabled.
  - Otherwise mark them for manual approval.
approval_requirements:
  - Finance review for blocked or uncategorized expenses.
output_contract:
  - alerts
  - blocked_expenses
failure_modes:
  - policy thresholds missing
  - false positives from misclassification
---
# Budget Blocking Policy

Blocking should be explicit, traceable, and tied to the category threshold that triggered the intervention.

