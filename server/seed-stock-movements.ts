import { db } from './db';
import { materials, stockMovements, products, productSkus } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function seedStockMovements() {
  console.log("Starting stock movement seed...");
  
  try {
    const allMaterials = await db.select().from(materials);
    const allProductSkus = await db.select().from(productSkus);
    const allProducts = await db.select().from(products);
    
    if (allMaterials.length === 0) {
      console.log("No materials found. Please run seed-products.ts first.");
      return;
    }

    const pantsThumbnails = [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=100&h=100&fit=crop',
    ];
    
    const shirtThumbnails = [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=100&h=100&fit=crop',
    ];

    console.log("Updating products with thumbnails...");
    for (const product of allProducts) {
      const isPants = product.name.toLowerCase().includes('pants') || 
                     product.name.toLowerCase().includes('jeans') ||
                     product.name.toLowerCase().includes('trousers') ||
                     product.name.toLowerCase().includes('chinos');
      const thumbnails = isPants ? pantsThumbnails : shirtThumbnails;
      const thumbnail = thumbnails[Math.floor(Math.random() * thumbnails.length)];
      
      await db.update(products)
        .set({ thumbnailUrl: thumbnail })
        .where(eq(products.id, product.id));
    }
    console.log(`Updated ${allProducts.length} products with thumbnails`);
    
    let movementCount = 0;
    const now = new Date();
    
    for (const material of allMaterials) {
      let currentStock = material.quantity;
      const relevantSkus = allProductSkus.slice(0, Math.min(allProductSkus.length, 50));
      
      for (let daysAgo = 60; daysAgo >= 0; daysAgo--) {
        const movementDate = new Date(now);
        movementDate.setDate(movementDate.getDate() - daysAgo);
        
        if (Math.random() > 0.4) {
          const inboundQty = Math.floor(Math.random() * 50) + 10;
          const previousStock = currentStock;
          currentStock += inboundQty;
          const randomSku = relevantSkus[Math.floor(Math.random() * relevantSkus.length)];
          
          await db.insert(stockMovements).values({
            materialId: material.id,
            productSkuId: randomSku?.id || null,
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
            const randomSku = relevantSkus[Math.floor(Math.random() * relevantSkus.length)];
            
            await db.insert(stockMovements).values({
              materialId: material.id,
              productSkuId: randomSku?.id || null,
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
