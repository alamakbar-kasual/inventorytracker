import { db } from "./db";
import { materials, materialSkus } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Migration script to move SKUs from materials table to materialSkus table
 * This should be run before updating the schema to remove the SKU column
 */
async function migrateSKUsToSeparateTable() {
  console.log("🔄 Starting SKU migration...");
  
  try {
    // Get all existing materials with SKUs
    const existingMaterials = await db.select().from(materials);
    console.log(`📦 Found ${existingMaterials.length} materials to migrate`);
    
    // For each material, create a corresponding SKU entry
    for (const material of existingMaterials) {
      if (material.sku) {
        try {
          await db.insert(materialSkus).values({
            materialId: material.id,
            sku: material.sku,
            description: `Primary SKU for ${material.name}`,
            isActive: true,
          });
          console.log(`✓ Migrated SKU ${material.sku} for material ${material.name}`);
        } catch (error: any) {
          if (error.code === '23505') {
            console.log(`⚠️  SKU ${material.sku} already exists, skipping...`);
          } else {
            console.error(`❌ Failed to migrate SKU for material ${material.name}:`, error);
          }
        }
      }
    }
    
    console.log("✅ SKU migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateSKUsToSeparateTable()
    .then(() => {
      console.log("🎉 Migration finished!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Migration failed:", error);
      process.exit(1);
    });
}

export { migrateSKUsToSeparateTable };