import { createClient } from "@libsql/client";

const TURSO_URL = process.env.DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_URL.startsWith("libsql://")) {
  console.error("Set DATABASE_URL to a libsql:// URL");
  process.exit(1);
}

const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

async function seed() {
  console.log("Updating menu in Turso...");

  // Clear old food items and reviews
  await client.execute(`DELETE FROM "Review"`);
  await client.execute(`DELETE FROM "OrderItem"`);
  await client.execute(`DELETE FROM "Order"`);
  await client.execute(`DELETE FROM "FoodItem"`);
  await client.execute(`DELETE FROM "Notification"`);
  await client.execute(`DELETE FROM "Category"`);

  // Create categories
  const categories = [
    { name: "Breads", slug: "breads", sortOrder: 1 },
    { name: "Chicken", slug: "chicken", sortOrder: 2 },
    { name: "Beef", slug: "beef", sortOrder: 3 },
    { name: "Biriyani", slug: "biriyani", sortOrder: 4 },
    { name: "Manthi", slug: "manthi", sortOrder: 5 },
    { name: "Grill", slug: "grill", sortOrder: 6 },
    { name: "Chinese", slug: "chinese", sortOrder: 7 },
    { name: "Soup", slug: "soup", sortOrder: 8 },
    { name: "Veg Curry", slug: "veg-curry", sortOrder: 9 },
  ];

  const catIds: Record<string, string> = {};
  for (const cat of categories) {
    const id = crypto.randomUUID();
    catIds[cat.slug] = id;
    await client.execute({
      sql: `INSERT INTO "Category" (id, name, slug, sortOrder, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'))`,
      args: [id, cat.name, cat.slug, cat.sortOrder],
    });
  }
  console.log(`${categories.length} categories created`);

  // Food items with Unsplash images
  const foodItems = [
    // BREADS
    { name: "Porotta", slug: "porotta", price: 15, cat: "breads", desc: "Flaky layered flatbread, a South Indian staple", ingredients: "Flour, Oil, Salt", time: 10, stock: 100, img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=75" },
    { name: "Chapathi", slug: "chapathi", price: 15, cat: "breads", desc: "Soft whole wheat flatbread", ingredients: "Whole Wheat Flour, Water, Salt, Oil", time: 8, stock: 100, img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=75" },
    { name: "Ari Pathiri", slug: "ari-pathiri", price: 15, cat: "breads", desc: "Thin rice flour flatbread from Kerala", ingredients: "Rice Flour, Water, Salt", time: 10, stock: 80, img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=75" },
    { name: "Romali", slug: "romali", price: 25, cat: "breads", desc: "Paper-thin roomali roti, hand-stretched", ingredients: "Flour, Water, Salt, Ghee", time: 10, stock: 60, img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=75" },
    { name: "Rotti", slug: "rotti", price: 30, cat: "breads", desc: "Traditional tandoor-baked bread", ingredients: "Flour, Yeast, Salt, Butter", time: 12, stock: 80, img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=75" },
    { name: "Butter Naan", slug: "butter-naan", price: 30, cat: "breads", desc: "Soft naan brushed with melted butter", ingredients: "Flour, Yogurt, Yeast, Butter", time: 12, stock: 80, img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=75" },
    { name: "Kuboos", slug: "kuboos", price: 12, cat: "breads", desc: "Middle Eastern style pita bread", ingredients: "Flour, Yeast, Salt, Sugar", time: 10, stock: 80, img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=75" },
    { name: "Garlic Naan", slug: "garlic-naan", price: 35, cat: "breads", desc: "Naan loaded with garlic and butter", ingredients: "Flour, Garlic, Butter, Yogurt, Yeast", time: 12, stock: 60, img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=75" },

    // CHICKEN
    { name: "Chicken Curry", slug: "chicken-curry", price: 180, cat: "chicken", desc: "Classic South Indian chicken curry with rich gravy", ingredients: "Chicken, Onion, Tomato, Spices, Coconut", time: 25, stock: 50, featured: true, img: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=75" },
    { name: "Chicken Roast", slug: "chicken-roast", price: 180, cat: "chicken", desc: "Slow-roasted chicken with Kerala spices", ingredients: "Chicken, Kerala Spices, Curry Leaves, Coconut Oil", time: 30, stock: 40, img: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=75" },
    { name: "Chilly Chicken", slug: "chilly-chicken", price: 190, cat: "chicken", desc: "Indo-Chinese style spicy chicken", ingredients: "Chicken, Chilies, Soy Sauce, Bell Peppers, Onion", time: 20, stock: 50, img: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=75" },
    { name: "Pepper Chicken", slug: "pepper-chicken", price: 200, cat: "chicken", desc: "Chicken tossed in fresh cracked pepper masala", ingredients: "Chicken, Black Pepper, Curry Leaves, Ginger, Garlic", time: 25, stock: 40, img: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=75" },
    { name: "Garlic Chicken", slug: "garlic-chicken", price: 200, cat: "chicken", desc: "Chicken with aromatic garlic sauce", ingredients: "Chicken, Garlic, Soy Sauce, Honey, Vinegar", time: 20, stock: 40, img: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=75" },
    { name: "Ginger Chicken", slug: "ginger-chicken", price: 200, cat: "chicken", desc: "Chicken cooked with fresh ginger masala", ingredients: "Chicken, Ginger, Green Chilies, Onions", time: 25, stock: 40, img: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=75" },
    { name: "Butter Chicken", slug: "butter-chicken", price: 220, cat: "chicken", desc: "Creamy tomato-based butter chicken", ingredients: "Chicken, Butter, Tomato, Cream, Cashew, Spices", time: 25, stock: 40, featured: true, img: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=75" },
    { name: "Dragon Chicken", slug: "dragon-chicken", price: 280, cat: "chicken", desc: "Spicy deep-fried chicken in dragon sauce", ingredients: "Chicken, Chili Sauce, Honey, Garlic, Sesame", time: 20, stock: 30, featured: true, img: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=75" },
    { name: "Chicken Kondattam", slug: "chicken-kondattam", price: 200, cat: "chicken", desc: "Kerala-style sun-dried chili chicken", ingredients: "Chicken, Kondattam Chilies, Curry Leaves, Mustard", time: 25, stock: 30, img: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=75" },
    { name: "Chicken 65", slug: "chicken-65", price: 190, cat: "chicken", desc: "Classic deep-fried spicy chicken appetizer", ingredients: "Chicken, Red Chili, Ginger Garlic, Curry Leaves", time: 15, stock: 50, featured: true, img: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=75" },
    { name: "Chicken Fry", slug: "chicken-fry", price: 180, cat: "chicken", desc: "Kerala-style crispy fried chicken", ingredients: "Chicken, Chili Powder, Turmeric, Curry Leaves, Coconut Oil", time: 20, stock: 50, img: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=75" },

    // BEEF
    { name: "Beef Roast", slug: "beef-roast", price: 140, cat: "beef", desc: "Slow-cooked Kerala beef roast with onions", ingredients: "Beef, Onions, Kerala Spices, Curry Leaves", time: 30, stock: 40, featured: true, img: "https://images.unsplash.com/photo-1534604973900-c43e9c3e3935?w=600&q=75" },
    { name: "Beef Fry", slug: "beef-fry", price: 150, cat: "beef", desc: "Crispy dry-fried beef with coconut", ingredients: "Beef, Coconut Slices, Curry Leaves, Red Chilies", time: 30, stock: 40, img: "https://images.unsplash.com/photo-1534604973900-c43e9c3e3935?w=600&q=75" },
    { name: "Chilly Beef", slug: "chilly-beef", price: 220, cat: "beef", desc: "Indo-Chinese style spicy beef", ingredients: "Beef, Chilies, Soy Sauce, Bell Peppers, Vinegar", time: 25, stock: 30, img: "https://images.unsplash.com/photo-1534604973900-c43e9c3e3935?w=600&q=75" },
    { name: "Beef Dry Fry (BDF)", slug: "beef-dry-fry", price: 280, cat: "beef", desc: "Signature dry-fried beef with special spices", ingredients: "Beef, Spices, Coconut, Curry Leaves", time: 35, stock: 25, featured: true, img: "https://images.unsplash.com/photo-1534604973900-c43e9c3e3935?w=600&q=75" },
    { name: "Dragon Beef", slug: "dragon-beef", price: 280, cat: "beef", desc: "Spicy dragon-style beef preparation", ingredients: "Beef, Dragon Sauce, Chilies, Garlic, Honey", time: 30, stock: 25, img: "https://images.unsplash.com/photo-1534604973900-c43e9c3e3935?w=600&q=75" },
    { name: "Beef Masala", slug: "beef-masala", price: 220, cat: "beef", desc: "Rich and creamy beef masala gravy", ingredients: "Beef, Onions, Tomato, Coconut Paste, Spices", time: 35, stock: 30, img: "https://images.unsplash.com/photo-1534604973900-c43e9c3e3935?w=600&q=75" },

    // BIRIYANI
    { name: "Chicken Biriyani", slug: "chicken-biriyani", price: 160, cat: "biriyani", desc: "Aromatic basmati rice layered with spiced chicken", ingredients: "Basmati Rice, Chicken, Saffron, Yogurt, Fried Onions, Spices", time: 35, stock: 40, featured: true, img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=75" },
    { name: "Beef Biriyani", slug: "beef-biriyani", price: 170, cat: "biriyani", desc: "Fragrant biriyani with tender beef pieces", ingredients: "Basmati Rice, Beef, Saffron, Yogurt, Spices, Mint", time: 40, stock: 35, featured: true, img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=75" },
    { name: "Egg Biriyani", slug: "egg-biriyani", price: 140, cat: "biriyani", desc: "Flavored rice with boiled eggs and spices", ingredients: "Basmati Rice, Eggs, Saffron, Fried Onions, Spices", time: 25, stock: 50, img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=75" },
    { name: "Veg Biriyani", slug: "veg-biriyani", price: 120, cat: "biriyani", desc: "Garden fresh vegetables in spiced rice", ingredients: "Basmati Rice, Mixed Vegetables, Saffron, Spices, Mint", time: 25, stock: 50, img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=75" },

    // MANTHI
    { name: "Normal Manthi", slug: "normal-manthi", price: 800, cat: "manthi", desc: "Traditional Mandi with tender meat and aromatic rice", ingredients: "Rice, Meat, Saffron, Dried Lemon, Mandi Spices", time: 45, stock: 20, featured: true, img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=75" },
    { name: "Alfam Manthi", slug: "alfam-manthi", price: 900, cat: "manthi", desc: "Alfam-style grilled meat with Mandi rice", ingredients: "Rice, Alfam Meat, Saffron, Spices", time: 50, stock: 15, img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=75" },
    { name: "Periperi Manthi", slug: "periperi-manthi", price: 950, cat: "manthi", desc: "Spicy Peri-Peri flavored Mandi", ingredients: "Rice, Meat, Peri-Peri Sauce, Spices", time: 50, stock: 15, img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=75" },
    { name: "Mexican Manthi", slug: "mexican-manthi", price: 950, cat: "manthi", desc: "Mexican-spiced Mandi with smoky flavors", ingredients: "Rice, Meat, Mexican Spices, Chipotle", time: 50, stock: 15, img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=75" },
    { name: "Honey Manthi", slug: "honey-manthi", price: 950, cat: "manthi", desc: "Sweet and savory honey-glazed Mandi", ingredients: "Rice, Meat, Honey, Spices", time: 50, stock: 15, img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=75" },
    { name: "Honeychilly Manthi", slug: "honeychilly-manthi", price: 1000, cat: "manthi", desc: "Honey chili glazed Mandi with a kick", ingredients: "Rice, Meat, Honey, Chilies, Spices", time: 50, stock: 15, img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=75" },
    { name: "Thanthuri Manthi", slug: "thanthuri-manthi", price: 1000, cat: "manthi", desc: "Tandoor-style Mandi with smoky aroma", ingredients: "Rice, Meat, Tandoori Spices, Yogurt", time: 50, stock: 15, img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=75" },
    { name: "Dragon Manthi", slug: "dragon-manthi", price: 1000, cat: "manthi", desc: "Fiery dragon-style Mandi", ingredients: "Rice, Meat, Dragon Sauce, Chilies", time: 50, stock: 15, img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=75" },
    { name: "BBQ Manthi", slug: "bbq-manthi", price: 1000, cat: "manthi", desc: "Smoky BBQ-flavored Mandi", ingredients: "Rice, Meat, BBQ Sauce, Spices", time: 50, stock: 15, img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=75" },

    // GRILL
    { name: "Alfam Grill", slug: "alfam-grill", price: 460, cat: "grill", desc: "Alfam-style grilled chicken - Full portion", ingredients: "Chicken, Alfam Marinade, Spices, Lemon", time: 30, stock: 20, featured: true, img: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?w=600&q=75" },
    { name: "Periperi Grill", slug: "periperi-grill", price: 490, cat: "grill", desc: "Spicy Peri-Peri grilled chicken", ingredients: "Chicken, Peri-Peri Sauce, Herbs", time: 30, stock: 20, img: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?w=600&q=75" },
    { name: "Mexican Grill", slug: "mexican-grill", price: 490, cat: "grill", desc: "Smoky Mexican-spiced grilled chicken", ingredients: "Chicken, Mexican Spices, Chipotle, Lime", time: 30, stock: 20, img: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?w=600&q=75" },
    { name: "Honey Grill", slug: "honey-grill", price: 490, cat: "grill", desc: "Sweet honey-glazed grilled chicken", ingredients: "Chicken, Honey, Soy Sauce, Garlic", time: 30, stock: 20, img: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?w=600&q=75" },
    { name: "Thanthuri Grill", slug: "thanthuri-grill", price: 490, cat: "grill", desc: "Tandoori-style grilled chicken", ingredients: "Chicken, Tandoori Masala, Yogurt, Lemon", time: 30, stock: 20, img: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?w=600&q=75" },
    { name: "Honeychilly Grill", slug: "honeychilly-grill", price: 520, cat: "grill", desc: "Honey chili glazed grilled chicken", ingredients: "Chicken, Honey, Chilies, Garlic", time: 30, stock: 20, img: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?w=600&q=75" },
    { name: "Dragon Grill", slug: "dragon-grill", price: 520, cat: "grill", desc: "Fiery dragon-style grilled chicken", ingredients: "Chicken, Dragon Sauce, Chilies, Garlic", time: 30, stock: 20, img: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?w=600&q=75" },
    { name: "BBQ Grill", slug: "bbq-grill", price: 490, cat: "grill", desc: "Smoky BBQ grilled chicken", ingredients: "Chicken, BBQ Sauce, Spices, Herbs", time: 30, stock: 20, img: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?w=600&q=75" },
    { name: "Tikka", slug: "tikka", price: 220, cat: "grill", desc: "Classic chicken tikka pieces", ingredients: "Chicken, Tikka Masala, Yogurt, Lemon", time: 25, stock: 30, img: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?w=600&q=75" },

    // CHINESE
    { name: "Chicken Fried Rice", slug: "chicken-fried-rice", price: 180, cat: "chinese", desc: "Wok-fried rice with chicken and vegetables", ingredients: "Rice, Chicken, Egg, Vegetables, Soy Sauce", time: 15, stock: 50, img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=75" },
    { name: "Egg Fried Rice", slug: "egg-fried-rice", price: 150, cat: "chinese", desc: "Classic egg fried rice with spring onions", ingredients: "Rice, Egg, Spring Onion, Soy Sauce, Garlic", time: 12, stock: 60, img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=75" },
    { name: "Veg Fried Rice", slug: "veg-fried-rice", price: 130, cat: "chinese", desc: "Garden fresh vegetable fried rice", ingredients: "Rice, Mixed Vegetables, Soy Sauce, Garlic", time: 12, stock: 60, img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=75" },
    { name: "Beef Fried Rice", slug: "beef-fried-rice", price: 190, cat: "chinese", desc: "Fried rice with tender beef pieces", ingredients: "Rice, Beef, Egg, Vegetables, Soy Sauce", time: 15, stock: 40, img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=75" },
    { name: "Mix Fried Rice", slug: "mix-fried-rice", price: 200, cat: "chinese", desc: "Mixed meat fried rice", ingredients: "Rice, Chicken, Beef, Egg, Vegetables, Soy Sauce", time: 15, stock: 40, img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=75" },
    { name: "Chicken Noodles", slug: "chicken-noodles", price: 200, cat: "chinese", desc: "Wok-tossed noodles with chicken", ingredients: "Noodles, Chicken, Vegetables, Soy Sauce, Vinegar", time: 15, stock: 50, img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=75" },
    { name: "Egg Noodles", slug: "egg-noodles", price: 170, cat: "chinese", desc: "Classic egg noodles with vegetables", ingredients: "Noodles, Egg, Vegetables, Soy Sauce", time: 12, stock: 60, img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=75" },
    { name: "Veg Noodles", slug: "veg-noodles", price: 150, cat: "chinese", desc: "Vegetable noodles in soy-garlic sauce", ingredients: "Noodles, Mixed Vegetables, Soy Sauce, Garlic", time: 12, stock: 60, img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=75" },
    { name: "Beef Noodles", slug: "beef-noodles", price: 200, cat: "chinese", desc: "Noodles with tender beef strips", ingredients: "Noodles, Beef, Vegetables, Soy Sauce", time: 15, stock: 40, img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=75" },
    { name: "Mix Noodles", slug: "mix-noodles", price: 220, cat: "chinese", desc: "Mixed meat noodles", ingredients: "Noodles, Chicken, Beef, Egg, Vegetables", time: 15, stock: 40, img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=75" },

    // SOUP
    { name: "Chicken Soup", slug: "chicken-soup", price: 140, cat: "soup", desc: "Clear chicken soup with herbs", ingredients: "Chicken, Herbs, Pepper, Lemon", time: 15, stock: 50, img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=75" },
    { name: "Hot & Sour Chicken Soup", slug: "hot-sour-chicken-soup", price: 140, cat: "soup", desc: "Spicy and tangy chicken soup", ingredients: "Chicken, Vinegar, Chilies, Corn Starch, Pepper", time: 15, stock: 50, img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=75" },
    { name: "Hot & Sour Veg Soup", slug: "hot-sour-veg-soup", price: 110, cat: "soup", desc: "Spicy vegetable soup with tangy flavors", ingredients: "Mixed Vegetables, Vinegar, Chilies, Corn Starch", time: 12, stock: 50, img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=75" },
    { name: "Chicken Mushroom Soup", slug: "chicken-mushroom-soup", price: 140, cat: "soup", desc: "Creamy mushroom soup with chicken", ingredients: "Chicken, Mushroom, Cream, Garlic, Herbs", time: 15, stock: 40, img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=75" },

    // VEG CURRY
    { name: "Gobi Manchurian", slug: "gobi-manchurian", price: 130, cat: "veg-curry", desc: "Indo-Chinese style cauliflower in tangy sauce", ingredients: "Cauliflower, Soy Sauce, Garlic, Vinegar, Chilies", time: 15, stock: 50, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=75" },
    { name: "Chilly Gobi", slug: "chilly-gobi", price: 130, cat: "veg-curry", desc: "Spicy chili cauliflower preparation", ingredients: "Cauliflower, Chilies, Bell Peppers, Soy Sauce", time: 15, stock: 50, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=75" },
    { name: "Chilly Gobi Dry", slug: "chilly-gobi-dry", price: 140, cat: "veg-curry", desc: "Dry-style spicy cauliflower", ingredients: "Cauliflower, Chilies, Garlic, Spring Onions", time: 15, stock: 40, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=75" },
    { name: "Paneer Butter Masala", slug: "paneer-butter-masala", price: 160, cat: "veg-curry", desc: "Creamy tomato-based paneer curry", ingredients: "Paneer, Butter, Tomato, Cream, Cashew, Spices", time: 15, stock: 40, featured: true, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=75" },
    { name: "Chilly Paneer", slug: "chilly-paneer", price: 160, cat: "veg-curry", desc: "Indo-Chinese style spicy paneer", ingredients: "Paneer, Chilies, Soy Sauce, Bell Peppers, Onion", time: 15, stock: 40, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=75" },
    { name: "Mushroom Masala", slug: "mushroom-masala", price: 160, cat: "veg-curry", desc: "Rich mushroom curry with Indian spices", ingredients: "Mushroom, Onion, Tomato, Spices, Cream", time: 15, stock: 40, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=75" },
  ];

  for (const item of foodItems) {
    const id = crypto.randomUUID();
    const thumb = item.img.replace("w=600", "w=300");
    await client.execute({
      sql: `INSERT INTO "FoodItem" (id, name, slug, description, price, categoryId, image, thumbnail, ingredients, preparationTime, stockQuantity, isAvailable, isFeatured, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, datetime('now'), datetime('now'))`,
      args: [id, item.name, item.slug, item.desc, item.price, catIds[item.cat], item.img, thumb, item.ingredients, item.time, item.stock, item.featured ? 1 : 0],
    });
  }
  console.log(`${foodItems.length} food items created`);

  console.log("Menu update complete!");
  client.close();
}

seed().catch(console.error);
