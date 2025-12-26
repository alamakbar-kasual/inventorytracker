import { db } from './db';
import { materials, materialSkus, products, productSkus, materialConsumption } from '@shared/schema';

const pantsNames = [
  "Classic Chino Pants", "Slim Fit Jeans", "Cargo Pants", "Dress Pants", "Jogger Pants",
  "Straight Leg Jeans", "Wide Leg Trousers", "Pleated Pants", "Cropped Pants", "Palazzo Pants",
  "High Waist Jeans", "Relaxed Fit Chinos", "Skinny Jeans", "Bootcut Pants", "Paper Bag Pants",
  "Tapered Leg Pants", "Boyfriend Jeans", "Mom Jeans", "Culottes", "Linen Pants",
  "Cotton Casual Pants", "Wool Blend Trousers", "Stretch Denim Jeans", "Corduroy Pants", "Velvet Trousers",
  "Tech Fabric Pants", "Printed Cotton Pants", "Solid Color Pants", "Striped Pants", "Checked Trousers",
  "Summer Linen Pants", "Winter Wool Pants", "Everyday Casual Pants", "Business Casual Pants", "Formal Suit Pants",
  "Athletic Track Pants", "Outdoor Adventure Pants", "Workwear Pants", "Utility Pants", "Fashion Denim"
];

const shirtNames = [
  "Classic Oxford Shirt", "Casual Button-Up", "Polo Shirt", "Linen Summer Shirt", "Flannel Shirt",
  "Dress Shirt", "Denim Shirt", "Hawaiian Print Shirt", "Henley Shirt", "Oversized Shirt"
];

const fabricMaterials = [
  { name: "Denim Fabric Blue", category: "Fabrics", quantity: 500, unit: "yards", minStockLevel: 100, supplierName: "Textile Corp Indonesia" },
  { name: "Cotton Twill Khaki", category: "Fabrics", quantity: 350, unit: "yards", minStockLevel: 80, supplierName: "Prima Textile" },
  { name: "Linen Blend Natural", category: "Fabrics", quantity: 200, unit: "yards", minStockLevel: 50, supplierName: "Natural Fabrics ID" },
  { name: "Wool Suiting Gray", category: "Fabrics", quantity: 150, unit: "yards", minStockLevel: 40, supplierName: "Premium Wool Co" },
  { name: "Stretch Denim Black", category: "Fabrics", quantity: 400, unit: "yards", minStockLevel: 90, supplierName: "Textile Corp Indonesia" },
  { name: "Cotton Poplin White", category: "Fabrics", quantity: 600, unit: "yards", minStockLevel: 120, supplierName: "Prima Textile" },
  { name: "Flannel Cotton Plaid", category: "Fabrics", quantity: 180, unit: "yards", minStockLevel: 45, supplierName: "Comfort Fabrics" },
  { name: "Oxford Cotton Blue", category: "Fabrics", quantity: 280, unit: "yards", minStockLevel: 60, supplierName: "Premium Cotton ID" },
  { name: "Corduroy Brown", category: "Fabrics", quantity: 120, unit: "yards", minStockLevel: 30, supplierName: "Texture Textiles" },
  { name: "Velvet Dark Green", category: "Fabrics", quantity: 80, unit: "yards", minStockLevel: 20, supplierName: "Luxury Fabrics" },
];

const notionMaterials = [
  { name: "Metal Zipper 7 inch", category: "Zippers", quantity: 2000, unit: "pieces", minStockLevel: 500, supplierName: "YKK Indonesia" },
  { name: "Plastic Zipper 6 inch", category: "Zippers", quantity: 1500, unit: "pieces", minStockLevel: 400, supplierName: "YKK Indonesia" },
  { name: "Invisible Zipper 8 inch", category: "Zippers", quantity: 800, unit: "pieces", minStockLevel: 200, supplierName: "Zipper World" },
  { name: "Polyester Thread Black", category: "Threads", quantity: 100, unit: "spools", minStockLevel: 25, supplierName: "Gutermann ID" },
  { name: "Polyester Thread White", category: "Threads", quantity: 120, unit: "spools", minStockLevel: 30, supplierName: "Gutermann ID" },
  { name: "Polyester Thread Navy", category: "Threads", quantity: 80, unit: "spools", minStockLevel: 20, supplierName: "Gutermann ID" },
  { name: "Cotton Thread Beige", category: "Threads", quantity: 60, unit: "spools", minStockLevel: 15, supplierName: "Coats Indonesia" },
  { name: "Metal Button Silver 15mm", category: "Buttons", quantity: 3000, unit: "pieces", minStockLevel: 800, supplierName: "Button Factory ID" },
  { name: "Plastic Button Brown 12mm", category: "Buttons", quantity: 2500, unit: "pieces", minStockLevel: 600, supplierName: "Button Factory ID" },
  { name: "Pearl Button White 10mm", category: "Buttons", quantity: 1000, unit: "pieces", minStockLevel: 250, supplierName: "Premium Buttons" },
  { name: "Waistband Elastic 1.5 inch", category: "Elastic", quantity: 500, unit: "yards", minStockLevel: 100, supplierName: "Elastic Solutions" },
  { name: "Belt Loop Tape", category: "Trims", quantity: 400, unit: "yards", minStockLevel: 100, supplierName: "Trim Masters" },
  { name: "Pocket Lining Fabric", category: "Lining", quantity: 300, unit: "yards", minStockLevel: 75, supplierName: "Lining Experts" },
  { name: "Fusible Interfacing Medium", category: "Interfacing", quantity: 200, unit: "yards", minStockLevel: 50, supplierName: "Interfacing Pro" },
  { name: "Rivets Copper 8mm", category: "Hardware", quantity: 5000, unit: "pieces", minStockLevel: 1000, supplierName: "Hardware Supply ID" },
];

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

async function seedProducts() {
  console.log("Starting product seed...");
  
  try {
    const allMaterialsData = [...fabricMaterials, ...notionMaterials];
    const insertedMaterials: { id: number; name: string; category: string }[] = [];
    
    for (const mat of allMaterialsData) {
      const [inserted] = await db.insert(materials).values({
        name: mat.name,
        description: `High quality ${mat.name.toLowerCase()} for garment production`,
        category: mat.category,
        quantity: mat.quantity,
        unit: mat.unit,
        minStockLevel: mat.minStockLevel,
        supplierName: mat.supplierName,
        dateOfPurchase: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        unitPrice: Math.floor(Math.random() * 50000) + 10000,
        currency: "IDR",
      }).returning({ id: materials.id, name: materials.name, category: materials.category });
      
      insertedMaterials.push(inserted);
      
      const skuCode = mat.name.toUpperCase().replace(/\s+/g, '-').substring(0, 15) + `-${inserted.id}`;
      await db.insert(materialSkus).values({
        materialId: inserted.id,
        sku: skuCode,
        description: `SKU for ${mat.name}`,
        isActive: true,
      });
    }
    
    console.log(`Inserted ${insertedMaterials.length} materials`);
    
    const insertedProducts: { id: number; name: string; type: 'pants' | 'shirt' }[] = [];
    
    for (let i = 0; i < 40; i++) {
      const [product] = await db.insert(products).values({
        name: pantsNames[i],
        description: `Premium quality ${pantsNames[i].toLowerCase()} for everyday wear`,
      }).returning({ id: products.id, name: products.name });
      
      insertedProducts.push({ ...product, type: 'pants' });
    }
    
    for (let i = 0; i < 10; i++) {
      const [product] = await db.insert(products).values({
        name: shirtNames[i],
        description: `Comfortable ${shirtNames[i].toLowerCase()} for any occasion`,
      }).returning({ id: products.id, name: products.name });
      
      insertedProducts.push({ ...product, type: 'shirt' });
    }
    
    console.log(`Inserted ${insertedProducts.length} products`);
    
    const insertedProductSkus: { id: number; productId: number; type: 'pants' | 'shirt' }[] = [];
    
    for (const product of insertedProducts) {
      const productSizes = product.type === 'pants' ? sizes : sizes.slice(0, 5);
      
      for (const size of productSizes) {
        const skuCode = `${product.name.toUpperCase().replace(/\s+/g, '-').substring(0, 10)}-${size}-${product.id}`;
        const [sku] = await db.insert(productSkus).values({
          productId: product.id,
          sku: skuCode,
          size: size,
        }).returning({ id: productSkus.id, productId: productSkus.productId });
        
        insertedProductSkus.push({ ...sku, type: product.type });
      }
    }
    
    console.log(`Inserted ${insertedProductSkus.length} product SKUs`);
    
    const fabricMats = insertedMaterials.filter(m => m.category === 'Fabrics');
    const threadMats = insertedMaterials.filter(m => m.category === 'Threads');
    const zipperMats = insertedMaterials.filter(m => m.category === 'Zippers');
    const buttonMats = insertedMaterials.filter(m => m.category === 'Buttons');
    const elasticMats = insertedMaterials.filter(m => m.category === 'Elastic');
    
    let consumptionCount = 0;
    
    for (const productSku of insertedProductSkus) {
      const numConsumptionRecords = Math.floor(Math.random() * 15) + 5;
      
      for (let i = 0; i < numConsumptionRecords; i++) {
        const daysAgo = Math.floor(Math.random() * 60);
        const dateUsed = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        const quantityProduced = Math.floor(Math.random() * 10) + 1;
        
        const fabric = fabricMats[Math.floor(Math.random() * fabricMats.length)];
        await db.insert(materialConsumption).values({
          materialId: fabric.id,
          productSkuId: productSku.id,
          quantityUsed: productSku.type === 'pants' ? Math.floor(Math.random() * 3) + 2 : Math.floor(Math.random() * 2) + 1,
          quantityProduced,
          dateUsed,
        });
        consumptionCount++;
        
        if (threadMats.length > 0) {
          const thread = threadMats[Math.floor(Math.random() * threadMats.length)];
          await db.insert(materialConsumption).values({
            materialId: thread.id,
            productSkuId: productSku.id,
            quantityUsed: 1,
            quantityProduced,
            dateUsed,
          });
          consumptionCount++;
        }
        
        if (productSku.type === 'pants' && zipperMats.length > 0) {
          const zipper = zipperMats[Math.floor(Math.random() * zipperMats.length)];
          await db.insert(materialConsumption).values({
            materialId: zipper.id,
            productSkuId: productSku.id,
            quantityUsed: quantityProduced,
            quantityProduced,
            dateUsed,
          });
          consumptionCount++;
        }
        
        if (buttonMats.length > 0) {
          const button = buttonMats[Math.floor(Math.random() * buttonMats.length)];
          const buttonQty = productSku.type === 'shirt' ? quantityProduced * 7 : quantityProduced * 1;
          await db.insert(materialConsumption).values({
            materialId: button.id,
            productSkuId: productSku.id,
            quantityUsed: buttonQty,
            quantityProduced,
            dateUsed,
          });
          consumptionCount++;
        }
        
        if (productSku.type === 'pants' && elasticMats.length > 0 && Math.random() > 0.5) {
          const elastic = elasticMats[0];
          await db.insert(materialConsumption).values({
            materialId: elastic.id,
            productSkuId: productSku.id,
            quantityUsed: quantityProduced,
            quantityProduced,
            dateUsed,
          });
          consumptionCount++;
        }
      }
    }
    
    console.log(`Inserted ${consumptionCount} consumption records`);
    console.log("Product seed completed successfully!");
    
  } catch (error) {
    console.error("Error seeding products:", error);
    throw error;
  }
}

seedProducts().then(() => {
  console.log("Done!");
  process.exit(0);
}).catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
