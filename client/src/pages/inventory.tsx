import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchShortcuts } from "@/hooks/use-search-shortcuts";
import { useLocation } from "wouter";
import { Plus, Package, Moon, Sun, User, Filter, Search, HelpCircle, FileText, Undo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/ui/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { MaterialCard } from "@/components/material-card";
import { AddMaterialModal } from "@/components/add-material-modal";

import { EnhancedSearch } from "@/components/enhanced-search";
import { SearchResultsSummary } from "@/components/search-results-summary";
import { PredictionsSummaryWidget } from "@/components/predictions-summary-widget";
import { QuickHelpCard } from "@/components/quick-help-card";
import { AdvancedFilters, type FilterOptions, type SortOptions } from "@/components/advanced-filters";
import { FilterSummaryWidget } from "@/components/filter-summary-widget";
import { ActivityLogModal } from "@/components/activity-log-modal";
import { useInventoryFilters } from "@/hooks/use-inventory-filters";
import { useLanguage } from "@/contexts/language-context";

import { BottomNav } from "@/components/bottom-nav";

import { ViewSelector, type ViewType } from "@/components/view-selector";
import { MaterialTableView } from "@/components/material-table-view";
import { MaterialListView } from "@/components/material-list-view";
import { MaterialCompactView } from "@/components/material-compact-view";
import { apiRequest } from "@/lib/queryClient";
import { MaterialWithSkus, Material, InsertMaterial, InsertMaterialConsumption } from "@shared/schema";

export default function Inventory() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  const { t } = useLanguage();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialWithSkus | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("home");
  const [currentView, setCurrentView] = useState<ViewType>("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchInputRef, setSearchInputRef] = useState<HTMLInputElement | null>(null);
  
  // Advanced filtering and sorting state
  const [advancedFilters, setAdvancedFilters] = useState<FilterOptions>({
    category: "all",
    stockLevel: "all",
    supplier: "all",
    dateRange: "all",
    customDateFrom: "",
    customDateTo: "",
    minQuantity: "",
    maxQuantity: "",
  });
  
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: "name",
    direction: "asc",
  });

  // Search shortcuts
  useSearchShortcuts({
    onToggleSearch: () => {
      searchInputRef?.focus();
    },
    onClearSearch: () => {
      setSearchQuery('');
      setSelectedCategory('all');
    },
    onFocusSearch: () => {
      searchInputRef?.focus();
    }
  });

  // Handle tab navigation
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "analytics") {
      setLocation("/analytics");
    }
    if (tab === "finance") {
      setLocation("/finance");
    }
    if (tab === "settings") {
      setLocation("/settings");
    }
  };

  // Fetch materials
  const { data: materials = [], isLoading } = useQuery<MaterialWithSkus[]>({
    queryKey: ["/api/materials"],
    refetchOnWindowFocus: false,
  });



  // Create material mutation
  const createMaterialMutation = useMutation({
    mutationFn: async (data: InsertMaterial) => {
      const response = await apiRequest("POST", "/api/materials", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
      toast({
        title: "Success",
        description: "Material created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create material",
        variant: "destructive",
      });
    },
  });

  // Update material mutation
  const updateMaterialMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertMaterial }) => {
      const response = await apiRequest("PATCH", `/api/materials/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
      toast({
        title: "Success",
        description: "Material updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update material",
        variant: "destructive",
      });
    },
  });

  // Delete material mutation
  const deleteMaterialMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/materials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
      toast({
        title: "Success",
        description: "Material deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete material",
        variant: "destructive",
      });
    },
  });

  // Material consumption mutation
  const consumeMaterialMutation = useMutation({
    mutationFn: async (data: InsertMaterialConsumption) => {
      const response = await apiRequest("POST", "/api/material-consumption", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
      toast({
        title: "Success",
        description: "Material usage recorded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record material usage",
        variant: "destructive",
      });
    },
  });

  // Use the advanced filtering hook
  const { filteredMaterials, availableCategories, availableSuppliers } = useInventoryFilters(
    materials, 
    advancedFilters, 
    sortOptions
  );

  // Apply basic search on top of advanced filters
  const searchFilteredMaterials = useMemo(() => {
    if (!searchQuery) return filteredMaterials;
    
    return filteredMaterials.filter(
      (material) =>
        material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (material.skus?.some(sku => sku.sku.toLowerCase().includes(searchQuery.toLowerCase())) ?? false) ||
        material.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [filteredMaterials, searchQuery]);

  // Keep the old logic for basic category filter compatibility
  const finalFilteredMaterials = useMemo(() => {
    let filtered = searchFilteredMaterials;

    if (selectedCategory !== "all" && advancedFilters.category === "all") {
      filtered = filtered.filter((material) => material.category === selectedCategory);
    }

    return filtered;
  }, [searchFilteredMaterials, selectedCategory, advancedFilters.category]);

  const handleAddMaterial = async (data: InsertMaterial) => {
    if (editingMaterial) {
      await updateMaterialMutation.mutateAsync({ id: editingMaterial.id, data });
      setEditingMaterial(undefined);
    } else {
      await createMaterialMutation.mutateAsync(data);
    }
    setIsAddModalOpen(false);
  };

  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material);
    setIsAddModalOpen(true);
  };

  const handleDeleteMaterial = async (id: number) => {
    // Find the material to be deleted for undo functionality
    const materialToDelete = materials.find(m => m.id === id);
    if (!materialToDelete) return;

    // Delete the material immediately
    await deleteMaterialMutation.mutateAsync(id);

    // Show toast with undo option
    const { dismiss } = toast({
      title: "Material deleted",
      description: `"${materialToDelete.name}" has been deleted`,
      duration: 6000, // 6 seconds to undo
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            dismiss();
            // Restore the material
            try {
              const restoredData: InsertMaterial = {
                name: materialToDelete.name,
                description: materialToDelete.description,
                category: materialToDelete.category,
                quantity: materialToDelete.quantity,
                unit: materialToDelete.unit,
                sku: materialToDelete.sku,
                minStockLevel: materialToDelete.minStockLevel,
                dateOfPurchase: materialToDelete.dateOfPurchase,
                supplierName: materialToDelete.supplierName,
                totalYards: materialToDelete.totalYards,
                usageForProduct: materialToDelete.usageForProduct,
                unitPrice: materialToDelete.unitPrice,
                totalValue: materialToDelete.totalValue,
              };
              await createMaterialMutation.mutateAsync(restoredData);
              toast({
                title: "Material restored",
                description: `"${materialToDelete.name}" has been restored`,
              });
            } catch (error) {
              toast({
                title: "Failed to restore",
                description: "Could not restore the material",
                variant: "destructive",
              });
            }
          }}
        >
          <Undo className="w-4 h-4 mr-1" />
          Undo
        </Button>
      ),
    });
  };

  const handleDuplicateMaterial = (material: Material) => {
    const duplicateData: InsertMaterial = {
      name: `${material.name} (Copy)`,
      description: material.description,
      category: material.category,
      quantity: material.quantity,
      unit: material.unit,
      sku: `${material.sku}-COPY`,
      minStockLevel: material.minStockLevel,
      dateOfPurchase: material.dateOfPurchase,
      supplierName: material.supplierName,
      totalYards: material.totalYards,
      usageForProduct: material.usageForProduct,
    };
    createMaterialMutation.mutateAsync(duplicateData);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingMaterial(undefined);
  };



  // Advanced filter handlers
  const handleFiltersChange = (newFilters: FilterOptions) => {
    setAdvancedFilters(newFilters);
    // Sync basic category filter
    if (newFilters.category !== "all") {
      setSelectedCategory("all"); // Clear basic filter when advanced filter is used
    }
  };

  const handleSortChange = (newSort: SortOptions) => {
    setSortOptions(newSort);
  };

  const handleClearAllFilters = () => {
    setAdvancedFilters({
      category: "all",
      stockLevel: "all", 
      supplier: "all",
      dateRange: "all",
      customDateFrom: "",
      customDateTo: "",
      minQuantity: "",
      maxQuantity: "",
    });
    setSortOptions({
      field: "name",
      direction: "asc",
    });
    setSelectedCategory("all");
    setSearchQuery("");
  };

  const handleClearSingleFilter = (key: keyof FilterOptions) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [key]: key === "minQuantity" || key === "maxQuantity" ? "" : "all"
    }));
  };

  // Handler functions for new view components
  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      await deleteMaterialMutation.mutateAsync(id);
    }
  };



  const renderMaterialView = () => {
    switch (currentView) {
      case "table":
        return (
          <MaterialTableView
            materials={finalFilteredMaterials}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        );
      case "list":
        return (
          <MaterialListView
            materials={finalFilteredMaterials}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        );
      case "compact":
        return (
          <MaterialCompactView
            materials={finalFilteredMaterials}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        );
      default: // grid view (original card view)
        return (
          <div className="space-y-4">
            {finalFilteredMaterials.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery || selectedCategory !== "all" || Object.values(advancedFilters).some(f => f && f !== "all") ? "No materials found" : "No materials yet"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  {searchQuery || selectedCategory !== "all" || Object.values(advancedFilters).some(f => f && f !== "all")
                    ? "Try adjusting your search or filters"
                    : "Add your first material to get started"}
                </p>
              </div>
            ) : (
              finalFilteredMaterials.map((material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  onEdit={handleEditMaterial}
                  onDelete={handleDeleteMaterial}
                  onDuplicate={handleDuplicateMaterial}
                />
              ))
            )}
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Header */}
      <header className="glassmorphism dark:glassmorphism-dark sticky top-0 z-50 px-4 py-3 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Package className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t('inventory.title')}</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">{t('inventory.subtitle')}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setLocation("/help")}
              className="p-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-blue-600 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors border-none"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>

            <ActivityLogModal>
              <Button
                variant="outline"
                size="icon"
                className="p-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-green-600 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors border-none"
              >
                <FileText className="w-4 h-4" />
              </Button>
            </ActivityLogModal>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors border-none"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>

            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* View Selector - Top Position */}
        <div className="flex items-center justify-center sm:justify-end">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Display Mode:</span>
            <ViewSelector 
              currentView={currentView} 
              onViewChange={setCurrentView}
            />
          </div>
        </div>
      </header>

      {/* Enhanced Search */}
      <div className="px-4 mb-6">
        <EnhancedSearch
          materials={materials}
          onSearch={setSearchQuery}
          onFilterCategory={setSelectedCategory}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
        />
      </div>

      {/* Filter Summary Widget */}
      <div className="px-4 mb-4">
        <FilterSummaryWidget
          filters={advancedFilters}
          sortBy={sortOptions}
          totalMaterials={materials.length}
          filteredCount={finalFilteredMaterials.length}
          onClearFilter={handleClearSingleFilter}
          onClearAll={handleClearAllFilters}
        />
      </div>

      {/* Advanced Filters */}
      <div className="px-4 mb-4">
        <AdvancedFilters
          filters={advancedFilters}
          sortBy={sortOptions}
          onFiltersChange={handleFiltersChange}
          onSortChange={handleSortChange}
          onClearAll={handleClearAllFilters}
          availableCategories={availableCategories}
          availableSuppliers={availableSuppliers}
        />
      </div>

      {/* Search Results Summary */}
      <div className="px-4">
        <SearchResultsSummary
          materials={materials}
          filteredMaterials={finalFilteredMaterials}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onClearSearch={() => setSearchQuery('')}
          onClearCategory={() => setSelectedCategory('all')}
        />
      </div>

      {/* AI Predictions Widget - Only show when no filters are active */}
      {!searchQuery && selectedCategory === 'all' && !Object.values(advancedFilters).some(f => f && f !== "all") && (
        <div className="px-4 mb-4 space-y-4">
          <PredictionsSummaryWidget />
          
          {/* Quick Help for first-time users */}
          {materials.length === 0 && (
            <QuickHelpCard
              title="Getting Started"
              description="Add your first material to start tracking inventory"
              tips={[
                "Click the '+' button to add materials",
                "Set minimum stock levels for alerts"
              ]}
              helpPath="/help"
            />
          )}
        </div>
      )}



      {/* Material List with Multiple Views */}
      <div className="px-4 mb-20">
        {renderMaterialView()}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-6 z-50">
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full shadow-lg text-white transition-all duration-300 hover:scale-105"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Add/Edit Material Modal */}
      <AddMaterialModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddMaterial}
        editingMaterial={editingMaterial}
      />


    </div>
  );
}
