import { db } from "./db";
import { materials } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seedFinanceData() {
  console.log("🏦 Seeding finance data...");

  // Add pricing information to existing materials
  const priceUpdates = [
    { id: 113, unitPrice: 1500, totalValue: 75000 }, // Black Cotton Canvas: $15/unit, 50 units = $750
    { id: 114, unitPrice: 850, totalValue: 21250 }, // Polyester Thread: $8.50/unit, 25 units = $212.50  
    { id: 115, unitPrice: 2200, totalValue: 33000 }, // Cotton Blend: $22/unit, 15 units = $330
    { id: 116, unitPrice: 1800, totalValue: 36000 }, // Silk Fabric: $18/unit, 20 units = $360
  ];

  try {
    for (const update of priceUpdates) {
      await db.update(materials)
        .set({
          unitPrice: update.unitPrice,
          totalValue: update.totalValue,
          currency: "USD"
        })
        .where(eq(materials.id, update.id));
    }

    console.log("✅ Finance data seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding finance data:", error);
  }
}

// Run seeding if called directly
export { seedFinanceData };