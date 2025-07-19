import { pgTable, text, serial, integer, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  quantity: integer("quantity").notNull().default(0),
  unit: varchar("unit", { length: 20 }).notNull(),
  minStockLevel: integer("min_stock_level").default(10),
  // New fields for enhanced material tracking
  dateOfPurchase: timestamp("date_of_purchase"),
  supplierName: text("supplier_name"),
  totalYards: integer("total_yards"), // For fabric length tracking
  usageForProduct: text("usage_for_product"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Material SKUs table - allows multiple SKUs per material
export const materialSkus = pgTable("material_skus", {
  id: serial("id").primaryKey(),
  materialId: integer("material_id").references(() => materials.id, { onDelete: "cascade" }).notNull(),
  sku: varchar("sku", { length: 50 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const materialsRelations = relations(materials, ({ many }) => ({
  skus: many(materialSkus),
}));

export const materialSkusRelations = relations(materialSkus, ({ one }) => ({
  material: one(materials, {
    fields: [materialSkus.materialId],
    references: [materials.id],
  }),
}));

export const insertMaterialSchema = createInsertSchema(materials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateMaterialSchema = createInsertSchema(materials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export const insertMaterialSkuSchema = createInsertSchema(materialSkus).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateMaterialSkuSchema = createInsertSchema(materialSkus).omit({
  id: true,
  materialId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type Material = typeof materials.$inferSelect;
export type MaterialSku = typeof materialSkus.$inferSelect;
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type UpdateMaterial = z.infer<typeof updateMaterialSchema>;
export type InsertMaterialSku = z.infer<typeof insertMaterialSkuSchema>;
export type UpdateMaterialSku = z.infer<typeof updateMaterialSkuSchema>;

// Extended material type with SKUs
export type MaterialWithSkus = Material & { skus: MaterialSku[] };

export const categories = [
  "Fabrics",
  "Buttons", 
  "Threads",
  "Zippers",
  "Accessories",
  "Hardware",
  "Trims",
  "Elastic",
  "Lining",
  "Interfacing"
] as const;

export type Category = typeof categories[number];

// Products table for COGS tracking
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product SKUs table (product variants with sizes)
export const productSkus = pgTable("product_skus", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  sku: varchar("sku", { length: 50 }).notNull().unique(),
  size: varchar("size", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Material consumption table (tracks how much material is used per product SKU)
export const materialConsumption = pgTable("material_consumption", {
  id: serial("id").primaryKey(),
  materialId: integer("material_id").references(() => materials.id).notNull(),
  productSkuId: integer("product_sku_id").references(() => productSkus.id).notNull(),
  quantityUsed: integer("quantity_used").notNull(), // Amount used per unit
  quantityProduced: integer("quantity_produced").notNull().default(1), // How many items produced
  dateUsed: timestamp("date_used").defaultNow(),  // When the material was used
  consumedAt: timestamp("consumed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSkuSchema = createInsertSchema(productSkus).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMaterialConsumptionSchema = createInsertSchema(materialConsumption).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Product = typeof products.$inferSelect;
export type ProductSku = typeof productSkus.$inferSelect;
export type MaterialConsumption = typeof materialConsumption.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertProductSku = z.infer<typeof insertProductSkuSchema>;
export type InsertMaterialConsumption = z.infer<typeof insertMaterialConsumptionSchema>;

// User roles and permissions
export const roles = [
  "admin",
  "manager", 
  "employee",
  "viewer"
] as const;

export type UserRole = typeof roles[number];

// User management tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: text("name").notNull(),
  password: text("password"), // For local auth, can be null for OAuth users
  role: varchar("role", { length: 20 }).notNull().default("employee"),
  isActive: boolean("is_active").notNull().default(true),
  department: varchar("department", { length: 100 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  profileImage: text("profile_image"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userPermissions = pgTable("user_permissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  permission: varchar("permission", { length: 50 }).notNull(),
  resource: varchar("resource", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
}).extend({
  role: z.enum(roles),
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phoneNumber: z.string().optional(),
  department: z.string().optional(),
});

export const updateUserSchema = insertUserSchema.omit({
  password: true,
}).partial();

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
});

export const insertUserPermissionSchema = createInsertSchema(userPermissions).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type UserSession = typeof userSessions.$inferSelect;  
export type UserPermission = typeof userPermissions.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type InsertUserPermission = z.infer<typeof insertUserPermissionSchema>;

// Role permissions mapping
export const rolePermissions: Record<UserRole, string[]> = {
  admin: ["*"], // All permissions
  manager: [
    "materials:read",
    "materials:create", 
    "materials:update",
    "materials:delete",
    "users:read",
    "users:create",
    "users:update",
    "analytics:read",
    "settings:read",
    "settings:update"
  ],
  employee: [
    "materials:read",
    "materials:create",
    "materials:update", 
    "analytics:read",
    "settings:read"
  ],
  viewer: [
    "materials:read",
    "analytics:read"
  ]
};
