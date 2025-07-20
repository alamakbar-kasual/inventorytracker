import { db } from "./db";
import { sql } from "drizzle-orm";

export async function createIndexes() {
  try {
    console.log("Creating database indexes for performance...");
    
    // Index for materials table
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_materials_category 
      ON materials(category)
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_materials_quantity_min_stock 
      ON materials(quantity, min_stock_level)
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_materials_supplier 
      ON materials(supplier_name)
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_materials_purchase_date 
      ON materials(date_of_purchase)
    `);
    
    // Index for material_skus table
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_material_skus_material_id 
      ON material_skus(material_id)
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_material_skus_sku 
      ON material_skus(sku)
    `);
    
    // Index for material_consumption table
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_material_consumption_material_id 
      ON material_consumption(material_id)
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_material_consumption_consumed_at 
      ON material_consumption(consumed_at)
    `);
    
    console.log("Database indexes created successfully!");
  } catch (error) {
    console.error("Error creating indexes:", error);
  }
}