import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertCartItemSchema, insertOrderSchema } from "@shared/schema";

// Dummy authentication middleware placeholder
// Replace this later with JWT / Auth0 / your own login system
function isAuthenticated(req: any, res: any, next: any) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize categories
  await initializeCategories();

  // User routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const updatedUser = await storage.updateUser(userId, req.body);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Category routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const { category, search } = req.query;
      const products = await storage.getProducts(category as string, search as string);
      res.json(products);
    } catch {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) return res.status(404).json({ message: "Product not found" });

      await storage.incrementProductViews(req.params.id);
      res.json(product);
    } catch {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const productData = insertProductSchema.parse({
        ...req.body,
        sellerId: req.user.id,
      });
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch {
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.patch('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product || product.sellerId !== req.user.id)
        return res.status(403).json({ message: "Unauthorized" });

      const updated = await storage.updateProduct(req.params.id, req.body);
      res.json(updated);
    } catch {
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product || product.sellerId !== req.user.id)
        return res.status(403).json({ message: "Unauthorized" });

      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Cart routes
  app.get('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const cartItems = await storage.getCartItems(req.user.id);
      res.json(cartItems);
    } catch {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.post('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const cartItem = await storage.addToCart(cartItemData);
      res.status(201).json(cartItem);
    } catch {
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  // Order routes
  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const order = await storage.createOrder(req.user.id, req.body);
      await storage.clearCart(req.user.id);
      res.status(201).json(order);
    } catch {
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function initializeCategories() {
  try {
    const existingCategories = await storage.getCategories();
    if (existingCategories.length === 0) {
      const defaultCategories = [
        { name: "Electronics", slug: "electronics", description: "Phones, computers, gadgets and more" },
        { name: "Clothing & Fashion", slug: "clothing-fashion", description: "Apparel, shoes, accessories" },
        { name: "Books & Media", slug: "books-media", description: "Books, movies, music, games" },
        { name: "Home & Garden", slug: "home-garden", description: "Furniture, decor, gardening supplies" },
        { name: "Sports & Recreation", slug: "sports-recreation", description: "Sporting goods, fitness equipment" },
        { name: "Music & Instruments", slug: "music-instruments", description: "Musical instruments and equipment" },
        { name: "Accessories", slug: "accessories", description: "Bags, jewelry, watches" },
        { name: "Other", slug: "other", description: "Everything else" },
      ];
      for (const category of defaultCategories) await storage.createCategory(category);
    }
  } catch (error) {
    console.error("Error initializing categories:", error);
  }
}
