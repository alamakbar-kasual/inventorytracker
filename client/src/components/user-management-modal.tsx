import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, roles, type UserRole } from "@shared/schema";
import { Save, Loader2 } from "lucide-react";

const userFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(roles),
  department: z.string().optional(),
  phoneNumber: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  isActive: z.boolean(),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null; // null for new user, User object for editing
}

export function UserManagementModal({
  isOpen,
  onClose,
  user,
}: UserManagementModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "employee",
      department: "",
      phoneNumber: "",
      password: "",
      isActive: true,
    },
  });

  // Reset form when user prop changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (user) {
        // Editing existing user
        form.reset({
          name: user.name || "",
          email: user.email || "",
          role: user.role as UserRole,
          department: user.department || "",
          phoneNumber: user.phoneNumber || "",
          password: "", // Don't populate password for security
          isActive: user.isActive,
        });
      } else {
        // Creating new user
        form.reset({
          name: "",
          email: "",
          role: "employee",
          department: "",
          phoneNumber: "",
          password: "",
          isActive: true,
        });
      }
    }
  }, [isOpen, user, form]);

  const createUserMutation = useMutation({
    mutationFn: async (userData: UserFormData) => {
      return await apiRequest("/api/users", "POST", userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User created successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: number; userData: Partial<UserFormData> }) => {
      return await apiRequest(`/api/users/${id}`, "PUT", userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      if (user) {
        // Update existing user
        const updateData = { ...data };
        // Remove password if it's empty (don't update password)
        if (!updateData.password) {
          delete updateData.password;
        }
        await updateUserMutation.mutateAsync({ id: user.id, userData: updateData });
      } else {
        // Create new user
        await createUserMutation.mutateAsync(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = createUserMutation.isPending || updateUserMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {user ? "Edit User" : "Add New User"}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            {user ? "Update the user information and permissions below." : "Create a new user account with the appropriate role and access level."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Enter full name"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="Enter email address"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={form.watch("role")}
              onValueChange={(value) => form.setValue("role", value as UserRole)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              {...form.register("department")}
              placeholder="Enter department (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              {...form.register("phoneNumber")}
              placeholder="Enter phone number (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {user ? "New Password (leave blank to keep current)" : "Password"}
            </Label>
            <Input
              id="password"
              type="password"
              {...form.register("password")}
              placeholder={user ? "Enter new password (optional)" : "Enter password"}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isActive">Active User</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                User can log in and access the system
              </p>
            </div>
            <Switch
              id="isActive"
              checked={form.watch("isActive")}
              onCheckedChange={(checked) => form.setValue("isActive", checked)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {user ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {user ? "Update User" : "Create User"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}