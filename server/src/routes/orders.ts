import { Router } from "express";
import prisma from "../lib/prisma";
import { authenticate, requireAdmin, optionalAuth } from "../middleware/auth";
import { broadcast } from "../lib/notifications";

const router = Router();

// Client: create order
router.post("/", optionalAuth, async (req, res) => {
  try {
    const { customerName, customerPhone, deliveryType, roomNumber, deliveryAddress, deliveryNotes, items } = req.body;

    if (!customerName || !customerPhone || !items || items.length === 0) {
      return res.status(400).json({ error: "Customer info and at least one item are required" });
    }

    if (deliveryType === "ROOM" && !roomNumber) {
      return res.status(400).json({ error: "Room number is required for room delivery" });
    }
    if (deliveryType === "LOCATION" && !deliveryAddress) {
      return res.status(400).json({ error: "Delivery address is required" });
    }

    // Validate items and stock
    const foodItemIds = items.map((i: any) => i.foodItemId);
    const foodItems = await prisma.foodItem.findMany({
      where: { id: { in: foodItemIds }, isAvailable: true },
    });

    if (foodItems.length !== items.length) {
      return res.status(400).json({ error: "Some items are no longer available" });
    }

    let subtotal = 0;
    const orderItems = items.map((item: any) => {
      const food = foodItems.find((f) => f.id === item.foodItemId);
      if (!food) throw new Error("Item not found");
      if (food.stockQuantity < item.quantity) {
        throw new Error(`${food.name} is out of stock (requested: ${item.quantity}, available: ${food.stockQuantity})`);
      }
      const quantity = parseInt(String(item.quantity));
      const totalPrice = food.price * quantity;
      subtotal += totalPrice;
      return {
        foodItemId: food.id,
        foodName: food.name,
        unitPrice: food.price,
        quantity,
        totalPrice,
      };
    });

    const deliveryFee = deliveryType === "ROOM" ? 0 : 50;
    const total = subtotal + deliveryFee;

    const orderNumber = "ORD-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();

    // Create order and update stock in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Decrease stock
      for (const item of orderItems) {
        const updated = await tx.foodItem.update({
          where: { id: item.foodItemId },
          data: {
            stockQuantity: { decrement: item.quantity },
          },
        });
        // Auto-unset available if stock hits 0
        if (updated.stockQuantity <= 0) {
          await tx.foodItem.update({
            where: { id: item.foodItemId },
            data: { isAvailable: false },
          });
        }
      }

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: req.user?.userId || null,
          customerName,
          customerPhone,
          deliveryType: deliveryType || "ROOM",
          roomNumber: roomNumber || null,
          deliveryAddress: deliveryAddress || null,
          deliveryNotes: deliveryNotes || null,
          subtotal,
          deliveryFee,
          total,
          paymentMethod: "CASH_ON_DELIVERY",
          status: "PENDING",
          items: { create: orderItems },
        },
        include: {
          items: { include: { foodItem: { select: { id: true, name: true, image: true } } } },
        },
      });

      // Create notification
      await tx.notification.create({
        data: {
          orderId: newOrder.id,
          type: "NEW_ORDER",
          message: `New order ${orderNumber} from ${customerName} - ${items.length} items`,
        },
      });

      return newOrder;
    });

    // Broadcast to admin clients
    broadcast("new_order", { order });

    res.status(201).json(order);
  } catch (err: any) {
    console.error("Create order error:", err);
    res.status(400).json({ error: err.message || "Failed to create order" });
  }
});

// Client: get order by phone number (shows all orders for that phone)
router.get("/track", async (req, res) => {
  try {
    const { phone, orderNumber } = req.query;
    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const rawPhone = String(phone).trim();
    const digitsOnly = rawPhone.replace(/\D/g, "");
    const last10 = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;

    const orders = await prisma.order.findMany({
      where: {
        AND: [
          {
            OR: [
              { customerPhone: rawPhone },
              { customerPhone: digitsOnly },
              { customerPhone: { contains: last10 } },
            ],
          },
          ...(orderNumber ? [{ orderNumber: String(orderNumber) }] : []),
        ],
      },
      include: {
        items: { include: { foodItem: { select: { id: true, name: true, image: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to track order" });
  }
});

// Admin: get all orders
router.get("/admin", authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, limit = "50", offset = "0" } = req.query;

    const where: any = {};
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: { include: { foodItem: { select: { id: true, name: true, image: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: parseInt(String(limit)),
        skip: parseInt(String(offset)),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ orders, total });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Admin: get single order
router.get("/admin/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: { include: { foodItem: { select: { id: true, name: true, image: true } } } },
      },
    });

    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// Admin: update order status
router.patch("/admin/:id/status", authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["PENDING", "ACCEPTED", "PREPARING", "READY", "DELIVERED", "CANCELLED"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // If cancelling, restore stock
    if (status === "CANCELLED") {
      const order = await prisma.order.findUnique({
        where: { id: req.params.id },
        include: { items: true },
      });

      if (order) {
        await prisma.$transaction(async (tx) => {
          for (const item of order.items) {
            await tx.foodItem.update({
              where: { id: item.foodItemId },
              data: {
                stockQuantity: { increment: item.quantity },
                isAvailable: true,
              },
            });
          }
          await tx.order.update({
            where: { id: req.params.id },
            data: { status },
          });
        });
      }
    } else {
      await prisma.order.update({
        where: { id: req.params.id },
        data: { status },
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });

    // Broadcast status update
    broadcast("order_status", { orderId: req.params.id, status });

    res.json(order);
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// Admin: get dashboard stats
router.get("/admin/stats/summary", authenticate, requireAdmin, async (_req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalOrders, todayOrders, totalRevenue, todayRevenue, pendingOrders, lowStockItems] = await Promise.all([
      prisma.order.count({ where: { status: { not: "CANCELLED" } } }),
      prisma.order.count({ where: { createdAt: { gte: todayStart }, status: { not: "CANCELLED" } } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: todayStart }, status: { not: "CANCELLED" } } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.foodItem.count({ where: { isAvailable: true, stockQuantity: { lte: 5 } } }),
    ]);

    res.json({
      totalOrders,
      todayOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      todayRevenue: todayRevenue._sum.total || 0,
      pendingOrders,
      lowStockItems,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
