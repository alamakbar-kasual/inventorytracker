import { useMemo } from "react";
import { MaterialWithSkus } from "@shared/schema";
import { FilterOptions, SortOptions } from "@/components/advanced-filters";

export function useInventoryFilters(materials: MaterialWithSkus[], filters: FilterOptions, sortBy: SortOptions) {
  const filteredAndSortedMaterials = useMemo(() => {
    let filtered = [...materials];

    // Apply filters
    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter(material => material.category === filters.category);
    }

    if (filters.stockLevel && filters.stockLevel !== "all") {
      filtered = filtered.filter(material => {
        const stockRatio = material.quantity / (material.minStockLevel || 1);
        switch (filters.stockLevel) {
          case "critical":
            return stockRatio < 0.5;
          case "low":
            return stockRatio < 1;
          case "adequate":
            return stockRatio >= 1 && stockRatio < 2;
          case "high":
            return stockRatio >= 2;
          default:
            return true;
        }
      });
    }

    if (filters.supplier && filters.supplier !== "all") {
      filtered = filtered.filter(material => 
        material.supplierName && material.supplierName === filters.supplier
      );
    }

    if (filters.dateRange && filters.dateRange !== "all") {
      if (filters.dateRange === "custom") {
        // Handle custom date range
        if (filters.customDateFrom || filters.customDateTo) {
          filtered = filtered.filter(material => {
            if (!material.dateOfPurchase) return false;
            
            const materialDate = new Date(material.dateOfPurchase);
            const fromDate = filters.customDateFrom ? new Date(filters.customDateFrom) : null;
            const toDate = filters.customDateTo ? new Date(filters.customDateTo) : null;
            
            if (fromDate && materialDate < fromDate) return false;
            if (toDate && materialDate > toDate) return false;
            
            return true;
          });
        }
      } else {
        // Handle preset date ranges
        const now = new Date();
        const cutoffDays = {
          "7days": 7,
          "30days": 30,
          "90days": 90,
          "6months": 180,
          "1year": 365
        }[filters.dateRange] || 0;

        if (cutoffDays > 0) {
          const cutoffDate = new Date(now.getTime() - cutoffDays * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(material => 
            material.dateOfPurchase && new Date(material.dateOfPurchase) >= cutoffDate
          );
        }
      }
    }

    if (filters.minQuantity) {
      const minQty = parseFloat(filters.minQuantity);
      if (!isNaN(minQty)) {
        filtered = filtered.filter(material => material.quantity >= minQty);
      }
    }

    if (filters.maxQuantity) {
      const maxQty = parseFloat(filters.maxQuantity);
      if (!isNaN(maxQty)) {
        filtered = filtered.filter(material => material.quantity <= maxQty);
      }
    }

    // Apply sorting
    if (sortBy.field) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortBy.field) {
          case "name":
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case "quantity":
            aValue = a.quantity;
            bValue = b.quantity;
            break;
          case "category":
            aValue = a.category.toLowerCase();
            bValue = b.category.toLowerCase();
            break;
          case "supplier":
            aValue = (a.supplierName || "").toLowerCase();
            bValue = (b.supplierName || "").toLowerCase();
            break;
          case "purchaseDate":
            aValue = a.dateOfPurchase ? new Date(a.dateOfPurchase) : new Date(0);
            bValue = b.dateOfPurchase ? new Date(b.dateOfPurchase) : new Date(0);
            break;
          case "stockLevel":
            aValue = a.quantity / (a.minStockLevel || 1);
            bValue = b.quantity / (b.minStockLevel || 1);
            break;
          case "sku":
            // Use first SKU for sorting
            aValue = (a.skus?.[0]?.sku || "").toLowerCase();
            bValue = (b.skus?.[0]?.sku || "").toLowerCase();
            break;
          default:
            return 0;
        }

        if (aValue < bValue) {
          return sortBy.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortBy.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [materials, filters, sortBy]);

  // Extract available filter options
  const availableCategories = useMemo(() => {
    const categories = new Set(materials.map(m => m.category));
    return Array.from(categories).sort();
  }, [materials]);

  const availableSuppliers = useMemo(() => {
    const suppliers = new Set(
      materials
        .map(m => m.supplierName)
        .filter((supplier): supplier is string => Boolean(supplier))
    );
    return Array.from(suppliers).sort();
  }, [materials]);

  return {
    filteredMaterials: filteredAndSortedMaterials,
    availableCategories,
    availableSuppliers,
  };
}