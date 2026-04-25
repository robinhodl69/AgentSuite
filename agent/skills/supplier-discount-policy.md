---
skill_id: supplier-discount-policy
process: supplier_payments
purpose: Decide whether a supplier invoice qualifies for early-payment optimization.
required_inputs:
  - supplier_invoices
  - payment_policy
decision_rules:
  - Supplier must be strategic.
  - Discount must exceed the configured threshold.
  - Discount window must still be open.
approval_requirements:
  - Manual approval when configured threshold is crossed.
output_contract:
  - payment_decisions
failure_modes:
  - expired discount windows
  - duplicated invoices
---
# Supplier Discount Policy

Optimize for real cash savings without sacrificing controls. The agent must explain why each invoice is ready, waiting, blocked, or pending approval.

