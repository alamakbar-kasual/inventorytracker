import { 
  materials, 
  materialSkus,
  products, 
  productSkus, 
  materialConsumption,
  activityLogs,

  type Material,
  type MaterialSku,
  type MaterialWithSkus, 
  type InsertMaterial, 
  type UpdateMaterial,
  type InsertMaterialSku,
  type UpdateMaterialSku,
  type Product,
  type ProductSku,
  type MaterialConsumption,
  type InsertProduct,
  type InsertProductSku,
  type InsertMaterialConsumption,
  type ActivityLog,
  type InsertActivityLog,

} from "@shared/schema";
import { db } from "./db";
import { eq, like, desc, asc, sql } from "drizzle-orm";

export interface IStorage {
  // Material methods
  getMaterials(options?: { limit?: number; offset?: number }): Promise<MaterialWithSkus[]>;
  getMaterial(id: number): Promise<MaterialWithSkus | undefined>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  updateMaterial(id: number, updates: UpdateMaterial): Promise<Material | undefined>;
  deleteMaterial(id: number): Promise<boolean>;
  searchMaterials(query: string): Promise<MaterialWithSkus[]>;
  getMaterialsByCategory(category: string): Promise<MaterialWithSkus[]>;
  getLowStockMaterials(): Promise<MaterialWithSkus[]>;
  getStockStats(): Promise<{ totalItems: number; lowStock: number; categories: number }>;
  
  // Material SKU methods
  getMaterialSkus(materialId: number): Promise<MaterialSku[]>;
  getMaterialSku(id: number): Promise<MaterialSku | undefined>;
  createMaterialSku(materialSku: InsertMaterialSku): Promise<MaterialSku>;
  updateMaterialSku(id: number, updates: UpdateMaterialSku): Promise<MaterialSku | undefined>;
  deleteMaterialSku(id: number): Promise<boolean>;
  getMaterialByAnySku(sku: string): Promise<{ material: Material; sku: MaterialSku } | undefined>;
  
  // Product methods
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Product SKU methods
  getProductSkus(): Promise<ProductSku[]>;
  getProductSkusByProduct(productId: number): Promise<ProductSku[]>;
  createProductSku(productSku: InsertProductSku): Promise<ProductSku>;
  
  // Material consumption methods
  getMaterialConsumption(): Promise<MaterialConsumption[]>;
  createMaterialConsumption(consumption: InsertMaterialConsumption): Promise<MaterialConsumption>;
  
  // Activity log methods
  getActivityLogs(): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  

  consumeMaterial(consumption: InsertMaterialConsumption): Promise<MaterialConsumption>;
  getMaterialRemainingQuantity(materialId: number): Promise<number>;
  getConsumptionByMaterial(materialId: number): Promise<MaterialConsumption[]>;
}

export class MemStorage implements IStorage {
  private materials: Map<number, Material>;
  private products: Map<number, Product>;
  private productSkus: Map<number, ProductSku>;
  private materialConsumption: Map<number, MaterialConsumption>;
  private currentMaterialId: number;
  private currentProductId: number;
  private currentProductSkuId: number;
  private currentConsumptionId: number;

  constructor() {
    this.materials = new Map();
    this.products = new Map();
    this.productSkus = new Map();
    this.materialConsumption = new Map();
    this.currentMaterialId = 1;
    this.currentProductId = 1;
    this.currentProductSkuId = 1;
    this.currentConsumptionId = 1;
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Add sample materials to demonstrate the new features
    const sampleMaterials = [
      {
        name: "Cotton Denim",
        description: "Premium quality cotton denim fabric",
        category: "Fabrics",
        quantity: 50,
        unit: "yards",
        sku: "FAB-COT-001",
        minStockLevel: 20,
        dateOfPurchase: new Date("2024-01-15"),
        supplierName: "Textile Mills Co.",
        totalYards: 100,
        usageForProduct: "Jeans Collection Spring 2024",
      },
      {
        name: "Silk Organza",
        description: "Luxurious silk organza for evening wear",
        category: "Fabrics",
        quantity: 15,
        unit: "yards",
        sku: "FAB-SIL-002",
        minStockLevel: 10,
        dateOfPurchase: new Date("2024-02-10"),
        supplierName: "Premium Silk Ltd",
        totalYards: 30,
        usageForProduct: "Evening Gown Collection",
      },
      {
        name: "Metal Buttons",
        description: "Antique brass metal buttons 15mm",
        category: "Buttons",
        quantity: 500,
        unit: "pieces",
        sku: "BUT-MET-003",
        minStockLevel: 100,
        dateOfPurchase: new Date("2024-01-20"),
        supplierName: "Button Factory Inc",
        totalYards: null,
        usageForProduct: "Blazer Collection",
      },
      {
        name: "Polyester Thread",
        description: "High strength polyester thread - Navy Blue",
        category: "Threads",
        quantity: 8,
        unit: "spools",
        sku: "THR-POL-004",
        minStockLevel: 12,
        dateOfPurchase: new Date("2024-02-05"),
        supplierName: "Thread Solutions",
        totalYards: null,
        usageForProduct: "General Production",
      },
    ];

    sampleMaterials.forEach((material) => {
      const id = this.currentMaterialId++;
      const now = new Date();
      const sampleMaterial = {
        ...material,
        id,
        createdAt: now,
        updatedAt: now,
      };
      this.materials.set(id, sampleMaterial);
    });

    // Add sample products
    const sampleProducts = [
      {
        name: "Black Ankle Pant",
        description: "Stylish black ankle pants for casual wear",
      },
      {
        name: "Evening Gown",
        description: "Elegant evening gown for special occasions",
      },
      {
        name: "Blazer",
        description: "Professional blazer for business attire",
      },
    ];

    sampleProducts.forEach((product) => {
      const id = this.currentProductId++;
      const now = new Date();
      const sampleProduct = {
        ...product,
        id,
        createdAt: now,
        updatedAt: now,
      };
      this.products.set(id, sampleProduct);
    });

    // Add sample product SKUs
    const sampleProductSkus = [
      { productId: 1, sku: "BAP-S-001", size: "S" },
      { productId: 1, sku: "BAP-M-001", size: "M" },
      { productId: 1, sku: "BAP-L-001", size: "L" },
      { productId: 2, sku: "EG-S-001", size: "S" },
      { productId: 2, sku: "EG-M-001", size: "M" },
      { productId: 3, sku: "BLZ-S-001", size: "S" },
      { productId: 3, sku: "BLZ-M-001", size: "M" },
    ];

    sampleProductSkus.forEach((productSku) => {
      const id = this.currentProductSkuId++;
      const now = new Date();
      const sampleProductSku = {
        ...productSku,
        id,
        createdAt: now,
        updatedAt: now,
      };
      this.productSkus.set(id, sampleProductSku);
    });
  }

  async getMaterials(options?: { limit?: number; offset?: number }): Promise<MaterialWithSkus[]> {
    let materials = Array.from(this.materials.values()).sort((a, b) => b.id - a.id);
    
    // Apply pagination if provided
    if (options?.offset) {
      materials = materials.slice(options.offset);
    }
    if (options?.limit) {
      materials = materials.slice(0, options.limit);
    }
    
    // Convert to MaterialWithSkus format (MemStorage doesn't have separate SKUs)
    return materials.map(m => ({ ...m, skus: [] }));
  }

  async getMaterial(id: number): Promise<Material | undefined> {
    return this.materials.get(id);
  }

  async getMaterialBySku(sku: string): Promise<Material | undefined> {
    return Array.from(this.materials.values()).find(
      (material) => material.sku === sku
    );
  }

  async createMaterial(insertMaterial: InsertMaterial): Promise<Material> {
    const id = this.currentMaterialId++;
    const now = new Date();
    const material: Material = {
      ...insertMaterial,
      id,
      description: insertMaterial.description || null,
      quantity: insertMaterial.quantity || 0,
      minStockLevel: insertMaterial.minStockLevel || 10,
      dateOfPurchase: insertMaterial.dateOfPurchase || null,
      supplierName: insertMaterial.supplierName || null,
      totalYards: insertMaterial.totalYards || null,
      usageForProduct: insertMaterial.usageForProduct || null,
      createdAt: now,
      updatedAt: now,
    };
    this.materials.set(id, material);
    return material;
  }

  async updateMaterial(id: number, updates: UpdateMaterial): Promise<Material | undefined> {
    const existing = this.materials.get(id);
    if (!existing) return undefined;

    const updated: Material = {
      ...existing,
      ...updates,
      description: updates.description !== undefined ? updates.description : existing.description,
      quantity: updates.quantity !== undefined ? updates.quantity : existing.quantity,
      minStockLevel: updates.minStockLevel !== undefined ? updates.minStockLevel : existing.minStockLevel,
      dateOfPurchase: updates.dateOfPurchase !== undefined ? updates.dateOfPurchase : existing.dateOfPurchase,
      supplierName: updates.supplierName !== undefined ? updates.supplierName : existing.supplierName,
      totalYards: updates.totalYards !== undefined ? updates.totalYards : existing.totalYards,
      usageForProduct: updates.usageForProduct !== undefined ? updates.usageForProduct : existing.usageForProduct,
      updatedAt: new Date(),
    };
    this.materials.set(id, updated);
    return updated;
  }

  async deleteMaterial(id: number): Promise<boolean> {
    return this.materials.delete(id);
  }

  async searchMaterials(query: string): Promise<Material[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.materials.values()).filter(
      (material) =>
        material.name.toLowerCase().includes(lowercaseQuery) ||
        material.description?.toLowerCase().includes(lowercaseQuery) ||
        material.sku.toLowerCase().includes(lowercaseQuery) ||
        material.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getMaterialsByCategory(category: string): Promise<Material[]> {
    return Array.from(this.materials.values()).filter(
      (material) => material.category === category
    );
  }

  async getLowStockMaterials(): Promise<Material[]> {
    return Array.from(this.materials.values()).filter(
      (material) => material.quantity <= (material.minStockLevel || 10)
    );
  }

  async getStockStats(): Promise<{ totalItems: number; lowStock: number; categories: number }> {
    const materials = Array.from(this.materials.values());
    const lowStockMaterials = await this.getLowStockMaterials();
    const categories = new Set(materials.map(m => m.category));
    
    return {
      totalItems: materials.length,
      lowStock: lowStockMaterials.length,
      categories: categories.size,
    };
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).sort((a, b) => b.id - a.id);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const now = new Date();
    const product: Product = {
      ...insertProduct,
      id,
      description: insertProduct.description || null,
      createdAt: now,
      updatedAt: now,
    };
    this.products.set(id, product);
    return product;
  }

  // Product SKU methods
  async getProductSkus(): Promise<ProductSku[]> {
    return Array.from(this.productSkus.values()).sort((a, b) => b.id - a.id);
  }

  async getProductSkusByProduct(productId: number): Promise<ProductSku[]> {
    return Array.from(this.productSkus.values()).filter(
      (sku) => sku.productId === productId
    );
  }

  async createProductSku(insertProductSku: InsertProductSku): Promise<ProductSku> {
    const id = this.currentProductSkuId++;
    const now = new Date();
    const productSku: ProductSku = {
      ...insertProductSku,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.productSkus.set(id, productSku);
    return productSku;
  }

  // Material consumption methods
  async getMaterialConsumption(): Promise<MaterialConsumption[]> {
    return Array.from(this.materialConsumption.values()).sort((a, b) => b.id - a.id);
  }

  async consumeMaterial(insertConsumption: InsertMaterialConsumption): Promise<MaterialConsumption> {
    const id = this.currentConsumptionId++;
    const now = new Date();
    const consumption: MaterialConsumption = {
      ...insertConsumption,
      id,
      quantityProduced: insertConsumption.quantityProduced || 1,
      consumedAt: insertConsumption.consumedAt || now,
      createdAt: now,
      updatedAt: now,
    };
    
    // Update material quantity
    const material = this.materials.get(insertConsumption.materialId);
    if (material) {
      const totalUsed = insertConsumption.quantityUsed * (insertConsumption.quantityProduced || 1);
      material.quantity = Math.max(0, material.quantity - totalUsed);
      material.updatedAt = now;
      this.materials.set(material.id, material);
    }
    
    this.materialConsumption.set(id, consumption);
    return consumption;
  }

  async getMaterialRemainingQuantity(materialId: number): Promise<number> {
    const material = this.materials.get(materialId);
    if (!material) return 0;
    
    return material.quantity;
  }

  async getConsumptionByMaterial(materialId: number): Promise<MaterialConsumption[]> {
    return Array.from(this.materialConsumption.values()).filter(
      (consumption) => consumption.materialId === materialId
    );
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // Material methods
  async getMaterials(options?: { limit?: number; offset?: number }): Promise<MaterialWithSkus[]> {
    // Fetch all materials and their SKUs in a single query using a LEFT JOIN
    let query = db
      .select({
        material: materials,
        sku: materialSkus
      })
      .from(materials)
      .leftJoin(materialSkus, eq(materials.id, materialSkus.materialId))
      .orderBy(desc(materials.id), desc(materialSkus.createdAt));
    
    // Apply pagination if provided
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.offset(options.offset);
    }
    
    const result = await query;
    
    // Group the results by material
    const materialsMap = new Map<number, MaterialWithSkus>();
    
    for (const row of result) {
      if (!row.material) continue;
      
      const materialId = row.material.id;
      
      if (!materialsMap.has(materialId)) {
        materialsMap.set(materialId, {
          ...row.material,
          skus: []
        });
      }
      
      if (row.sku) {
        const materialWithSkus = materialsMap.get(materialId)!;
        // Avoid duplicate SKUs
        if (!materialWithSkus.skus.some(s => s.id === row.sku!.id)) {
          materialWithSkus.skus.push(row.sku);
        }
      }
    }
    
    return Array.from(materialsMap.values());
  }

  async getMaterial(id: number): Promise<MaterialWithSkus | undefined> {
    const [material] = await db.select().from(materials).where(eq(materials.id, id));
    if (!material) return undefined;
    
    const skus = await db.select().from(materialSkus)
      .where(eq(materialSkus.materialId, id))
      .orderBy(desc(materialSkus.createdAt));
    return { ...material, skus };
  }

  // Get material by any SKU
  async getMaterialByAnySku(sku: string): Promise<{ material: Material; sku: MaterialSku } | undefined> {
    const [skuResult] = await db.select().from(materialSkus).where(eq(materialSkus.sku, sku));
    if (!skuResult) return undefined;
    
    const [materialResult] = await db.select().from(materials).where(eq(materials.id, skuResult.materialId));
    if (!materialResult) return undefined;
    
    return { material: materialResult, sku: skuResult };
  }

  async createMaterial(insertMaterial: InsertMaterial): Promise<Material> {
    const [material] = await db
      .insert(materials)
      .values({
        ...insertMaterial,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return material;
  }

  async updateMaterial(id: number, updates: UpdateMaterial): Promise<Material | undefined> {
    const [material] = await db
      .update(materials)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(materials.id, id))
      .returning();
    return material || undefined;
  }

  async deleteMaterial(id: number): Promise<boolean> {
    const result = await db.delete(materials).where(eq(materials.id, id));
    return result.rowCount !== undefined && result.rowCount > 0;
  }

  async searchMaterials(query: string): Promise<MaterialWithSkus[]> {
    const lowercaseQuery = `%${query.toLowerCase()}%`;
    
    // Use a single query with LEFT JOIN to fetch materials and their SKUs
    const result = await db
      .select({
        material: materials,
        sku: materialSkus
      })
      .from(materials)
      .leftJoin(materialSkus, eq(materials.id, materialSkus.materialId))
      .where(
        sql`LOWER(${materials.name}) LIKE ${lowercaseQuery} OR 
            LOWER(${materials.description}) LIKE ${lowercaseQuery} OR 
            LOWER(${materials.category}) LIKE ${lowercaseQuery}`
      )
      .orderBy(desc(materials.id), desc(materialSkus.createdAt));
    
    // Group the results by material
    const materialsMap = new Map<number, MaterialWithSkus>();
    
    for (const row of result) {
      if (!row.material) continue;
      
      const materialId = row.material.id;
      
      if (!materialsMap.has(materialId)) {
        materialsMap.set(materialId, {
          ...row.material,
          skus: []
        });
      }
      
      if (row.sku) {
        const materialWithSkus = materialsMap.get(materialId)!;
        if (!materialWithSkus.skus.some(s => s.id === row.sku!.id)) {
          materialWithSkus.skus.push(row.sku);
        }
      }
    }
    
    return Array.from(materialsMap.values());
  }

  async getMaterialsByCategory(category: string): Promise<MaterialWithSkus[]> {
    // Use a single query with LEFT JOIN to fetch materials and their SKUs
    const result = await db
      .select({
        material: materials,
        sku: materialSkus
      })
      .from(materials)
      .leftJoin(materialSkus, eq(materials.id, materialSkus.materialId))
      .where(eq(materials.category, category))
      .orderBy(desc(materials.id), desc(materialSkus.createdAt));
    
    // Group the results by material
    const materialsMap = new Map<number, MaterialWithSkus>();
    
    for (const row of result) {
      if (!row.material) continue;
      
      const materialId = row.material.id;
      
      if (!materialsMap.has(materialId)) {
        materialsMap.set(materialId, {
          ...row.material,
          skus: []
        });
      }
      
      if (row.sku) {
        const materialWithSkus = materialsMap.get(materialId)!;
        if (!materialWithSkus.skus.some(s => s.id === row.sku!.id)) {
          materialWithSkus.skus.push(row.sku);
        }
      }
    }
    
    return Array.from(materialsMap.values());
  }

  async getLowStockMaterials(): Promise<MaterialWithSkus[]> {
    // Use a single query with LEFT JOIN to fetch materials and their SKUs
    const result = await db
      .select({
        material: materials,
        sku: materialSkus
      })
      .from(materials)
      .leftJoin(materialSkus, eq(materials.id, materialSkus.materialId))
      .where(sql`${materials.quantity} <= ${materials.minStockLevel}`)
      .orderBy(desc(materials.id), desc(materialSkus.createdAt));
    
    // Group the results by material
    const materialsMap = new Map<number, MaterialWithSkus>();
    
    for (const row of result) {
      if (!row.material) continue;
      
      const materialId = row.material.id;
      
      if (!materialsMap.has(materialId)) {
        materialsMap.set(materialId, {
          ...row.material,
          skus: []
        });
      }
      
      if (row.sku) {
        const materialWithSkus = materialsMap.get(materialId)!;
        if (!materialWithSkus.skus.some(s => s.id === row.sku!.id)) {
          materialWithSkus.skus.push(row.sku);
        }
      }
    }
    
    return Array.from(materialsMap.values());
  }

  async getStockStats(): Promise<{ totalItems: number; lowStock: number; categories: number }> {
    const [totalItems] = await db.select({ count: sql<number>`count(*)` }).from(materials);
    
    const [lowStockCount] = await db.select({ count: sql<number>`count(*)` })
      .from(materials)
      .where(sql`${materials.quantity} <= ${materials.minStockLevel}`);
    
    const categoriesResult = await db.select({ category: materials.category })
      .from(materials)
      .groupBy(materials.category);
    
    return {
      totalItems: totalItems.count,
      lowStock: lowStockCount.count,
      categories: categoriesResult.length,
    };
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.id));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values({
        ...insertProduct,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return product;
  }

  // Product SKU methods
  async getProductSkus(): Promise<ProductSku[]> {
    return await db.select().from(productSkus).orderBy(desc(productSkus.id));
  }

  async getProductSkusByProduct(productId: number): Promise<ProductSku[]> {
    return await db.select().from(productSkus).where(eq(productSkus.productId, productId));
  }

  async createProductSku(insertProductSku: InsertProductSku): Promise<ProductSku> {
    const [productSku] = await db
      .insert(productSkus)
      .values({
        ...insertProductSku,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return productSku;
  }

  // Material consumption methods
  async getMaterialConsumption(): Promise<MaterialConsumption[]> {
    return await db.select().from(materialConsumption).orderBy(desc(materialConsumption.id));
  }

  async consumeMaterial(insertConsumption: InsertMaterialConsumption): Promise<MaterialConsumption> {
    // Start a transaction to update material quantity and insert consumption record
    return await db.transaction(async (tx) => {
      // Insert consumption record
      const [consumption] = await tx
        .insert(materialConsumption)
        .values({
          ...insertConsumption,
          consumedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Update material quantity
      const totalUsed = insertConsumption.quantityUsed * (insertConsumption.quantityProduced || 1);
      await tx
        .update(materials)
        .set({
          quantity: sql`GREATEST(0, ${materials.quantity} - ${totalUsed})`,
          updatedAt: new Date(),
        })
        .where(eq(materials.id, insertConsumption.materialId));

      return consumption;
    });
  }

  async getMaterialRemainingQuantity(materialId: number): Promise<number> {
    const [material] = await db.select({ quantity: materials.quantity })
      .from(materials)
      .where(eq(materials.id, materialId));
    return material?.quantity || 0;
  }

  async getConsumptionByMaterial(materialId: number): Promise<MaterialConsumption[]> {
    return await db.select().from(materialConsumption)
      .where(eq(materialConsumption.materialId, materialId))
      .orderBy(desc(materialConsumption.consumedAt));
  }

  // Activity log methods
  async getActivityLogs(): Promise<ActivityLog[]> {
    return await db.select().from(activityLogs)
      .orderBy(desc(activityLogs.timestamp))
      .limit(500);
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [newLog] = await db.insert(activityLogs)
      .values(log)
      .returning();
    return newLog;
  }



  // Material SKU methods
  async getMaterialSkus(materialId: number): Promise<MaterialSku[]> {
    return await db.select().from(materialSkus)
      .where(eq(materialSkus.materialId, materialId))
      .orderBy(desc(materialSkus.createdAt));
  }

  async getMaterialSku(id: number): Promise<MaterialSku | undefined> {
    const [sku] = await db.select().from(materialSkus).where(eq(materialSkus.id, id));
    return sku || undefined;
  }

  async createMaterialSku(insertMaterialSku: InsertMaterialSku): Promise<MaterialSku> {
    const [sku] = await db
      .insert(materialSkus)
      .values({
        ...insertMaterialSku,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return sku;
  }

  async updateMaterialSku(id: number, updates: UpdateMaterialSku): Promise<MaterialSku | undefined> {
    const [sku] = await db
      .update(materialSkus)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(materialSkus.id, id))
      .returning();
    return sku || undefined;
  }

  async deleteMaterialSku(id: number): Promise<boolean> {
    const result = await db.delete(materialSkus).where(eq(materialSkus.id, id));
    return result.rowCount !== undefined && result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
