---
skill_id: reconciliation-match
process: reconciliation
purpose: Match bank transactions to invoices and expense records with deterministic rules first.
required_inputs:
  - statement_transactions
  - sales_invoices
  - expense_records
decision_rules:
  - Require amount tolerance of plus or minus 0.01.
  - Require posting date to be within one day unless explicitly overridden.
  - Prefer exact reference, RFC, invoice id, or vendor name matches.
approval_requirements: []
output_contract:
  - matched_transactions
  - manual_review
failure_modes:
  - ambiguous candidate matches
  - malformed statement rows
---
# Reconciliation Match

Use deterministic scoring for amount, date proximity, and textual references. Only escalate to LLM tie-breaking when multiple candidates have the same highest score and text evidence is still ambiguous.

