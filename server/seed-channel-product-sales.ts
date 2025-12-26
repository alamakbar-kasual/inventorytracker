import { db } from "./db";
import { channelProductSales, productSkus, salesChannels } from "@shared/schema";

async function seedChannelProductSales() {
  console.log("Seeding channel product sales...");

  const allSkus = await db.select().from(productSkus);
  
  if (allSkus.length === 0) {
    console.log("No product SKUs found. Please seed products first.");
    return;
  }

  const channelProductPopularity: Record<string, Record<string, number>> = {
    "Shopee A": { "S": 1.2, "M": 1.5, "L": 1.3, "XL": 0.9, "XXL": 0.7 },
    "Shopee B": { "S": 1.0, "M": 1.4, "L": 1.2, "XL": 1.0, "XXL": 0.8 },
    "Shopee SG": { "S": 1.1, "M": 1.3, "L": 1.1, "XL": 0.8, "XXL": 0.6 },
    "Shopee MY": { "S": 1.0, "M": 1.2, "L": 1.0, "XL": 0.9, "XXL": 0.7 },
    "TikTok": { "S": 1.5, "M": 1.8, "L": 1.4, "XL": 0.7, "XXL": 0.5 },
    "Lazada": { "S": 0.9, "M": 1.3, "L": 1.1, "XL": 1.0, "XXL": 0.8 },
    "Own Website": { "S": 1.0, "M": 1.2, "L": 1.0, "XL": 0.9, "XXL": 0.8 },
    "Blibli": { "S": 0.8, "M": 1.1, "L": 1.0, "XL": 0.9, "XXL": 0.7 },
    "Offline Event": { "S": 1.3, "M": 1.6, "L": 1.4, "XL": 1.1, "XXL": 0.9 }
  };

  const sales: typeof channelProductSales.$inferInsert[] = [];

  for (let dayOffset = 60; dayOffset >= 0; dayOffset--) {
    const date = new Date();
    date.setDate(date.getDate() - dayOffset);
    date.setHours(0, 0, 0, 0);

    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weekendMultiplier = isWeekend ? 1.5 : 1.0;

    for (const channel of salesChannels) {
      const channelPopularity = channelProductPopularity[channel] || {};
      
      for (const sku of allSkus) {
        const sizeMultiplier = channelPopularity[sku.size] || 1.0;
        const baseQuantity = 3 + Math.floor(Math.random() * 8);
        const quantity = Math.round(baseQuantity * sizeMultiplier * weekendMultiplier);
        
        if (quantity > 0 && Math.random() > 0.3) {
          const unitPrice = 150000 + Math.random() * 100000;
          const revenue = Math.round(quantity * unitPrice);

          sales.push({
            channel,
            productSkuId: sku.id,
            quantity,
            revenue,
            saleDate: date,
          });
        }
      }
    }
  }

  const batchSize = 500;
  for (let i = 0; i < sales.length; i += batchSize) {
    const batch = sales.slice(i, i + batchSize);
    await db.insert(channelProductSales).values(batch);
    console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(sales.length / batchSize)}`);
  }

  console.log(`Seeded ${sales.length} channel product sales records`);
}

seedChannelProductSales()
  .then(() => {
    console.log("Channel product sales seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error seeding channel product sales:", error);
    process.exit(1);
  });
