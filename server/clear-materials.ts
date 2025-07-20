import { db } from "./db";
import { materials, materialSkus, materialConsumption } from "@shared/schema";

export async function clearAllMaterials() {
  try {
    console.log("Starting to clear all materials...");
    
    // Delete in correct order to avoid foreign key constraints
    // 1. First delete material consumption records
    await db.delete(materialConsumption);
    console.log("Deleted all material consumption records");
    
    // 2. Then delete material SKUs
    await db.delete(materialSkus);
    console.log("Deleted all material SKUs");
    
    // 3. Finally delete materials
    await db.delete(materials);
    console.log("Deleted all materials");
    
    console.log("Successfully cleared all materials from the database");
    return { success: true };
  } catch (error) {
    console.error("Error clearing materials:", error);
    return { success: false, error: error.message };
  }
}