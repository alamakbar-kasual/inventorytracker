import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, Package, Moon, Sun, User, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/ui/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { MaterialCard } from "@/components/material-card";
import { AddMaterialModal } from "@/components/add-material-modal";
import { MaterialConsumptionModal } from "@/components/material-consumption-modal";
import { SearchFilter } from "@/components/search-filter";
import { StatsCards } from "@/components/stats-cards";
import { BottomNav } from "@/components/bottom-nav";
import { HomeStockChart } from "@/components/home-stock-chart";
import { ViewSelector, type ViewType } from "@/components/view-selector";
import { MaterialTableView } from "@/components/material-table-view";
import { MaterialListView } from "@/components/material-list-view";
import { MaterialCompactView } from "@/components/material-compact-view";
import { apiRequest } from "@/lib/queryClient";
import { Material, InsertMaterial, InsertMaterialConsumption } from "@shared/schema";

export default function Inventory() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConsumptionModalOpen, setIsConsumptionModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | undefined>();
  const [consumingMaterial, setConsumingMaterial] = useState<Material | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("home");
  const [currentView, setCurrentView] = useState<ViewType>("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Handle tab navigation
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "analytics") {
      setLocation("/analytics");
    }
    if (tab === "settings") {
      setLocation("/settings");
    }
  };

  // Fetch materials
  const { data: materials = [], isLoading } = useQuery<Material[]>({
    queryKey: ["/api/materials"],
    refetchOnWindowFocus: false,
  });

  // Fetch stats
  const { data: stats = { totalItems: 0, lowStock: 0, categories: 0 } } = useQuery({
    queryKey: ["/api/stats"],
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
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
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

  // Filter materials based on search and category
  const filteredMaterials = useMemo(() => {
    let filtered = materials;

    if (searchQuery) {
      filtered = filtered.filter(
        (material) =>
          material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          material.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          material.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          material.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((material) => material.category === selectedCategory);
    }

    return filtered;
  }, [materials, searchQuery, selectedCategory]);

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
    if (window.confirm("Are you sure you want to delete this material?")) {
      await deleteMaterialMutation.mutateAsync(id);
    }
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

  const handleUseMaterial = (material: Material) => {
    setConsumingMaterial(material);
    setIsConsumptionModalOpen(true);
  };

  const handleConsumeMaterial = async (data: InsertMaterialConsumption) => {
    await consumeMaterialMutation.mutateAsync(data);
    setIsConsumptionModalOpen(false);
    setConsumingMaterial(undefined);
  };

  const handleCloseConsumptionModal = () => {
    setIsConsumptionModalOpen(false);
    setConsumingMaterial(undefined);
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

  const handleConsume = (material: Material) => {
    setConsumingMaterial(material);
    setIsConsumptionModalOpen(true);
  };

  const renderMaterialView = () => {
    switch (currentView) {
      case "table":
        return (
          <MaterialTableView
            materials={filteredMaterials}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onConsume={handleConsume}
          />
        );
      case "list":
        return (
          <MaterialListView
            materials={filteredMaterials}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onConsume={handleConsume}
          />
        );
      case "compact":
        return (
          <MaterialCompactView
            materials={filteredMaterials}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onConsume={handleConsume}
          />
        );
      default: // grid view (original card view)
        return (
          <div className="space-y-4">
            {filteredMaterials.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery || selectedCategory !== "all" ? "No materials found" : "No materials yet"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  {searchQuery || selectedCategory !== "all"
                    ? "Try adjusting your search or filter"
                    : "Add your first material to get started"}
                </p>
              </div>
            ) : (
              filteredMaterials.map((material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  onEdit={handleEditMaterial}
                  onDelete={handleDeleteMaterial}
                  onDuplicate={handleDuplicateMaterial}
                  onUseMaterial={handleUseMaterial}
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
      <header className="glassmorphism dark:glassmorphism-dark sticky top-0 z-50 px-4 py-3 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Package className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Raw Materials</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Inventory Management</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
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
      </header>

      {/* Search and Filter */}
      <div className="px-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full sm:w-auto">
            <SearchFilter
              onSearch={setSearchQuery}
              onFilterCategory={setSelectedCategory}
              selectedCategory={selectedCategory}
            />
          </div>
          
          {/* View Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">View:</span>
            <ViewSelector 
              currentView={currentView} 
              onViewChange={setCurrentView}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 mb-6">
        <StatsCards stats={stats} />
      </div>

      {/* Stock Overview Chart */}
      {materials.length > 0 && (
        <div className="px-4 mb-6">
          <HomeStockChart 
            materials={materials} 
            onAddMaterial={() => setIsAddModalOpen(true)}
            onViewAnalytics={() => setLocation("/analytics")}
          />
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

      {/* Material Consumption Modal */}
      {consumingMaterial && (
        <MaterialConsumptionModal
          isOpen={isConsumptionModalOpen}
          onClose={handleCloseConsumptionModal}
          onSubmit={handleConsumeMaterial}
          material={consumingMaterial}
        />
      )}
    </div>
  );
}
