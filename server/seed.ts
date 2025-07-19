import { db } from "./db";
import { materials, products, productSkus } from "@shared/schema";

async function seedDatabase() {
  console.log("Seeding database...");
  
  try {
    // Clear existing data
    await db.delete(productSkus);
    await db.delete(products);
    await db.delete(materials);
    
    // Insert sample materials
    const sampleMaterials = [
      {
        name: "Cotton Denim",
        description: "Premium quality cotton denim fabric",
        category: "Fabrics",
        quantity: 45,
        unit: "yards",
        sku: "DENIM-001",
        minStockLevel: 15,
        dateOfPurchase: new Date('2024-01-15'),
        supplierName: "Textile Mills Inc",
        totalYards: 50,
        usageForProduct: "Jeans, shorts"
      },
      {
        name: "Polyester Thread",
        description: "High-strength polyester thread for heavy-duty stitching",
        category: "Threads",
        quantity: 8,
        unit: "spools",
        sku: "THREAD-002",
        minStockLevel: 10,
        dateOfPurchase: new Date('2024-01-20'),
        supplierName: "Thread Co",
        totalYards: null,
        usageForProduct: "All garments"
      },
      {
        name: "Metal Buttons",
        description: "Premium metal buttons with antique finish",
        category: "Buttons",
        quantity: 150,
        unit: "pieces",
        sku: "BTN-003",
        minStockLevel: 50,
        dateOfPurchase: new Date('2024-01-10'),
        supplierName: "Button Works",
        totalYards: null,
        usageForProduct: "Blazers, coats"
      },
      {
        name: "Black Cotton Canvas",
        description: "Heavy-duty black cotton canvas",
        category: "Fabrics",
        quantity: 25,
        unit: "yards",
        sku: "CANVAS-004",
        minStockLevel: 10,
        dateOfPurchase: new Date('2024-01-25'),
        supplierName: "Canvas Supply Co",
        totalYards: 30,
        usageForProduct: "Bags, aprons"
      }
    ];

    await db.insert(materials).values(sampleMaterials);
    console.log("Materials seeded successfully");

    // Insert sample products
    const sampleProducts = [
      { name: "Black Ankle Pant", description: "Tailored ankle-length pants in black" },
      { name: "Denim Jacket", description: "Classic denim jacket with metal button details" },
      { name: "Casual Blazer", description: "Smart casual blazer for everyday wear" }
    ];

    const insertedProducts = await db.insert(products).values(sampleProducts).returning();
    console.log("Products seeded successfully");

    // Insert sample product SKUs
    const sampleProductSkus = [
      // Black Ankle Pant SKUs
      { productId: insertedProducts[0].id, sku: "BAP-S-001", size: "S" },
      { productId: insertedProducts[0].id, sku: "BAP-M-001", size: "M" },
      { productId: insertedProducts[0].id, sku: "BAP-L-001", size: "L" },
      
      // Denim Jacket SKUs
      { productId: insertedProducts[1].id, sku: "DJ-S-001", size: "S" },
      { productId: insertedProducts[1].id, sku: "DJ-M-001", size: "M" },
      { productId: insertedProducts[1].id, sku: "DJ-L-001", size: "L" },
      
      // Casual Blazer SKUs
      { productId: insertedProducts[2].id, sku: "BLZ-S-001", size: "S" },
      { productId: insertedProducts[2].id, sku: "BLZ-M-001", size: "M" }
    ];

    await db.insert(productSkus).values(sampleProductSkus);
    console.log("Product SKUs seeded successfully");
    
    console.log("Database seeding completed!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedDatabase };