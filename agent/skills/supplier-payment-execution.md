---
skill_id: supplier-payment-execution
process: supplier_payments
purpose: Prepare or execute Stripe Link-backed supplier payments with audit evidence.
required_inputs:
  - approved_payment_decisions
  - execution_mode
decision_rules:
  - Never execute payment without explicit approval when policy requires it.
  - Always return spend_request_id and credential status for simulated or executed payments.
approval_requirements:
  - Execute only after payment decision is ready_to_pay.
output_contract:
  - executed_payments
failure_modes:
  - missing payments service configuration
  - failed Link execution
---
# Supplier Payment Execution

For demos, simulation is acceptable only when it is explicitly requested. Real execution must fail loudly if the payments service or Link CLI configuration is incomplete.
