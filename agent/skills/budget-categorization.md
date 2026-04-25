---
skill_id: budget-categorization
process: budget_control
purpose: Categorize operating expenses into budget buckets using rules first and LLM only when necessary.
required_inputs:
  - budgets
  - expenses
decision_rules:
  - Prefer deterministic keyword rules over inference.
  - Use LLM only for ambiguous text descriptions.
approval_requirements: []
output_contract:
  - categorized_expenses
failure_modes:
  - unsupported categories
  - vague descriptions
---
# Budget Categorization

Expense classification should remain explainable. The final category must be easy to audit from the original vendor or description text.

