---
skill_id: supplier-cash-check
process: supplier_payments
purpose: Guard discounted payments with projected cash-position checks.
required_inputs:
  - cash_position
  - cash_forecast
  - payment_policy
decision_rules:
  - Respect minimum cash reserve after payment.
  - Consider projected inflows and outflows inside the configured horizon.
approval_requirements:
  - Escalate when reserve would be violated.
output_contract:
  - liquidity_decisions
failure_modes:
  - inaccurate forecast inputs
  - stale balances
---
# Supplier Cash Check

The agent should protect working capital first. Discounts are desirable only when they do not jeopardize near-term obligations or reserve thresholds.

