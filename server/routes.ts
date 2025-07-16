import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertMaterialSchema, 
  updateMaterialSchema,
  insertProductSchema,
  insertProductSkuSchema,
  insertMaterialConsumptionSchema
} from "@shared/schema";
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

  // COGS and Product Management Routes
  
  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Create new product
  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  // Get product SKUs
  app.get("/api/product-skus", async (req, res) => {
    try {
      const productSkus = await storage.getProductSkus();
      res.json(productSkus);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product SKUs" });
    }
  });

  // Get product SKUs by product
  app.get("/api/products/:productId/skus", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const productSkus = await storage.getProductSkusByProduct(productId);
      res.json(productSkus);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product SKUs" });
    }
  });

  // Create new product SKU
  app.post("/api/product-skus", async (req, res) => {
    try {
      const validatedData = insertProductSkuSchema.parse(req.body);
      const productSku = await storage.createProductSku(validatedData);
      res.status(201).json(productSku);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create product SKU" });
    }
  });

  // Material consumption routes
  app.get("/api/material-consumption", async (req, res) => {
    try {
      const consumption = await storage.getMaterialConsumption();
      res.json(consumption);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch material consumption" });
    }
  });

  // Record material consumption
  app.post("/api/material-consumption", async (req, res) => {
    try {
      const validatedData = insertMaterialConsumptionSchema.parse(req.body);
      const consumption = await storage.consumeMaterial(validatedData);
      res.status(201).json(consumption);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to record material consumption" });
    }
  });

  // Get material remaining quantity
  app.get("/api/materials/:id/remaining", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const remaining = await storage.getMaterialRemainingQuantity(id);
      res.json({ remaining });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch remaining quantity" });
    }
  });

  // Get consumption by material
  app.get("/api/materials/:id/consumption", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const consumption = await storage.getConsumptionByMaterial(id);
      res.json(consumption);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch consumption data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
