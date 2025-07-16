import { pgTable, text, serial, integer, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  quantity: integer("quantity").notNull().default(0),
  unit: varchar("unit", { length: 20 }).notNull(),
  sku: varchar("sku", { length: 50 }).notNull().unique(),
  minStockLevel: integer("min_stock_level").default(10),
  // New fields for enhanced material tracking
  dateOfPurchase: timestamp("date_of_purchase"),
  supplierName: text("supplier_name"),
  totalYards: integer("total_yards"), // For fabric length tracking
  usageForProduct: text("usage_for_product"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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

export type Material = typeof materials.$inferSelect;
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type UpdateMaterial = z.infer<typeof updateMaterialSchema>;

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
