import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMaterialSchema, updateMaterialSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all materials
  app.get("/api/materials", async (req, res) => {
    try {
      const materials = await storage.getMaterials();
      res.json(materials);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch materials" });
    }
  });

  // Get material by ID
  app.get("/api/materials/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const material = await storage.getMaterial(id);
      if (!material) {
        return res.status(404).json({ error: "Material not found" });
      }
      res.json(material);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch material" });
    }
  });

  // Create new material
  app.post("/api/materials", async (req, res) => {
    try {
      const validatedData = insertMaterialSchema.parse(req.body);
      
      // Check if SKU already exists
      const existingMaterial = await storage.getMaterialBySku(validatedData.sku);
      if (existingMaterial) {
        return res.status(400).json({ error: "SKU already exists" });
      }

      const material = await storage.createMaterial(validatedData);
      res.status(201).json(material);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create material" });
    }
  });

  // Update material
  app.patch("/api/materials/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateMaterialSchema.parse(req.body);
      
      // Check if SKU already exists for different material
      if (validatedData.sku) {
        const existingMaterial = await storage.getMaterialBySku(validatedData.sku);
        if (existingMaterial && existingMaterial.id !== id) {
          return res.status(400).json({ error: "SKU already exists" });
        }
      }

      const material = await storage.updateMaterial(id, validatedData);
      if (!material) {
        return res.status(404).json({ error: "Material not found" });
      }
      res.json(material);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update material" });
    }
  });

  // Delete material
  app.delete("/api/materials/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMaterial(id);
      if (!success) {
        return res.status(404).json({ error: "Material not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete material" });
    }
  });

  // Search materials
  app.get("/api/materials/search/:query", async (req, res) => {
    try {
      const query = req.params.query;
      const materials = await storage.searchMaterials(query);
      res.json(materials);
    } catch (error) {
      res.status(500).json({ error: "Failed to search materials" });
    }
  });

  // Get materials by category
  app.get("/api/materials/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const materials = await storage.getMaterialsByCategory(category);
      res.json(materials);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch materials by category" });
    }
  });

  // Get low stock materials
  app.get("/api/materials/status/low-stock", async (req, res) => {
    try {
      const materials = await storage.getLowStockMaterials();
      res.json(materials);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch low stock materials" });
    }
  });

  // Get stock statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStockStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
