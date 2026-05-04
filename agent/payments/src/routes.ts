import { Router, Request, Response } from "express";
import {
  authStatus,
  authLogin,
  listPaymentMethods,
  createSpendRequest,
  retrieveSpendRequest,
  requestApproval,
} from "./linkCli";

const router = Router();

router.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

router.get("/auth/status", async (_req: Request, res: Response) => {
  try {
    const result = await authStatus();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ detail: err.message || "Auth status failed" });
  }
});

router.post("/auth/login", async (_req: Request, res: Response) => {
  try {
    const result = await authLogin();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ detail: err.message || "Auth login failed" });
  }
});

router.get("/payment-methods", async (_req: Request, res: Response) => {
  try {
    const result = await listPaymentMethods();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ detail: err.message || "List payment methods failed" });
  }
});

router.post("/spend-request", async (req: Request, res: Response) => {
  try {
    const result = await createSpendRequest(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ detail: err.message || "Create spend request failed", code: err.code });
  }
});

router.get("/spend-request/:id", async (req: Request, res: Response) => {
  try {
    const result = await retrieveSpendRequest(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ detail: err.message || "Retrieve spend request failed", code: err.code });
  }
});

router.post("/spend-request/:id/request-approval", async (req: Request, res: Response) => {
  try {
    const result = await requestApproval(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ detail: err.message || "Request approval failed", code: err.code });
  }
});

export default router;
