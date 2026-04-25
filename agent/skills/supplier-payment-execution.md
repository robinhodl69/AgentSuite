---
skill_id: supplier-payment-execution
process: supplier_payments
purpose: Prepare or execute Monad-backed supplier payments with audit evidence.
required_inputs:
  - approved_payment_decisions
  - execution_mode
decision_rules:
  - Never execute payment without explicit approval when policy requires it.
  - Always return tx_hash and explorer URL for simulated or executed payments.
approval_requirements:
  - Execute only after payment decision is ready_to_pay.
output_contract:
  - executed_payments
failure_modes:
  - missing contract configuration
  - failed onchain execution
---
# Supplier Payment Execution

For demos, simulation is acceptable only when it is explicitly requested. Real execution must fail loudly if Monad contract or signer configuration is incomplete.

