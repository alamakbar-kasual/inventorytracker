import { db } from "./db";
import { 
  materials, 
  materialSkus, 
  products, 
  productSkus, 
  materialConsumption,
  type InsertMaterial,
  type InsertMaterialSku,
  type InsertProduct,
  type InsertProductSku,
  type InsertMaterialConsumption
} from "@shared/schema";

// Seeding logic removed to prevent accidental re-seeding
export async function seedDatabase() {
  console.log("Seeding is disabled.");
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("Seeding is disabled.");
  process.exit(0);
}