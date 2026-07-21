import path from "path";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { v4 as uuid } from "uuid";
import { addClient } from "./lib/notifications";
import { verifyToken } from "./lib/auth";
import authRoutes from "./routes/auth";
import categoryRoutes from "./routes/categories";
import foodRoutes from "./routes/food";
import orderRoutes from "./routes/orders";
import reviewRoutes from "./routes/reviews";
import uploadRoutes from "./routes/uploads";

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers
app.use(helmet());

// CORS
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim())
  : ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"];
app.use(cors({ origin: corsOrigins, credentials: true }));

// Body parsing with reduced limit
app.use(express.json({ limit: "500kb" }));
app.use(express.urlencoded({ extended: true, limit: "500kb" }));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const orderLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many orders, please slow down" },
  standardHeaders: true,
  legacyHeaders: false,
});

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth", authLimiter);
app.use("/api/orders", orderLimiter);
app.use("/api", globalLimiter);

// Serve uploaded files
app.use("/uploads", express.static(path.resolve(process.env.UPLOAD_DIR || "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin/uploads", uploadRoutes);

// SSE endpoint for admin notifications (authenticated)
app.get("/api/admin/notifications/stream", (req, res) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const token = header.split(" ")[1];
    const user = verifyToken(token);
    if (user.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  const clientId = uuid();
  addClient(clientId, res);
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(__dirname, "../../client/dist");
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

// Graceful shutdown
const server = app.listen(PORT, () => {
  console.log(`Sana Hotel API running on http://localhost:${PORT}`);
});

function shutdown(signal: string) {
  console.log(`${signal} received, shutting down gracefully...`);
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export default app;
