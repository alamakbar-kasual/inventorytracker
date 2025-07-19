import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertMaterialSchema, categories, type InsertMaterial, type Material } from "@shared/schema";
import { z } from "zod";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { useQuery } from "@tanstack/react-query";

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InsertMaterial) => void;
  editingMaterial?: Material;
}

const formSchema = insertMaterialSchema.extend({
  minStockLevel: z.coerce.number().min(0).default(10),
  quantity: z.coerce.number().min(0),
  totalYards: z.coerce.number().min(0).optional(),
  dateOfPurchase: z.date().optional(),
  unitPrice: z.coerce.number().min(0).default(0),
  totalValue: z.coerce.number().min(0).default(0),
});

type FormData = z.infer<typeof formSchema>;

export function AddMaterialModal({ isOpen, onClose, onSubmit, editingMaterial }: AddMaterialModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [materialOpen, setMaterialOpen] = useState(false);
  const [materialSearch, setMaterialSearch] = useState("");

  // Get all materials to extract unique suppliers and material names
  const { data: materials = [] } = useQuery({
    queryKey: ["/api/materials"],
  });

  // Extract unique suppliers
  const suppliers = [...new Set(materials
    .map(m => m.supplierName)
    .filter(Boolean)
  )].sort();

  // Extract unique material names
  const materialNames = [...new Set(materials
    .map(m => m.name)
    .filter(Boolean)
  )].sort();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: editingMaterial ? {
      name: editingMaterial.name,
      description: editingMaterial.description || "",
      category: editingMaterial.category,
      quantity: editingMaterial.quantity,
      unit: editingMaterial.unit,
      sku: editingMaterial.sku,
      minStockLevel: editingMaterial.minStockLevel || 10,
      dateOfPurchase: editingMaterial.dateOfPurchase ? new Date(editingMaterial.dateOfPurchase) : undefined,
      supplierName: editingMaterial.supplierName || "",
      totalYards: editingMaterial.totalYards || undefined,
      usageForProduct: editingMaterial.usageForProduct || "",
      unitPrice: editingMaterial.unitPrice || 0,
      totalValue: editingMaterial.totalValue || 0,
    } : {
      name: "",
      description: "",
      category: "",
      quantity: 0,
      unit: "",
      sku: "",
      minStockLevel: 10,
      dateOfPurchase: undefined,
      supplierName: "",
      totalYards: undefined,
      usageForProduct: "",
      unitPrice: 0,
      totalValue: 0,
    },
  });

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset();
      onClose();
    } catch (error) {
      console.error("Failed to submit material:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSKU = () => {
    const category = form.watch("category");
    const name = form.watch("name");
    
    if (category && name) {
      const categoryPrefix = category.substring(0, 3).toUpperCase();
      const namePrefix = name.substring(0, 3).toUpperCase();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const sku = `${categoryPrefix}-${namePrefix}-${random}`;
      form.setValue("sku", sku);
    }
  };

  const calculateTotalValue = () => {
    const quantity = form.watch("quantity");
    const unitPrice = form.watch("unitPrice");
    const totalValue = Math.round(quantity * unitPrice);
    form.setValue("totalValue", totalValue);
  };

  // Watch for changes in quantity and unit price to auto-calculate total value
  const watchedQuantity = form.watch("quantity");
  const watchedUnitPrice = form.watch("unitPrice");

  React.useEffect(() => {
    calculateTotalValue();
  }, [watchedQuantity, watchedUnitPrice]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glassmorphism dark:glassmorphism-dark max-w-md mx-4 rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            {editingMaterial ? "Edit Material" : "Add New Material"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-gray-700 dark:text-gray-300">Material Name</FormLabel>
                  <Popover open={materialOpen} onOpenChange={setMaterialOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={materialOpen}
                          className="w-full justify-between bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl text-left font-normal"
                        >
                          {field.value || "Select or type material name..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput 
                          placeholder="Search or add new material..." 
                          value={materialSearch}
                          onValueChange={(value) => {
                            setMaterialSearch(value);
                            field.onChange(value);
                          }}
                        />
                        <CommandEmpty>
                          <div className="p-2 text-sm">
                            Press enter to add "{materialSearch}" as a new material
                          </div>
                        </CommandEmpty>
                        <CommandGroup>
                          {materialNames
                            .filter(name => 
                              name.toLowerCase().includes(materialSearch.toLowerCase())
                            )
                            .map((name) => (
                              <CommandItem
                                key={name}
                                value={name}
                                onSelect={(currentValue) => {
                                  field.onChange(currentValue);
                                  setMaterialOpen(false);
                                  setMaterialSearch("");
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === name ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {name}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter material description"
                      className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">Quantity</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="0"
                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">Unit</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="meter">meter</SelectItem>
                        <SelectItem value="yard">yard</SelectItem>
                        <SelectItem value="pieces">pieces</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Enhanced Material Fields */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Additional Details</h3>
              
              <FormField
                control={form.control}
                name="supplierName"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-gray-700 dark:text-gray-300">Supplier Name</FormLabel>
                    <Popover open={supplierOpen} onOpenChange={setSupplierOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={supplierOpen}
                            className="w-full justify-between bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl text-left font-normal"
                          >
                            {field.value || "Select or type supplier..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput 
                            placeholder="Search or add new supplier..." 
                            value={supplierSearch}
                            onValueChange={(value) => {
                              setSupplierSearch(value);
                              field.onChange(value);
                            }}
                          />
                          <CommandEmpty>
                            <div className="p-2 text-sm">
                              Press enter to add "{supplierSearch}" as a new supplier
                            </div>
                          </CommandEmpty>
                          <CommandGroup>
                            {suppliers
                              .filter(supplier => 
                                supplier.toLowerCase().includes(supplierSearch.toLowerCase())
                              )
                              .map((supplier) => (
                                <CommandItem
                                  key={supplier}
                                  value={supplier}
                                  onSelect={(currentValue) => {
                                    field.onChange(currentValue);
                                    setSupplierOpen(false);
                                    setSupplierSearch("");
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === supplier ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {supplier}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfPurchase"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-gray-700 dark:text-gray-300">Date of Purchase</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("category")?.toLowerCase() === "fabrics" && (
                <FormField
                  control={form.control}
                  name="totalYards"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Total Yards</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="Enter total yards"
                          className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}


            </div>

            {/* Finance Section */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">Unit Price (IDR)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Price per unit (IDR)"
                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">Total Value (IDR)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Auto-calculated"
                        readOnly
                        className="bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-700 rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* SKU Generation Section */}
            <div className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-gray-700 dark:text-gray-300">SKU</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Auto-generated"
                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateSKU}
                className="mt-6"
              >
                Generate
              </Button>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {isSubmitting ? "Saving..." : editingMaterial ? "Update" : "Add Material"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
