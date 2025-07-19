import { db } from "./db";
import { activityLogs } from "@shared/schema";

async function seedActivityLogs() {
  console.log("🌱 Seeding activity logs...");

  const sampleLogs = [
    {
      userId: "admin",
      action: "CREATE",
      entityType: "materials",
      entityId: 101,
      entityName: "Black Cotton Canvas",
      description: "Created new material: Black Cotton Canvas in category Fabric",
      metadata: JSON.stringify({
        category: "Fabric",
        initialQuantity: 50,
        supplier: "Premium Textiles Co"
      }),
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0"
    },
    {
      userId: "manager",
      action: "UPDATE",
      entityType: "materials", 
      entityId: 101,
      entityName: "Black Cotton Canvas",
      description: "Updated material quantity from 50 to 45 units",
      metadata: JSON.stringify({
        previousQuantity: 50,
        newQuantity: 45,
        reason: "Material consumption"
      }),
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0"
    },
    {
      userId: "employee",
      action: "CREATE",
      entityType: "materials",
      entityId: 102,
      entityName: "Polyester Thread",
      description: "Added new material: Polyester Thread for production",
      metadata: JSON.stringify({
        category: "Thread",
        initialQuantity: 100,
        supplier: "Thread Masters Inc"
      }),
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0"
    },
    {
      userId: "admin",
      action: "DELETE",
      entityType: "materials",
      entityId: 103,
      entityName: "Old Fabric Sample",
      description: "Removed discontinued material: Old Fabric Sample",
      metadata: JSON.stringify({
        reason: "Product discontinuation",
        finalQuantity: 0
      }),
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0"
    },
    {
      userId: "manager",
      action: "VIEW",
      entityType: "analytics",
      entityId: null,
      entityName: "Inventory Dashboard",
      description: "Accessed inventory analytics dashboard",
      metadata: JSON.stringify({
        section: "overview",
        duration: "5 minutes"
      }),
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0"
    },
    {
      userId: "admin",
      action: "LOGIN",
      entityType: "users",
      entityId: 1,
      entityName: "Administrator",
      description: "User logged into the system",
      metadata: JSON.stringify({
        loginMethod: "password",
        sessionDuration: "2 hours"
      }),
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0"
    },
    {
      userId: "employee",
      action: "UPDATE",
      entityType: "materials",
      entityId: 100,
      entityName: "Cotton Blend",
      description: "Material quantity updated due to production consumption",
      metadata: JSON.stringify({
        consumedQuantity: 10,
        productionOrder: "PO-2025-001",
        remainingQuantity: 15
      }),
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0"
    },
    {
      userId: "manager",
      action: "CREATE",
      entityType: "users",
      entityId: 5,
      entityName: "New Employee",
      description: "Created new user account for production assistant",
      metadata: JSON.stringify({
        role: "employee",
        department: "production",
        permissions: ["view_materials", "update_inventory"]
      }),
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0"
    }
  ];

  try {
    // Insert logs with different timestamps (spread over last 7 days)
    const now = new Date();
    for (let i = 0; i < sampleLogs.length; i++) {
      const log = sampleLogs[i];
      const timestamp = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000 / 2)); // Spread over time
      
      await db.insert(activityLogs).values({
        ...log,
        timestamp
      });
    }

    console.log("✅ Activity logs seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding activity logs:", error);
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedActivityLogs()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedActivityLogs };