import { db } from './db';
import { materials, stockMovements } from '@shared/schema';

async function seedStockMovements() {
  console.log("Starting stock movement seed...");
  
  try {
    const allMaterials = await db.select().from(materials);
    
    if (allMaterials.length === 0) {
      console.log("No materials found. Please run seed-products.ts first.");
      return;
    }
    
    let movementCount = 0;
    const now = new Date();
    
    for (const material of allMaterials) {
      let currentStock = material.quantity;
      
      for (let daysAgo = 60; daysAgo >= 0; daysAgo--) {
        const movementDate = new Date(now);
        movementDate.setDate(movementDate.getDate() - daysAgo);
        
        if (Math.random() > 0.4) {
          const inboundQty = Math.floor(Math.random() * 50) + 10;
          const previousStock = currentStock;
          currentStock += inboundQty;
          
          await db.insert(stockMovements).values({
            materialId: material.id,
            movementType: 'inbound',
            quantity: inboundQty,
            previousStock,
            newStock: currentStock,
            reason: ['purchase', 'return', 'adjustment'][Math.floor(Math.random() * 3)],
            reference: `PO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            notes: 'Auto-generated stock movement',
            movementDate,
          });
          movementCount++;
        }
        
        if (Math.random() > 0.3) {
          const outboundQty = Math.min(Math.floor(Math.random() * 30) + 5, currentStock);
          if (outboundQty > 0) {
            const previousStock = currentStock;
            currentStock -= outboundQty;
            
            await db.insert(stockMovements).values({
              materialId: material.id,
              movementType: 'outbound',
              quantity: outboundQty,
              previousStock,
              newStock: currentStock,
              reason: ['production', 'waste', 'adjustment'][Math.floor(Math.random() * 3)],
              reference: `PROD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              notes: 'Auto-generated stock movement',
              movementDate,
            });
            movementCount++;
          }
        }
      }
    }
    
    console.log(`Inserted ${movementCount} stock movements`);
    console.log("Stock movement seed completed successfully!");
    
  } catch (error) {
    console.error("Error seeding stock movements:", error);
    throw error;
  }
}

seedStockMovements().then(() => {
  console.log("Done!");
  process.exit(0);
}).catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
