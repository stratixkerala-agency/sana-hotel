import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin - Finitix Solution
  const adminPassword = await bcrypt.hash("Finitix@2026-Q5F8", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@finitixsolution.com" },
    update: {},
    create: {
      name: "Finitix Admin",
      email: "admin@finitixsolution.com",
      phone: "+601137356004",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("Admin created:", admin.email);

  // Create demo customer
  const custPassword = await bcrypt.hash("customer123", 12);
  await prisma.user.upsert({
    where: { email: "guest@finitixsolution.com" },
    update: {},
    create: {
      name: "Guest User",
      email: "guest@finitixsolution.com",
      phone: "+601137356004",
      passwordHash: custPassword,
      role: "CUSTOMER",
    },
  });

  // Create categories
  const categories = [
    { name: "Breakfast", slug: "breakfast", sortOrder: 1 },
    { name: "Main Course", slug: "main-course", sortOrder: 2 },
    { name: "Burgers", slug: "burgers", sortOrder: 3 },
    { name: "Pizza", slug: "pizza", sortOrder: 4 },
    { name: "Snacks", slug: "snacks", sortOrder: 5 },
    { name: "Desserts", slug: "desserts", sortOrder: 6 },
    { name: "Drinks", slug: "drinks", sortOrder: 7 },
  ];

  const createdCategories = [];
  for (const cat of categories) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories.push(c);
  }
  console.log(`${createdCategories.length} categories created`);

  // Create food items
  const foodItems = [
    {
      name: "Classic Breakfast Platter",
      slug: "classic-breakfast-platter",
      description: "Two eggs any style, crispy bacon, hash browns, toasted bread, and fresh orange juice",
      price: 850,
      categoryId: createdCategories[0].id,
      ingredients: "Eggs, Bacon, Hash Browns, Bread, Orange Juice, Butter",
      preparationTime: 15,
      stockQuantity: 50,
      isAvailable: true,
      isFeatured: true,
      image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&q=80",
      thumbnail: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&q=80",
    },
    {
      name: "Pancake Stack",
      slug: "pancake-stack",
      description: "Fluffy buttermilk pancakes with maple syrup, fresh berries, and whipped cream",
      price: 650,
      categoryId: createdCategories[0].id,
      ingredients: "Flour, Eggs, Milk, Butter, Maple Syrup, Berries, Sugar",
      preparationTime: 12,
      stockQuantity: 40,
      isAvailable: true,
      isFeatured: false,
      image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80",
      thumbnail: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80",
    },
    {
      name: "Grilled Chicken Steak",
      slug: "grilled-chicken-steak",
      description: "Tender grilled chicken breast with herb butter, mashed potatoes, and seasonal vegetables",
      price: 1450,
      categoryId: createdCategories[1].id,
      ingredients: "Chicken Breast, Herbs, Butter, Potatoes, Vegetables, Olive Oil",
      preparationTime: 25,
      stockQuantity: 30,
      isAvailable: true,
      isFeatured: true,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
      thumbnail: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
    },
    {
      name: "Beef Biryani",
      slug: "beef-biryani",
      description: "Aromatic basmati rice layered with tender beef, saffron, and traditional spices. Served with raita",
      price: 1200,
      categoryId: createdCategories[1].id,
      ingredients: "Basmati Rice, Beef, Saffron, Yogurt, Onions, Spices, Mint",
      preparationTime: 35,
      stockQuantity: 25,
      isAvailable: true,
      isFeatured: true,
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80",
      thumbnail: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80",
    },
    {
      name: "Classic Cheeseburger",
      slug: "classic-cheeseburger",
      description: "Juicy beef patty with melted cheddar, lettuce, tomato, pickles, and our secret sauce",
      price: 950,
      categoryId: createdCategories[2].id,
      ingredients: "Beef Patty, Cheddar Cheese, Lettuce, Tomato, Pickles, Sesame Bun",
      preparationTime: 15,
      stockQuantity: 40,
      isAvailable: true,
      isFeatured: false,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
      thumbnail: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
    },
    {
      name: "Chicken Burger",
      slug: "chicken-burger",
      description: "Crispy fried chicken fillet with coleslaw, pickles, and spicy mayo in a brioche bun",
      price: 850,
      categoryId: createdCategories[2].id,
      ingredients: "Chicken Fillet, Coleslaw, Pickles, Spicy Mayo, Brioche Bun",
      preparationTime: 15,
      stockQuantity: 35,
      isAvailable: true,
      isFeatured: false,
      image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&q=80",
      thumbnail: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&q=80",
    },
    {
      name: "Margherita Pizza",
      slug: "margherita-pizza",
      description: "Hand-stretched pizza with San Marzano tomato sauce, fresh mozzarella, and basil",
      price: 1100,
      categoryId: createdCategories[3].id,
      ingredients: "Pizza Dough, Tomato Sauce, Fresh Mozzarella, Basil, Olive Oil",
      preparationTime: 20,
      stockQuantity: 30,
      isAvailable: true,
      isFeatured: true,
      image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&q=80",
      thumbnail: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&q=80",
    },
    {
      name: "Pepperoni Pizza",
      slug: "pepperoni-pizza",
      description: "Classic pepperoni pizza with mozzarella cheese and our special tomato sauce",
      price: 1300,
      categoryId: createdCategories[3].id,
      ingredients: "Pizza Dough, Pepperoni, Mozzarella, Tomato Sauce, Herbs",
      preparationTime: 20,
      stockQuantity: 25,
      isAvailable: true,
      isFeatured: false,
      image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80",
      thumbnail: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80",
    },
    {
      name: "French Fries",
      slug: "french-fries",
      description: "Crispy golden french fries with seasoning salt and ketchup",
      price: 350,
      categoryId: createdCategories[4].id,
      ingredients: "Potatoes, Oil, Salt, Seasoning",
      preparationTime: 10,
      stockQuantity: 100,
      isAvailable: true,
      isFeatured: false,
      image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80",
      thumbnail: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80",
    },
    {
      name: "Chicken Wings (6 pcs)",
      slug: "chicken-wings-6",
      description: "Spicy buffalo wings served with blue cheese dip and celery sticks",
      price: 750,
      categoryId: createdCategories[4].id,
      ingredients: "Chicken Wings, Hot Sauce, Butter, Blue Cheese, Celery",
      preparationTime: 20,
      stockQuantity: 30,
      isAvailable: true,
      isFeatured: false,
      image: "https://images.unsplash.com/photo-1608039755401-742074f0548d?w=800&q=80",
      thumbnail: "https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400&q=80",
    },
    {
      name: "Chocolate Lava Cake",
      slug: "chocolate-lava-cake",
      description: "Warm chocolate cake with a molten center, served with vanilla ice cream",
      price: 550,
      categoryId: createdCategories[5].id,
      ingredients: "Dark Chocolate, Butter, Eggs, Sugar, Flour, Vanilla Ice Cream",
      preparationTime: 15,
      stockQuantity: 20,
      isAvailable: true,
      isFeatured: true,
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80",
      thumbnail: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80",
    },
    {
      name: "Tiramisu",
      slug: "tiramisu",
      description: "Classic Italian tiramisu with mascarpone cream, espresso, and cocoa powder",
      price: 600,
      categoryId: createdCategories[5].id,
      ingredients: "Mascarpone, Espresso, Ladyfingers, Eggs, Sugar, Cocoa",
      preparationTime: 10,
      stockQuantity: 15,
      isAvailable: true,
      isFeatured: false,
      image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80",
      thumbnail: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80",
    },
    {
      name: "Fresh Lime Soda",
      slug: "fresh-lime-soda",
      description: "Refreshing fresh lime with soda water, mint, and a hint of salt",
      price: 250,
      categoryId: createdCategories[6].id,
      ingredients: "Lime, Soda Water, Mint, Salt, Sugar",
      preparationTime: 5,
      stockQuantity: 100,
      isAvailable: true,
      isFeatured: false,
      image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80",
      thumbnail: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80",
    },
    {
      name: "Mango Lassi",
      slug: "mango-lassi",
      description: "Creamy yogurt blended with fresh mango pulp and a touch of cardamom",
      price: 300,
      categoryId: createdCategories[6].id,
      ingredients: "Yogurt, Mango, Sugar, Cardamom, Ice",
      preparationTime: 5,
      stockQuantity: 50,
      isAvailable: true,
      isFeatured: false,
      image: "https://images.unsplash.com/photo-1527661929-7c6e43afe997?w=800&q=80",
      thumbnail: "https://images.unsplash.com/photo-1527661929-7c6e43afe997?w=400&q=80",
    },
    {
      name: "Fresh Orange Juice",
      slug: "fresh-orange-juice",
      description: "Freshly squeezed orange juice with no added sugar",
      price: 280,
      categoryId: createdCategories[6].id,
      ingredients: "Fresh Oranges",
      preparationTime: 5,
      stockQuantity: 80,
      isAvailable: true,
      isFeatured: false,
      image: "https://images.unsplash.com/photo-1621506289937-a87441e1176e?w=800&q=80",
      thumbnail: "https://images.unsplash.com/photo-1621506289937-a87441e1176e?w=400&q=80",
    },
  ];

  for (const item of foodItems) {
    await prisma.foodItem.upsert({
      where: { slug: item.slug },
      update: {},
      create: item,
    });
  }
  console.log(`${foodItems.length} food items created`);

  // Add some demo reviews
  const foodItemsList = await prisma.foodItem.findMany({ take: 3 });
  const customer = await prisma.user.findUnique({ where: { email: "guest@finitixsolution.com" } });

  if (customer && foodItemsList.length > 0) {
    const reviews = [
      { foodItemId: foodItemsList[0].id, rating: 5, comment: "Absolutely delicious! The eggs were perfectly cooked." },
      { foodItemId: foodItemsList[1].id, rating: 4, comment: "Great pasta, would order again." },
      { foodItemId: foodItemsList[2].id, rating: 5, comment: "Best biryani I've had at a hotel. Authentic flavors!" },
    ];

    for (const review of reviews) {
      const existing = await prisma.review.findFirst({
        where: { foodItemId: review.foodItemId, customerId: customer.id },
      });
      if (!existing) {
        await prisma.review.create({
          data: {
            ...review,
            customerId: customer.id,
            customerName: customer.name,
            isApproved: true,
          },
        });
      }
    }
    console.log("Demo reviews created");
  }

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
