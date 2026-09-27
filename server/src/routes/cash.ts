import { Router } from "express";
import prisma from "../lib/prisma";
import { authenticate, requireAdmin } from "../middleware/auth";
import { PAYMENT_METHODS } from "./orders";

const router = Router();

const ENTRY_TYPES = ["IN", "OUT"];
const CASH_METHODS = PAYMENT_METHODS.filter((m) => m !== "CASH_ON_DELIVERY");

// Admin: list cash entries + summary (optional ?from=ISO&to=ISO&type=IN|OUT)
router.get("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const { from, to, type } = req.query;
    const where: any = {};
    if (type === "IN" || type === "OUT") where.type = String(type);
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(String(from));
      if (to) where.createdAt.lte = new Date(String(to));
    }

    const [entries, sums] = await Promise.all([
      prisma.cashEntry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      prisma.cashEntry.groupBy({
        by: ["type"],
        where,
        _sum: { amount: true },
      }),
    ]);

    const totalIn = sums.find((s) => s.type === "IN")?._sum.amount || 0;
    const totalOut = sums.find((s) => s.type === "OUT")?._sum.amount || 0;

    res.json({ entries, totalIn, totalOut, net: totalIn - totalOut });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cash entries" });
  }
});

// Admin: record a cash in / cash out entry
router.post("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const { type, amount, category, paymentMethod, note } = req.body;

    if (!ENTRY_TYPES.includes(type)) {
      return res.status(400).json({ error: "Type must be IN or OUT" });
    }
    const value = parseFloat(String(amount));
    if (!Number.isFinite(value) || value <= 0) {
      return res.status(400).json({ error: "Amount must be a positive number" });
    }
    if (paymentMethod && !CASH_METHODS.includes(paymentMethod) && paymentMethod !== "CASH_ON_DELIVERY") {
      return res.status(400).json({ error: "Invalid payment method" });
    }

    const entry = await prisma.cashEntry.create({
      data: {
        type,
        amount: Math.round(value * 100) / 100,
        category: String(category || "Other").slice(0, 60),
        paymentMethod: paymentMethod || "CASH",
        note: note ? String(note).slice(0, 500) : null,
        createdBy: req.user?.userId || null,
      },
    });

    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: "Failed to record cash entry" });
  }
});

// Admin: delete a cash entry
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.cashEntry.delete({ where: { id: String(req.params.id) } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: "Entry not found" });
  }
});

export default router;
