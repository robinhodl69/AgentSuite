import { spawn } from "child_process";
import { resolve } from "path";

const IS_MOCK = process.env.MOCK_PAYMENTS === "true";

export interface SpendRequestInput {
  payment_method_id: string;
  merchant_name: string;
  merchant_url: string;
  context: string;
  amount: number;
  currency?: string;
  line_items?: Array<{ name: string; unit_amount: number; quantity: number }>;
  total?: { type: string; display_text: string; amount: number };
  test?: boolean;
  request_approval?: boolean;
}

export interface SpendRequestOutput {
  id: string;
  status: string;
  approval_url?: string;
  card?: {
    number?: string;
    cvc?: string;
    exp_month?: number;
    exp_year?: number;
    last4?: string;
    billing_address?: Record<string, unknown>;
    valid_until?: string;
  };
  shared_payment_token?: string;
  [key: string]: unknown;
}

const LINK_CLI_PATH = resolve(__dirname, "../node_modules/.bin/link-cli");

function execLinkCli(args: string[]): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const child = spawn(LINK_CLI_PATH, [...args, "--format", "json"], {
      shell: false,
      env: process.env,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      const output = stdout.trim();
      if (!output) {
        reject(new Error(stderr.trim() || "link-cli produced no output"));
        return;
      }
      try {
        const parsed = JSON.parse(output);
        if (code !== 0) {
          const errorPayload = parsed as { code?: string; message?: string };
          const err = new Error(
            errorPayload.message || `link-cli exited with code ${code}`
          );
          (err as any).code = errorPayload.code || "LINK_CLI_ERROR";
          reject(err);
          return;
        }
        resolve(parsed);
      } catch {
        reject(new Error(`Invalid JSON from link-cli: ${output}`));
      }
    });

    child.on("error", (err) => {
      reject(err);
    });
  });
}

/* ────────── Mock implementations (for local dev without Stripe region access) ────────── */

let _mockAuth = false;

function mockAuthStatus() {
  return { authenticated: _mockAuth, credentials_path: "/mock/config.json" };
}

function mockAuthLogin() {
  _mockAuth = true;
  return {
    authenticated: true,
    message: "Mock authentication enabled. No real Stripe Link connection.",
  };
}

function mockPaymentMethods() {
  return {
    payment_methods: [
      {
        id: "mock_pm_001",
        type: "card",
        card: { brand: "visa", last4: "4242", exp_month: 12, exp_year: 2027 },
      },
    ],
  };
}

let _mockSpendIdCounter = 0;

function mockCard() {
  return {
    number: "4242424242424242",
    cvc: "123",
    exp_month: 12,
    exp_year: 2027,
    last4: "4242",
    billing_address: {
      name: "Mock User",
      line1: "123 Mock St",
      city: "Mock City",
      state: "CA",
      postal_code: "12345",
      country: "US",
    },
    valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

function mockCreateSpendRequest(input: SpendRequestInput): SpendRequestOutput {
  _mockSpendIdCounter += 1;
  const id = `mock_spend_${Date.now()}_${_mockSpendIdCounter}`;

  if (input.request_approval) {
    return {
      id,
      status: "approved",
      approval_url: "https://app.link.com/mock/approve",
      card: mockCard(),
    };
  }

  return {
    id,
    status: "approved",
    card: mockCard(),
  };
}

function mockRetrieveSpendRequest(id: string): SpendRequestOutput {
  return {
    id,
    status: "approved",
    card: {
      number: "4242424242424242",
      cvc: "123",
      exp_month: 12,
      exp_year: 2027,
      last4: "4242",
      billing_address: {
        name: "Mock User",
        line1: "123 Mock St",
        city: "Mock City",
        state: "CA",
        postal_code: "12345",
        country: "US",
      },
      valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  };
}

function mockRequestApproval(id: string): SpendRequestOutput {
  return {
    id,
    status: "approved",
    card: {
      number: "4242424242424242",
      cvc: "123",
      exp_month: 12,
      exp_year: 2027,
      last4: "4242",
      billing_address: {
        name: "Mock User",
        line1: "123 Mock St",
        city: "Mock City",
        state: "CA",
        postal_code: "12345",
        country: "US",
      },
      valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  };
}

/* ────────── Public API ────────── */

export async function authStatus(): Promise<unknown> {
  if (IS_MOCK) return mockAuthStatus();
  return execLinkCli(["auth", "status"]);
}

export async function authLogin(): Promise<unknown> {
  if (IS_MOCK) return mockAuthLogin();
  return execLinkCli(["auth", "login"]);
}

export async function listPaymentMethods(): Promise<unknown> {
  if (IS_MOCK) return mockPaymentMethods();
  return execLinkCli(["payment-methods", "list"]);
}

function buildSpendRequestArgs(input: SpendRequestInput): string[] {
  const args: string[] = [
    "spend-request",
    "create",
    "--payment-method-id",
    input.payment_method_id,
    "--merchant-name",
    input.merchant_name,
    "--merchant-url",
    input.merchant_url,
    "--context",
    input.context,
    "--amount",
    String(input.amount),
  ];

  if (input.currency) {
    args.push("--currency", input.currency);
  }

  if (input.line_items && input.line_items.length > 0) {
    for (const item of input.line_items) {
      args.push(
        "--line-item",
        `name:${item.name},unit_amount:${item.unit_amount},quantity:${item.quantity}`
      );
    }
  }

  if (input.total) {
    args.push(
      "--total",
      `type:${input.total.type},display_text:${input.total.display_text},amount:${input.total.amount}`
    );
  }

  if (input.test) {
    args.push("--test");
  }

  if (input.request_approval) {
    args.push("--request-approval");
  }

  return args;
}

export async function createSpendRequest(
  input: SpendRequestInput
): Promise<SpendRequestOutput> {
  if (IS_MOCK) return mockCreateSpendRequest(input);
  const result = (await execLinkCli(buildSpendRequestArgs(input))) as SpendRequestOutput;
  return result;
}

export async function retrieveSpendRequest(id: string): Promise<SpendRequestOutput> {
  if (IS_MOCK) return mockRetrieveSpendRequest(id);
  const result = (await execLinkCli([
    "spend-request",
    "retrieve",
    id,
    "--include",
    "card",
  ])) as SpendRequestOutput;
  return result;
}

export async function requestApproval(id: string): Promise<SpendRequestOutput> {
  if (IS_MOCK) return mockRequestApproval(id);
  const result = (await execLinkCli([
    "spend-request",
    "request-approval",
    id,
  ])) as SpendRequestOutput;
  return result;
}
