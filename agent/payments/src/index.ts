import { randomUUID } from "crypto";
import express from "express";
import routes from "./routes";

function logStructured(event: string, data: Record<string, unknown>): void {
  console.log(JSON.stringify({ event, timestamp: new Date().toISOString(), ...data }));
}

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  const requestId = req.header("x-request-id") || randomUUID();
  const startedAt = Date.now();
  res.setHeader("x-request-id", requestId);
  res.on("finish", () => {
    logStructured("request_completed", {
      request_id: requestId,
      method: req.method,
      path: req.originalUrl,
      status_code: res.statusCode,
      duration_ms: Date.now() - startedAt,
    });
  });
  next();
});
app.use(routes);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const HOST = process.env.HOST || "127.0.0.1";

app.listen(PORT, HOST, () => {
  logStructured("service_started", {
    service: "payments",
    host: HOST,
    port: PORT,
  });
});
