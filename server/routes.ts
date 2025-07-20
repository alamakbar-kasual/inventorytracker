import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { predictionService } from "./prediction-service";
import { userStorage } from "./userStorage";
import { 
  insertMaterialSchema, 
  updateMaterialSchema,
  insertMaterialSkuSchema,
  updateMaterialSkuSchema,
  insertProductSchema,
  insertProductSkuSchema,
  insertMaterialConsumptionSchema,
  insertUserSchema,
  updateUserSchema,
  User,
  InsertUser,
  UpdateUser,
  roles
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
      // Convert dateOfPurchase to Date object if it's a string
      const dataToValidate = {
        ...req.body,
        dateOfPurchase: req.body.dateOfPurchase ? new Date(req.body.dateOfPurchase) : undefined
      };
      const validatedData = insertMaterialSchema.parse(dataToValidate);
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
      // Convert dateOfPurchase to Date object if it's a string
      const dataToValidate = {
        ...req.body,
        dateOfPurchase: req.body.dateOfPurchase ? new Date(req.body.dateOfPurchase) : undefined
      };
      const validatedData = updateMaterialSchema.parse(dataToValidate);

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

  // Bulk update materials (must be defined before :id routes)
  app.patch("/api/materials/bulk", async (req, res) => {
    try {
      const { ids, updates } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "No material IDs provided" });
      }
      
      // Parse IDs to integers
      const numericIds = ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      if (numericIds.length === 0) {
        return res.status(400).json({ error: "Invalid material IDs provided" });
      }
      
      const validatedUpdates = updateMaterialSchema.parse(updates);
      const results = await Promise.all(
        numericIds.map(id => storage.updateMaterial(id, validatedUpdates))
      );
      
      res.json({ success: true, updated: results.filter(Boolean).length });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update materials" });
    }
  });

  // Bulk delete materials (must be defined before :id routes)
  app.delete("/api/materials/bulk", async (req, res) => {
    try {
      const { ids } = req.body;
      console.log("Bulk delete request received with body:", req.body);
      console.log("IDs array:", JSON.stringify(ids));
      
      if (!ids) {
        return res.status(400).json({ error: "IDs field is missing from request body" });
      }
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "No material IDs provided or IDs is not an array" });
      }
      
      // Parse IDs to integers and validate
      const numericIds = [];
      const invalidIds = [];
      
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        console.log(`Processing ID at index ${i}: value="${id}", type="${typeof id}"`);
        
        if (id === null || id === undefined || id === '') {
          invalidIds.push({ index: i, value: id, reason: 'empty or null' });
          continue;
        }
        
        const parsed = parseInt(id, 10);
        console.log(`Parsed result: ${parsed}`);
        
        if (!isNaN(parsed) && parsed > 0) {
          numericIds.push(parsed);
        } else {
          invalidIds.push({ index: i, value: id, reason: 'not a valid positive integer' });
        }
      }
      
      console.log("Valid numeric IDs:", numericIds);
      console.log("Invalid IDs:", invalidIds);
      
      if (numericIds.length === 0) {
        return res.status(400).json({ 
          error: "No valid material IDs provided",
          invalidIds: invalidIds
        });
      }
      
      const results = await Promise.all(
        numericIds.map(async (id) => {
          try {
            console.log(`Attempting to delete material with ID: ${id}`);
            const result = await storage.deleteMaterial(id);
            console.log(`Delete result for ID ${id}: ${result}`);
            return { id, success: result };
          } catch (err) {
            console.error(`Failed to delete material ${id}:`, err);
            return { id, success: false, error: err.message };
          }
        })
      );
      
      const successCount = results.filter(r => r.success).length;
      const failedDeletes = results.filter(r => !r.success);
      
      console.log(`Bulk delete completed: ${successCount}/${numericIds.length} successful`);
      
      if (failedDeletes.length > 0) {
        console.log("Failed deletes:", failedDeletes);
      }
      
      res.json({ 
        success: true, 
        deleted: successCount,
        total: numericIds.length,
        failed: failedDeletes.length > 0 ? failedDeletes : undefined
      });
    } catch (error) {
      console.error("Bulk delete error:", error);
      res.status(500).json({ error: "Failed to delete materials" });
    }
  });

  // Delete single material (must be defined after bulk routes)
  app.delete("/api/materials/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid material ID" });
      }
      const success = await storage.deleteMaterial(id);
      if (!success) {
        return res.status(404).json({ error: "Material not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting material:", error);
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

  // Get material consumption data for analytics
  app.get("/api/consumption", async (req, res) => {
    try {
      const consumption = await storage.getMaterialConsumption();
      res.json(consumption);
    } catch (error) {
      console.error("Error fetching consumption data:", error);
      res.status(500).json({ error: "Failed to fetch consumption data" });
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

  // Material SKU management routes
  app.get("/api/materials/:materialId/skus", async (req, res) => {
    try {
      const materialId = parseInt(req.params.materialId);
      const skus = await storage.getMaterialSkus(materialId);
      res.json(skus);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch material SKUs" });
    }
  });

  app.post("/api/materials/:materialId/skus", async (req, res) => {
    try {
      const materialId = parseInt(req.params.materialId);
      const validatedData = insertMaterialSkuSchema.parse({
        ...req.body,
        materialId
      });

      // Check if SKU already exists
      const existingSku = await storage.getMaterialByAnySku(validatedData.sku);
      if (existingSku) {
        return res.status(400).json({ error: "SKU already exists" });
      }

      const sku = await storage.createMaterialSku(validatedData);
      res.status(201).json(sku);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create material SKU" });
    }
  });

  app.patch("/api/material-skus/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateMaterialSkuSchema.parse(req.body);

      // Check if new SKU already exists for different material SKU
      if (validatedData.sku) {
        const existingSku = await storage.getMaterialByAnySku(validatedData.sku);
        if (existingSku && existingSku.sku.id !== id) {
          return res.status(400).json({ error: "SKU already exists" });
        }
      }

      const sku = await storage.updateMaterialSku(id, validatedData);
      if (!sku) {
        return res.status(404).json({ error: "Material SKU not found" });
      }
      res.json(sku);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update material SKU" });
    }
  });

  app.delete("/api/material-skus/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMaterialSku(id);
      if (!success) {
        return res.status(404).json({ error: "Material SKU not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete material SKU" });
    }
  });

  // User management routes
  
  // Get all users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await userStorage.getUsers();
      // Remove passwords from response
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Get user by ID
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await userStorage.getUserById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      // Remove password from response
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Create new user
  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await userStorage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const user = await userStorage.createUser({
        ...validatedData,
        password: req.body.password // Include password for creation
      });
      
      // Remove password from response
      const { password, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Update user
  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateUserSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await userStorage.getUserById(id);
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Check if email is being updated and if it already exists
      if (validatedData.email && validatedData.email !== existingUser.email) {
        const emailExists = await userStorage.getUserByEmail(validatedData.email);
        if (emailExists) {
          return res.status(400).json({ error: "Email already exists" });
        }
      }

      const user = await userStorage.updateUser(id, validatedData);
      // Remove password from response
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Delete user (soft delete)
  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if user exists
      const existingUser = await userStorage.getUserById(id);
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }

      await userStorage.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Get user permissions
  app.get("/api/users/:id/permissions", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const permissions = await userStorage.getUserPermissions(id);
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user permissions" });
    }
  });

  // Add user permission
  app.post("/api/users/:id/permissions", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { permission, resource } = req.body;
      
      if (!permission || !resource) {
        return res.status(400).json({ error: "Permission and resource are required" });
      }

      const userPermission = await userStorage.addUserPermission(id, permission, resource);
      res.status(201).json(userPermission);
    } catch (error) {
      res.status(500).json({ error: "Failed to add user permission" });
    }
  });

  // Remove user permission
  app.delete("/api/users/:id/permissions", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { permission, resource } = req.body;
      
      if (!permission || !resource) {
        return res.status(400).json({ error: "Permission and resource are required" });
      }

      await userStorage.removeUserPermission(id, permission, resource);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove user permission" });
    }
  });

  // Check user permission
  app.get("/api/users/:id/permissions/:resource/:permission", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { resource, permission } = req.params;
      
      const hasPermission = await userStorage.hasPermission(id, permission, resource);
      res.json({ hasPermission });
    } catch (error) {
      res.status(500).json({ error: "Failed to check user permission" });
    }
  });

  // Get available roles
  app.get("/api/roles", (req, res) => {
    res.json(roles);
  });

  // Prediction routes
  app.get("/api/predictions", async (req, res) => {
    try {
      const predictions = await predictionService.calculatePredictions();
      res.json(predictions);
    } catch (error) {
      console.error("Error fetching predictions:", error);
      res.status(500).json({ error: "Failed to fetch predictions" });
    }
  });

  app.get("/api/prediction-insights", async (req, res) => {
    try {
      const insights = await predictionService.generateInsights();
      res.json(insights);
    } catch (error) {
      console.error("Error generating insights:", error);
      res.status(500).json({ error: "Failed to generate insights" });
    }
  });

  app.get("/api/usage-patterns/:materialId", async (req, res) => {
    try {
      const materialId = parseInt(req.params.materialId);
      if (isNaN(materialId)) {
        return res.status(400).json({ error: "Invalid material ID" });
      }
      
      const patterns = await predictionService.getUsagePatterns(materialId);
      res.json(patterns);
    } catch (error) {
      console.error("Error fetching usage patterns:", error);
      res.status(500).json({ error: "Failed to fetch usage patterns" });
    }
  });

  // Activity log routes
  app.get("/api/activity-logs", async (req, res) => {
    try {
      const logs = await storage.getActivityLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  app.post("/api/activity-logs", async (req, res) => {
    try {
      const logData = req.body;
      const newLog = await storage.createActivityLog(logData);
      res.status(201).json(newLog);
    } catch (error) {
      console.error("Error creating activity log:", error);
      res.status(500).json({ message: "Failed to create activity log" });
    }
  });



  const httpServer = createServer(app);
  return httpServer;
}
