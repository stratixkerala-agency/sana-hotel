import { Router } from "express";
import prisma from "../lib/prisma";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

// Public: get active categories
router.get("/", async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { foodItems: { where: { isAvailable: true } } } } },
    });
    res.json(categories);
  } catch (err) {
    console.error("Get categories error:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Admin: get all categories
router.get("/admin", authenticate, requireAdmin, async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { foodItems: true } } },
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Admin: create category
router.post("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, image, sortOrder, isActive } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const category = await prisma.category.create({
      data: { name, slug, image: image || null, sortOrder: sortOrder || 0, isActive: isActive !== false },
    });

    res.status(201).json(category);
  } catch (err: any) {
    if (err?.code === "P2002") {
      return res.status(409).json({ error: "Category name already exists" });
    }
    console.error("Create category error:", err);
    res.status(500).json({ error: "Failed to create category" });
  }
});

// Admin: update category
router.patch("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, image, sortOrder, isActive } = req.body;
    const data: any = {};
    if (name !== undefined) {
      data.name = name;
      data.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    }
    if (image !== undefined) data.image = image;
    if (sortOrder !== undefined) data.sortOrder = sortOrder;
    if (isActive !== undefined) data.isActive = isActive;

    const category = await prisma.category.update({ where: { id: req.params.id }, data });
    res.json(category);
  } catch (err) {
    console.error("Update category error:", err);
    res.status(500).json({ error: "Failed to update category" });
  }
});

// Admin: delete category
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error("Delete category error:", err);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

export default router;
