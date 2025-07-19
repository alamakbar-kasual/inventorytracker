import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bell, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Schema for notification threshold
const thresholdSchema = z.object({
  materialId: z.number(),
  threshold: z.number().min(0, "Threshold must be positive"),
  userEmail: z.string().email("Valid email required"),
  alertType: z.enum(["low_stock", "critical_stock", "usage_spike"]),
});

type ThresholdForm = z.infer<typeof thresholdSchema>;

interface NotificationThreshold {
  id: string;
  materialId: number;
  materialName: string;
  threshold: number;
  userEmail: string;
  alertType: "low_stock" | "critical_stock" | "usage_spike";
  isActive: boolean;
}

interface NotificationThresholdModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materials: Array<{ id: number; name: string; quantity: number; }>;
  existingThresholds: NotificationThreshold[];
  onThresholdAdd: (threshold: Omit<NotificationThreshold, 'id'>) => void;
  onThresholdRemove: (id: string) => void;
}

export function NotificationThresholdModal({
  open,
  onOpenChange,
  materials,
  existingThresholds,
  onThresholdAdd,
  onThresholdRemove,
}: NotificationThresholdModalProps) {
  const { toast } = useToast();
  
  const form = useForm<ThresholdForm>({
    resolver: zodResolver(thresholdSchema),
    defaultValues: {
      threshold: 10,
      userEmail: "",
      alertType: "low_stock",
    },
  });

  const onSubmit = (data: ThresholdForm) => {
    const material = materials.find(m => m.id === data.materialId);
    if (!material) return;

    // Check if threshold already exists for this material and user
    const exists = existingThresholds.some(
      t => t.materialId === data.materialId && 
           t.userEmail === data.userEmail && 
           t.alertType === data.alertType
    );

    if (exists) {
      toast({
        title: "Threshold Already Exists",
        description: "A similar notification threshold already exists for this material and user.",
        variant: "destructive",
      });
      return;
    }

    onThresholdAdd({
      materialId: data.materialId,
      materialName: material.name,
      threshold: data.threshold,
      userEmail: data.userEmail,
      alertType: data.alertType,
      isActive: true,
    });

    toast({
      title: "Notification Threshold Added",
      description: `${data.userEmail} will be notified when ${material.name} ${
        data.alertType === "low_stock" ? "falls below" :
        data.alertType === "critical_stock" ? "is critically low at" :
        "usage spikes above"
      } ${data.threshold} ${material.name.includes("Thread") || material.name.includes("Button") ? "units" : "yards"}.`,
    });

    form.reset();
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case "low_stock": return "Low Stock";
      case "critical_stock": return "Critical Stock";
      case "usage_spike": return "Usage Spike";
      default: return type;
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case "low_stock": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "critical_stock": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "usage_spike": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Bell className="h-5 w-5 text-blue-600" />
            Notification Thresholds
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Threshold Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="materialId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-700">
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {materials.map((material) => (
                          <SelectItem key={material.id} value={material.id.toString()}>
                            {material.name} ({material.quantity} available)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="alertType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alert Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-700">
                          <SelectValue placeholder="Select alert type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low_stock">Low Stock Alert</SelectItem>
                        <SelectItem value="critical_stock">Critical Stock Alert</SelectItem>
                        <SelectItem value="usage_spike">Usage Spike Alert</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="threshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Threshold Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter threshold value"
                        className="rounded-xl border-gray-200 dark:border-gray-700"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="userEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="user@example.com"
                        className="rounded-xl border-gray-200 dark:border-gray-700"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Notification Threshold
              </Button>
            </form>
          </Form>

          {/* Existing Thresholds */}
          {existingThresholds.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Active Thresholds</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {existingThresholds.map((threshold) => (
                  <div
                    key={threshold.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                          {threshold.materialName}
                        </span>
                        <Badge className={getAlertTypeColor(threshold.alertType)}>
                          {getAlertTypeLabel(threshold.alertType)}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Notify {threshold.userEmail} when threshold {threshold.threshold} is hit
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onThresholdRemove(threshold.id)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}