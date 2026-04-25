---
skill_id: reconciliation-exceptions
process: reconciliation
purpose: Classify unmatched bank or ledger items into actionable exception buckets.
required_inputs:
  - matched_transactions
  - unmatched_bank_transactions
  - unmatched_ledger_records
decision_rules:
  - Preserve unmatched bank charges as pending bookkeeping work.
  - Preserve unmatched ledger records as collection or accounting follow-up.
approval_requirements: []
output_contract:
  - bank_only_transactions
  - ledger_only_records
  - summary
failure_modes:
  - duplicate movements
  - partial settlements
---
# Reconciliation Exceptions

Summaries must stay finance-friendly and explain whether the user should register a missing charge, mark an invoice as paid, or investigate a discrepancy.

