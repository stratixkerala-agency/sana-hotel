/**
 * Turso Direct Seed Script
 * Seeds the Turso database directly using @libsql/client
 * Run: npx tsx prisma/seed-turso.ts
 */
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

const TURSO_URL = process.env.DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_URL.startsWith("libsql://")) {
  console.error("Set DATABASE_URL to a libsql:// URL");
  process.exit(1);
}

const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

async function seed() {
  console.log("Seeding Turso database...");

  // Create admin user
  const adminHash = await bcrypt.hash("admin123", 12);
  const adminId = crypto.randomUUID();
  await client.execute({
    sql: `INSERT OR IGNORE INTO "User" (id, name, email, phone, passwordHash, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [adminId, "Sana Admin", "admin@sana.com", "+92-300-0000000", adminHash, "ADMIN"],
  });

  // Create demo customer
  const custHash = await bcrypt.hash("customer123", 12);
  const custId = crypto.randomUUID();
  await client.execute({
    sql: `INSERT OR IGNORE INTO "User" (id, name, email, phone, passwordHash, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [custId, "Guest User", "guest@sana.com", "+92-300-1111111", custHash, "CUSTOMER"],
  });
  console.log("Users created");

  // Create categories
  const categories = [
    { name: "Breakfast", slug: "breakfast", sortOrder: 1, emoji: "🍳" },
    { name: "Main Course", slug: "main-course", sortOrder: 2, emoji: "🍛" },
    { name: "Burgers", slug: "burgers", sortOrder: 3, emoji: "🍔" },
    { name: "Pizza", slug: "pizza", sortOrder: 4, emoji: "🍕" },
    { name: "Snacks", slug: "snacks", sortOrder: 5, emoji: "🍟" },
    { name: "Desserts", slug: "desserts", sortOrder: 6, emoji: "🍰" },
    { name: "Drinks", slug: "drinks", sortOrder: 7, emoji: "🥤" },
  ];

  const catIds: Record<string, string> = {};
  for (const cat of categories) {
    const id = crypto.randomUUID();
    catIds[cat.slug] = id;
    await client.execute({
      sql: `INSERT OR IGNORE INTO "Category" (id, name, slug, sortOrder, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'))`,
      args: [id, cat.name, cat.slug, cat.sortOrder],
    });
  }
  console.log(`${categories.length} categories created`);

  // Create food items
  const foodItems = [
    { name: "Classic Breakfast Platter", slug: "classic-breakfast-platter", desc: "Two eggs any style, crispy bacon, hash browns, toasted bread, and fresh orange juice", price: 850, cat: "breakfast", ingredients: "Eggs, Bacon, Hash Browns, Bread, Orange Juice, Butter", time: 15, stock: 50, featured: true, img: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&q=80" },
    { name: "Pancake Stack", slug: "pancake-stack", desc: "Fluffy buttermilk pancakes with maple syrup, fresh berries, and whipped cream", price: 650, cat: "breakfast", ingredients: "Flour, Eggs, Milk, Butter, Maple Syrup, Berries, Sugar", time: 12, stock: 40, featured: false, img: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80" },
    { name: "Grilled Chicken Steak", slug: "grilled-chicken-steak", desc: "Tender grilled chicken breast with herb butter, mashed potatoes, and seasonal vegetables", price: 1450, cat: "main-course", ingredients: "Chicken Breast, Herbs, Butter, Potatoes, Vegetables, Olive Oil", time: 25, stock: 30, featured: true, img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80" },
    { name: "Beef Biryani", slug: "beef-biryani", desc: "Aromatic basmati rice layered with tender beef, saffron, and traditional spices. Served with raita", price: 1200, cat: "main-course", ingredients: "Basmati Rice, Beef, Saffron, Yogurt, Onions, Spices, Mint", time: 35, stock: 25, featured: true, img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80" },
    { name: "Classic Cheeseburger", slug: "classic-cheeseburger", desc: "Juicy beef patty with melted cheddar, lettuce, tomato, pickles, and our secret sauce", price: 950, cat: "burgers", ingredients: "Beef Patty, Cheddar Cheese, Lettuce, Tomato, Pickles, Sesame Bun", time: 15, stock: 40, featured: false, img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80" },
    { name: "Chicken Burger", slug: "chicken-burger", desc: "Crispy fried chicken fillet with coleslaw, pickles, and spicy mayo in a brioche bun", price: 850, cat: "burgers", ingredients: "Chicken Fillet, Coleslaw, Pickles, Spicy Mayo, Brioche Bun", time: 15, stock: 35, featured: false, img: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&q=80" },
    { name: "Margherita Pizza", slug: "margherita-pizza", desc: "Hand-stretched pizza with San Marzano tomato sauce, fresh mozzarella, and basil", price: 1100, cat: "pizza", ingredients: "Pizza Dough, Tomato Sauce, Fresh Mozzarella, Basil, Olive Oil", time: 20, stock: 30, featured: true, img: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&q=80" },
    { name: "Pepperoni Pizza", slug: "pepperoni-pizza", desc: "Classic pepperoni pizza with mozzarella cheese and our special tomato sauce", price: 1300, cat: "pizza", ingredients: "Pizza Dough, Pepperoni, Mozzarella, Tomato Sauce, Herbs", time: 20, stock: 25, featured: false, img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80" },
    { name: "French Fries", slug: "french-fries", desc: "Crispy golden french fries with seasoning salt and ketchup", price: 350, cat: "snacks", ingredients: "Potatoes, Oil, Salt, Seasoning", time: 10, stock: 100, featured: false, img: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80" },
    { name: "Chicken Wings (6 pcs)", slug: "chicken-wings-6", desc: "Spicy buffalo wings served with blue cheese dip and celery sticks", price: 750, cat: "snacks", ingredients: "Chicken Wings, Hot Sauce, Butter, Blue Cheese, Celery", time: 20, stock: 30, featured: false, img: "https://images.unsplash.com/photo-1608039755401-742074f0548d?w=800&q=80" },
    { name: "Chocolate Lava Cake", slug: "chocolate-lava-cake", desc: "Warm chocolate cake with a molten center, served with vanilla ice cream", price: 550, cat: "desserts", ingredients: "Dark Chocolate, Butter, Eggs, Sugar, Flour, Vanilla Ice Cream", time: 15, stock: 20, featured: true, img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80" },
    { name: "Tiramisu", slug: "tiramisu", desc: "Classic Italian tiramisu with mascarpone cream, espresso, and cocoa powder", price: 600, cat: "desserts", ingredients: "Mascarpone, Espresso, Ladyfingers, Eggs, Sugar, Cocoa", time: 10, stock: 15, featured: false, img: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80" },
    { name: "Fresh Lime Soda", slug: "fresh-lime-soda", desc: "Refreshing fresh lime with soda water, mint, and a hint of salt", price: 250, cat: "drinks", ingredients: "Lime, Soda Water, Mint, Salt, Sugar", time: 5, stock: 100, featured: false, img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80" },
    { name: "Mango Lassi", slug: "mango-lassi", desc: "Creamy yogurt blended with fresh mango pulp and a touch of cardamom", price: 300, cat: "drinks", ingredients: "Yogurt, Mango, Sugar, Cardamom, Ice", time: 5, stock: 50, featured: false, img: "https://images.unsplash.com/photo-1527661929-7c6e43afe997?w=800&q=80" },
    { name: "Fresh Orange Juice", slug: "fresh-orange-juice", desc: "Freshly squeezed orange juice with no added sugar", price: 280, cat: "drinks", ingredients: "Fresh Oranges", time: 5, stock: 80, featured: false, img: "https://images.unsplash.com/photo-1621506289937-a87441e1176e?w=800&q=80" },
  ];

  for (const item of foodItems) {
    const id = crypto.randomUUID();
    const thumb = item.img.replace("w=800", "w=400");
    await client.execute({
      sql: `INSERT OR IGNORE INTO "FoodItem" (id, name, slug, description, price, categoryId, image, thumbnail, ingredients, preparationTime, stockQuantity, isAvailable, isFeatured, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, datetime('now'), datetime('now'))`,
      args: [id, item.name, item.slug, item.desc, item.price, catIds[item.cat], item.img, thumb, item.ingredients, item.time, item.stock, item.featured ? 1 : 0],
    });
  }
  console.log(`${foodItems.length} food items created`);

  // Add demo reviews for first 3 food items
  const foodResult = await client.execute(`SELECT id FROM "FoodItem" LIMIT 3`);
  for (let i = 0; i < foodResult.rows.length; i++) {
    const foodId = foodResult.rows[i].id as string;
    const reviewId = crypto.randomUUID();
    const ratings = [5, 4, 5];
    const comments = [
      "Absolutely delicious! The eggs were perfectly cooked.",
      "Great pasta, would order again.",
      "Best biryani I've had at a hotel. Authentic flavors!",
    ];
    await client.execute({
      sql: `INSERT OR IGNORE INTO "Review" (id, foodItemId, customerId, rating, comment, customerName, isApproved, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))`,
      args: [reviewId, foodId, custId, ratings[i], comments[i], "Guest User"],
    });
  }
  console.log("Demo reviews created");

  console.log("Seed completed!");
  client.close();
}

seed().catch(console.error);
