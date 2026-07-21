import { Router } from "express";
import prisma from "../lib/prisma";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

// Public: get all available food items
router.get("/", async (req, res) => {
  try {
    const category = String(req.query.category || "");
    const search = String(req.query.search || "");
    const featured = String(req.query.featured || "");
    const limit = String(req.query.limit || "50");
    const offset = String(req.query.offset || "0");

    const where: any = { isAvailable: true };
    if (category) where.category = { slug: category };
    if (featured === "true") where.isFeatured = true;
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.foodItem.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          reviews: { where: { isApproved: true }, select: { rating: true } },
        },
        orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
        take: parseInt(String(limit)),
        skip: parseInt(String(offset)),
      }),
      prisma.foodItem.count({ where }),
    ]);

    const foodWithRating = items.map((item) => {
      const ratings = item.reviews.map((r) => r.rating);
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
      return { ...item, avgRating, reviewCount: ratings.length, reviews: undefined };
    });

    res.json({ items: foodWithRating, total });
  } catch (err) {
    console.error("Get food error:", err);
    res.status(500).json({ error: "Failed to fetch food items" });
  }
});

// Admin: get all food items (including unavailable)
router.get("/admin/all", authenticate, requireAdmin, async (req, res) => {
  try {
    const category = String(req.query.category || "");
    const search = String(req.query.search || "");
    const limit = String(req.query.limit || "100");
    const offset = String(req.query.offset || "0");

    const where: any = {};
    if (category) where.category = { slug: category };
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.foodItem.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { orderItems: true } },
        },
        orderBy: { name: "asc" },
        take: parseInt(String(limit)),
        skip: parseInt(String(offset)),
      }),
      prisma.foodItem.count({ where }),
    ]);

    res.json({ items, total });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch food items" });
  }
});

// Public: get single food item
router.get("/:slug", async (req, res) => {
  try {
    const item = await prisma.foodItem.findUnique({
      where: { slug: String(req.params.slug) },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: "desc" },
          take: 20,
          select: { id: true, rating: true, comment: true, customerName: true, createdAt: true },
        },
      },
    });

    if (!item) return res.status(404).json({ error: "Food item not found" });

    const ratings = item.reviews.map((r) => r.rating);
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

    res.json({ ...item, avgRating, reviewCount: ratings.length });
  } catch (err) {
    console.error("Get food item error:", err);
    res.status(500).json({ error: "Failed to fetch food item" });
  }
});

// Admin: create food item
router.post("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, categoryId, image, thumbnail, ingredients, preparationTime, stockQuantity, isAvailable, isFeatured } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: "Name and price are required" });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();

    const item = await prisma.foodItem.create({
      data: {
        name,
        slug,
        description: description || null,
        price: parseFloat(String(price)),
        categoryId: categoryId || null,
        image: image || null,
        thumbnail: thumbnail || null,
        ingredients: ingredients || null,
        preparationTime: preparationTime ? parseInt(String(preparationTime)) : null,
        stockQuantity: stockQuantity !== undefined ? parseInt(String(stockQuantity)) : 0,
        isAvailable: isAvailable !== false,
        isFeatured: isFeatured === true,
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    res.status(201).json(item);
  } catch (err) {
    console.error("Create food error:", err);
    res.status(500).json({ error: "Failed to create food item" });
  }
});

// Admin: update food item
router.patch("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, categoryId, image, thumbnail, ingredients, preparationTime, stockQuantity, isAvailable, isFeatured } = req.body;

    const data: any = {};
    if (name !== undefined) {
      data.name = name;
      // Only update slug if name changes significantly
      data.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();
    }
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = parseFloat(String(price));
    if (categoryId !== undefined) data.categoryId = categoryId || null;
    if (image !== undefined) data.image = image;
    if (thumbnail !== undefined) data.thumbnail = thumbnail;
    if (ingredients !== undefined) data.ingredients = ingredients;
    if (preparationTime !== undefined) data.preparationTime = preparationTime ? parseInt(String(preparationTime)) : null;
    if (stockQuantity !== undefined) data.stockQuantity = parseInt(String(stockQuantity));
    if (isAvailable !== undefined) data.isAvailable = isAvailable;
    if (isFeatured !== undefined) data.isFeatured = isFeatured;

    const item = await prisma.foodItem.update({
      where: { id: String(req.params.id) },
      data,
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    res.json(item);
  } catch (err) {
    console.error("Update food error:", err);
    res.status(500).json({ error: "Failed to update food item" });
  }
});

// Admin: delete food item
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.foodItem.delete({ where: { id: String(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    console.error("Delete food error:", err);
    res.status(500).json({ error: "Failed to delete food item" });
  }
});

export default router;
