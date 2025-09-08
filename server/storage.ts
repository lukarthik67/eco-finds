import {
  users,
  products,
  categories,
  cartItems,
  orders,
  orderItems,
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type Category,
  type InsertCategory,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product operations
  getProducts(categoryId?: string, search?: string): Promise<(Product & { seller: User, category: Category })[]>;
  getProduct(id: string): Promise<(Product & { seller: User, category: Category }) | undefined>;
  getProductsByUserId(userId: string): Promise<(Product & { category: Category })[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<Product>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  incrementProductViews(id: string): Promise<void>;
  
  // Cart operations
  getCartItems(userId: string): Promise<(CartItem & { product: Product & { seller: User } })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem>;
  removeFromCart(id: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrdersByUserId(userId: string): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] })[]>;
  getOrderById(id: string): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] }) | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(categoryData)
      .returning();
    return category;
  }

  // Product operations
  async getProducts(categoryId?: string, search?: string): Promise<(Product & { seller: User, category: Category })[]> {
    let query = db
      .select()
      .from(products)
      .innerJoin(users, eq(products.sellerId, users.id))
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.status, 'active'));

    if (categoryId) {
      query = query.where(and(eq(products.status, 'active'), eq(products.categoryId, categoryId)));
    }

    if (search) {
      query = query.where(and(
        eq(products.status, 'active'),
        sql`${products.title} ILIKE ${`%${search}%`}`
      ));
    }

    const result = await query.orderBy(desc(products.createdAt));
    
    return result.map(row => ({
      ...row.products,
      seller: row.users,
      category: row.categories,
    }));
  }

  async getProduct(id: string): Promise<(Product & { seller: User, category: Category }) | undefined> {
    const result = await db
      .select()
      .from(products)
      .innerJoin(users, eq(products.sellerId, users.id))
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, id));

    if (result.length === 0) return undefined;

    const row = result[0];
    return {
      ...row.products,
      seller: row.users,
      category: row.categories,
    };
  }

  async getProductsByUserId(userId: string): Promise<(Product & { category: Category })[]> {
    const result = await db
      .select()
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.sellerId, userId))
      .orderBy(desc(products.createdAt));

    return result.map(row => ({
      ...row.products,
      category: row.categories,
    }));
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(productData)
      .returning();
    return product;
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({ ...productData, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async incrementProductViews(id: string): Promise<void> {
    await db
      .update(products)
      .set({ views: sql`${products.views} + 1` })
      .where(eq(products.id, id));
  }

  // Cart operations
  async getCartItems(userId: string): Promise<(CartItem & { product: Product & { seller: User } })[]> {
    const result = await db
      .select()
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .innerJoin(users, eq(products.sellerId, users.id))
      .where(eq(cartItems.userId, userId))
      .orderBy(desc(cartItems.createdAt));

    return result.map(row => ({
      ...row.cart_items,
      product: {
        ...row.products,
        seller: row.users,
      },
    }));
  }

  async addToCart(cartItemData: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, cartItemData.userId),
          eq(cartItems.productId, cartItemData.productId)
        )
      );

    if (existingItem.length > 0) {
      // Update quantity if item exists
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: sql`${cartItems.quantity} + ${cartItemData.quantity}` })
        .where(eq(cartItems.id, existingItem[0].id))
        .returning();
      return updatedItem;
    }

    const [cartItem] = await db
      .insert(cartItems)
      .values(cartItemData)
      .returning();
    return cartItem;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem> {
    const [cartItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return cartItem;
  }

  async removeFromCart(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Order operations
  async createOrder(orderData: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(orderData)
      .returning();

    // Insert order items
    const orderItemsData = items.map(item => ({
      ...item,
      orderId: order.id,
    }));

    await db.insert(orderItems).values(orderItemsData);

    // Mark products as sold
    const productIds = items.map(item => item.productId);
    await db
      .update(products)
      .set({ status: 'sold' })
      .where(sql`${products.id} = ANY(${productIds})`);

    return order;
  }

  async getOrdersByUserId(userId: string): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] })[]> {
    const ordersResult = await db
      .select()
      .from(orders)
      .where(eq(orders.buyerId, userId))
      .orderBy(desc(orders.createdAt));

    const ordersWithItems = await Promise.all(
      ordersResult.map(async (order) => {
        const orderItemsResult = await db
          .select()
          .from(orderItems)
          .innerJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id));

        return {
          ...order,
          orderItems: orderItemsResult.map(row => ({
            ...row.order_items,
            product: row.products,
          })),
        };
      })
    );

    return ordersWithItems;
  }

  async getOrderById(id: string): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const orderItemsResult = await db
      .select()
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, id));

    return {
      ...order,
      orderItems: orderItemsResult.map(row => ({
        ...row.order_items,
        product: row.products,
      })),
    };
  }
}

export const storage = new DatabaseStorage();
