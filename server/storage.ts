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
