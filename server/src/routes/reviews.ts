import { Router } from "express";
import prisma from "../lib/prisma";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

// Public: get approved reviews for a food item
router.get("/food/:foodItemId", async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { foodItemId: req.params.foodItemId, isApproved: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// Client: create review (must have delivered order with the item)
router.post("/", authenticate, async (req, res) => {
  try {
    const { foodItemId, orderId, rating, comment, customerName } = req.body;

    if (!foodItemId || !rating) {
      return res.status(400).json({ error: "Food item and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Check if user has a delivered order with this item
    if (orderId) {
      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          customerId: req.user!.userId,
          status: "DELIVERED",
          items: { some: { foodItemId } },
        },
      });

      if (!order) {
        return res.status(403).json({ error: "You can only review items from delivered orders" });
      }

      // Check for duplicate review
      const existing = await prisma.review.findFirst({
        where: { foodItemId, orderId, customerId: req.user!.userId },
      });

      if (existing) {
        return res.status(409).json({ error: "You already reviewed this item for this order" });
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { name: true },
    });

    const review = await prisma.review.create({
      data: {
        foodItemId,
        customerId: req.user!.userId,
        orderId: orderId || null,
        rating: parseInt(String(rating)),
        comment: comment || null,
        customerName: customerName || user?.name || "Guest",
        isApproved: false, // Requires admin approval
      },
    });

    res.status(201).json(review);
  } catch (err) {
    console.error("Create review error:", err);
    res.status(500).json({ error: "Failed to create review" });
  }
});

// Admin: get all reviews
router.get("/admin", authenticate, requireAdmin, async (req, res) => {
  try {
    const { approved } = req.query;
    const where: any = {};
    if (approved === "true") where.isApproved = true;
    if (approved === "false") where.isApproved = false;

    const reviews = await prisma.review.findMany({
      where,
      include: {
        foodItem: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// Admin: approve review
router.patch("/admin/:id/approve", authenticate, requireAdmin, async (req, res) => {
  try {
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { isApproved: true },
    });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: "Failed to approve review" });
  }
});

// Admin: hide review
router.patch("/admin/:id/hide", authenticate, requireAdmin, async (req, res) => {
  try {
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { isApproved: false },
    });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: "Failed to hide review" });
  }
});

// Admin: delete review
router.delete("/admin/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.review.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;
