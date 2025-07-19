import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, DollarSign, TrendingUp, TrendingDown, RefreshCw, AlertTriangle, Package, Building, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { BottomNav } from "@/components/bottom-nav";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import type { MaterialWithSkus, SupplierRefund, InsertSupplierRefund } from "@shared/schema";

export default function Finance() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("finance");
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialWithSkus | null>(null);

  const { data: materials = [], isLoading: materialsLoading } = useQuery({
    queryKey: ["/api/materials"],
  });

  const { data: refunds = [], isLoading: refundsLoading } = useQuery({
    queryKey: ["/api/supplier-refunds"],
  });

  // Calculate financial metrics
  const financialMetrics = {
    totalValue: materials.reduce((sum: number, material: MaterialWithSkus) => sum + (material.totalValue || 0), 0),
    totalItems: materials.reduce((sum: number, material: MaterialWithSkus) => sum + material.quantity, 0),
    averageValue: materials.length > 0 ? materials.reduce((sum: number, material: MaterialWithSkus) => sum + (material.totalValue || 0), 0) / materials.length : 0,
    lowStockValue: materials.filter((m: MaterialWithSkus) => m.quantity <= (m.minStockLevel || 10)).reduce((sum: number, material: MaterialWithSkus) => sum + (material.totalValue || 0), 0),
    pendingRefunds: refunds.filter((r: SupplierRefund) => r.status === 'pending').reduce((sum: number, refund: SupplierRefund) => sum + refund.refundAmount, 0),
    completedRefunds: refunds.filter((r: SupplierRefund) => r.status === 'completed').reduce((sum: number, refund: SupplierRefund) => sum + refund.refundAmount, 0),
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const createRefundMutation = useMutation({
    mutationFn: async (refundData: InsertSupplierRefund) => {
      return apiRequest("/api/supplier-refunds", {
        method: "POST",
        body: JSON.stringify(refundData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supplier-refunds"] });
      toast({
        title: "Refund Request Created",
        description: "Your refund request has been submitted successfully.",
      });
      setIsRefundModalOpen(false);
      setSelectedMaterial(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create refund request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleRefundSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedMaterial) return;

    const formData = new FormData(e.currentTarget);
    const refundData: InsertSupplierRefund = {
      materialId: selectedMaterial.id,
      supplierName: selectedMaterial.supplierName || "Unknown Supplier",
      refundAmount: Math.round(parseFloat(formData.get("amount") as string) * 100),
      reason: formData.get("reason") as string,
      requestedBy: "Current User", // TODO: Replace with actual user
      defectiveQuantity: parseInt(formData.get("quantity") as string),
      notes: formData.get("notes") as string,
    };

    createRefundMutation.mutate(refundData);
  };

  if (materialsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pb-20">
      {/* Header */}
      <header className="glassmorphism dark:glassmorphism-dark sticky top-0 z-50 px-4 py-3 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
              <DollarSign className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Finance Dashboard</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Inventory valuation and financial tracking</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 space-y-6">
        {/* Financial Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(financialMetrics.totalValue)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Average Value</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(financialMetrics.averageValue)}</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Low Stock Value</p>
                  <p className="text-2xl font-bold text-amber-600">{formatCurrency(financialMetrics.lowStockValue)}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending Refunds</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(financialMetrics.pendingRefunds)}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Material Valuation Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Material Valuation</CardTitle>
            <Dialog open={isRefundModalOpen} onOpenChange={setIsRefundModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Request Refund
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {materials.map((material: MaterialWithSkus) => (
                <div key={material.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-medium">{material.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {material.quantity} {material.unit} • {material.supplierName || "No supplier"}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {material.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(material.totalValue || 0)}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(material.unitPrice || 0)} per {material.unit}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedMaterial(material);
                      setIsRefundModalOpen(true);
                    }}
                    className="ml-4"
                  >
                    Refund
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Refund Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Refund Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {refunds.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No refund requests found</p>
              ) : (
                refunds.map((refund: SupplierRefund) => (
                  <div key={refund.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Building className="w-5 h-5 text-gray-600" />
                        <div>
                          <h3 className="font-medium">{refund.supplierName}</h3>
                          <p className="text-sm text-gray-600">{refund.reason}</p>
                          <p className="text-xs text-gray-500">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {format(new Date(refund.requestDate), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(refund.refundAmount)}</p>
                      <Badge variant={refund.status === 'completed' ? 'default' : refund.status === 'pending' ? 'secondary' : 'destructive'}>
                        {refund.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Refund Modal */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Supplier Refund</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleRefundSubmit} className="space-y-4">
          {selectedMaterial && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-medium">{selectedMaterial.name}</h3>
              <p className="text-sm text-gray-600">Supplier: {selectedMaterial.supplierName || "Unknown"}</p>
              <p className="text-sm text-gray-600">Available: {selectedMaterial.quantity} {selectedMaterial.unit}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Defective Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                required
                min="1"
                max={selectedMaterial?.quantity || 1}
              />
            </div>
            <div>
              <Label htmlFor="amount">Refund Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                required
                min="0"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="reason">Reason for Refund</Label>
            <Select name="reason" required>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="defective">Defective Material</SelectItem>
                <SelectItem value="damaged">Damaged in Transit</SelectItem>
                <SelectItem value="wrong_specification">Wrong Specification</SelectItem>
                <SelectItem value="quality_issues">Quality Issues</SelectItem>
                <SelectItem value="wrong_quantity">Wrong Quantity Delivered</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Provide additional details about the issue..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRefundModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createRefundMutation.isPending}
            >
              {createRefundMutation.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}