/**
 * Turso Migration Script
 * Run this to push the schema to your Turso database:
 *   npx tsx prisma/migrate-turso.ts
 */
import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";

const TURSO_URL = process.env.DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_URL.startsWith("libsql://")) {
  console.error("DATABASE_URL must be a libsql:// URL for Turso migration");
  process.exit(1);
}

const sql = `
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "phone" TEXT,
  "passwordHash" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "Category" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE,
  "image" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT 1,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "FoodItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "price" REAL NOT NULL,
  "categoryId" TEXT,
  "image" TEXT,
  "thumbnail" TEXT,
  "ingredients" TEXT,
  "preparationTime" INTEGER,
  "stockQuantity" INTEGER NOT NULL DEFAULT 0,
  "isAvailable" BOOLEAN NOT NULL DEFAULT 1,
  "isFeatured" BOOLEAN NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "FoodItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Order" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "orderNumber" TEXT NOT NULL UNIQUE,
  "customerId" TEXT,
  "customerName" TEXT NOT NULL,
  "customerPhone" TEXT NOT NULL,
  "deliveryType" TEXT NOT NULL DEFAULT 'ROOM',
  "roomNumber" TEXT,
  "deliveryAddress" TEXT,
  "deliveryNotes" TEXT,
  "subtotal" REAL NOT NULL,
  "deliveryFee" REAL NOT NULL DEFAULT 0,
  "total" REAL NOT NULL,
  "paymentMethod" TEXT NOT NULL DEFAULT 'CASH_ON_DELIVERY',
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "OrderItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "orderId" TEXT NOT NULL,
  "foodItemId" TEXT NOT NULL,
  "foodName" TEXT NOT NULL,
  "unitPrice" REAL NOT NULL,
  "quantity" INTEGER NOT NULL,
  "totalPrice" REAL NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "OrderItem_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Review" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "foodItemId" TEXT NOT NULL,
  "customerId" TEXT,
  "orderId" TEXT,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "customerName" TEXT NOT NULL DEFAULT 'Guest',
  "isApproved" BOOLEAN NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Review_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Review_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Review_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Notification" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "orderId" TEXT,
  "type" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;

async function migrate() {
  console.log("Connecting to Turso...");
  const client = createClient({ url: TURSO_URL!, authToken: TURSO_TOKEN });

  console.log("Running migration...");
  const statements = sql.split(";").filter((s) => s.trim());

  for (const stmt of statements) {
    const trimmed = stmt.trim();
    if (trimmed) {
      try {
        await client.execute(trimmed + ";");
      } catch (err: any) {
        // Ignore "already exists" errors
        if (!err.message?.includes("already exists")) {
          console.error("Error executing:", trimmed.substring(0, 80));
          console.error(err.message);
        }
      }
    }
  }

  console.log("Migration complete!");
  client.close();
}

migrate().catch(console.error);
