import { db } from "./db";
import { channelOrders, salesChannels } from "@shared/schema";

async function seedChannelOrders() {
  console.log("Seeding channel orders...");

  const channelBaseOrders: Record<string, { base: number; variance: number; trend: number }> = {
    "Shopee A": { base: 45, variance: 15, trend: 1.02 },
    "Shopee B": { base: 32, variance: 12, trend: 1.01 },
    "Shopee SG": { base: 18, variance: 8, trend: 1.05 },
    "Shopee MY": { base: 15, variance: 6, trend: 1.03 },
    "TikTok": { base: 55, variance: 20, trend: 1.08 },
    "Lazada": { base: 28, variance: 10, trend: 0.98 },
    "Own Website": { base: 12, variance: 5, trend: 1.04 },
    "Blibli": { base: 8, variance: 4, trend: 0.95 },
    "Offline Event": { base: 25, variance: 15, trend: 1.0 }
  };

  const orders: typeof channelOrders.$inferInsert[] = [];

  for (let dayOffset = 60; dayOffset >= 0; dayOffset--) {
    const date = new Date();
    date.setDate(date.getDate() - dayOffset);
    date.setHours(0, 0, 0, 0);

    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weekendMultiplier = isWeekend ? 1.4 : 1.0;

    for (const channel of salesChannels) {
      const config = channelBaseOrders[channel];
      const trendMultiplier = Math.pow(config.trend, (60 - dayOffset) / 30);
      const randomVariance = (Math.random() - 0.5) * 2 * config.variance;
      
      let orderCount = Math.round(
        (config.base + randomVariance) * weekendMultiplier * trendMultiplier
      );
      orderCount = Math.max(0, orderCount);

      const avgOrderValue = 150000 + Math.random() * 100000;
      const totalRevenue = Math.round(orderCount * avgOrderValue);

      orders.push({
        channel,
        orderCount,
        totalRevenue,
        orderDate: date,
      });
    }
  }

  await db.insert(channelOrders).values(orders);
  console.log(`Seeded ${orders.length} channel order records`);
}

seedChannelOrders()
  .then(() => {
    console.log("Channel orders seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error seeding channel orders:", error);
    process.exit(1);
  });
