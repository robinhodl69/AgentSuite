# Agent demo fixtures

This directory ships with the Railway deploy so you have ready-to-use fixture data for smoke tests and demos.

## What is included

- `reconciliation/bank_statement_demo.csv`: sample bank statement for the reconciliation flow.
- `reconciliation/bank_statement_template.csv`: blank template for your own bank exports.
- `budgets/budget_limits_demo.csv`: sample monthly budgets by category.
- `budgets/budget_limits_template.csv`: blank template for your own budgets.
- `requests/*.json`: ready-to-send API payloads for the current backend endpoints.

## Current backend behavior

- `POST /agent/runs/reconciliation` accepts a JSON payload with the CSV embedded as `statement_csv`.
- `POST /agent/runs/payments/evaluate` and `POST /agent/runs/payments/approve` accept JSON payloads.
- `POST /agent/runs/budgets` currently accepts JSON payloads, not CSV uploads.

## Local or remote test examples

```bash
curl -X POST "$AGENT_BASE_URL/agent/runs/reconciliation" \
  -H "Content-Type: application/json" \
  --data @examples/requests/reconciliation_request_demo.json

curl -X POST "$AGENT_BASE_URL/agent/runs/payments/evaluate" \
  -H "Content-Type: application/json" \
  --data @examples/requests/supplier_payments_evaluate_demo.json

curl -X POST "$AGENT_BASE_URL/agent/runs/payments/approve" \
  -H "Content-Type: application/json" \
  --data @examples/requests/supplier_payments_approve_demo.json

curl -X POST "$AGENT_BASE_URL/agent/runs/budgets" \
  -H "Content-Type: application/json" \
  --data @examples/requests/budget_control_request_demo.json
```

Use the template CSV files as the shape to follow when you create your own demo data.

