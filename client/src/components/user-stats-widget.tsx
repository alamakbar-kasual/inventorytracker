import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { User, type UserRole } from "@shared/schema";
import { useLocation } from "wouter";
import {
  Users,
  Crown,
  Star,
  Eye,
  UserPlus,
  Shield,
  Activity,
  UserCheck
} from "lucide-react";

export function UserStatsWidget() {
  const [, setLocation] = useLocation();
  
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    admins: users.filter(u => u.role === "admin").length,
    managers: users.filter(u => u.role === "manager").length,
    employees: users.filter(u => u.role === "employee").length,
    viewers: users.filter(u => u.role === "viewer").length,
  };

  if (isLoading) {
    return (
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Overview
          </div>
          <Badge variant="outline" className="text-xs">
            {stats.active}/{stats.total} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-blue-600">Total Users</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-xs text-green-600">Active</div>
          </div>
        </div>

        {/* Role Breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-red-500" />
              <span className="text-sm">Admins</span>
            </div>
            <Badge className="bg-red-500 text-white text-xs">{stats.admins}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Managers</span>
            </div>
            <Badge className="bg-blue-500 text-white text-xs">{stats.managers}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-green-500" />
              <span className="text-sm">Employees</span>
            </div>
            <Badge className="bg-green-500 text-white text-xs">{stats.employees}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Viewers</span>
            </div>
            <Badge className="bg-gray-500 text-white text-xs">{stats.viewers}</Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setLocation("/users")}
            className="text-xs"
          >
            <UserPlus className="w-3 h-3 mr-1" />
            Add User
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setLocation("/users")}
            className="text-xs"
          >
            <Shield className="w-3 h-3 mr-1" />
            Manage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}