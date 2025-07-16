import { materials, type Material, type InsertMaterial, type UpdateMaterial } from "@shared/schema";

export interface IStorage {
  getMaterials(): Promise<Material[]>;
  getMaterial(id: number): Promise<Material | undefined>;
  getMaterialBySku(sku: string): Promise<Material | undefined>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  updateMaterial(id: number, updates: UpdateMaterial): Promise<Material | undefined>;
  deleteMaterial(id: number): Promise<boolean>;
  searchMaterials(query: string): Promise<Material[]>;
  getMaterialsByCategory(category: string): Promise<Material[]>;
  getLowStockMaterials(): Promise<Material[]>;
  getStockStats(): Promise<{ totalItems: number; lowStock: number; categories: number }>;
}

export class MemStorage implements IStorage {
  private materials: Map<number, Material>;
  private currentId: number;

  constructor() {
    this.materials = new Map();
    this.currentId = 1;
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
      const id = this.currentId++;
      const now = new Date();
      const sampleMaterial = {
        ...material,
        id,
        createdAt: now,
        updatedAt: now,
      };
      this.materials.set(id, sampleMaterial);
    });
  }

  async getMaterials(): Promise<Material[]> {
    return Array.from(this.materials.values()).sort((a, b) => b.id - a.id);
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
    const id = this.currentId++;
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
}

export const storage = new MemStorage();
