import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Clock, User, Activity, FileText, Search, Filter, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import type { ActivityLog } from "@shared/schema";

interface ActivityLogModalProps {
  children: React.ReactNode;
}

export function ActivityLogModal({ children }: ActivityLogModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/activity-logs"],
    enabled: isOpen,
  });

  const filteredLogs = logs.filter((log: ActivityLog) => {
    const matchesSearch = searchTerm === "" || 
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesEntity = entityFilter === "all" || log.entityType === entityFilter;
    
    return matchesSearch && matchesAction && matchesEntity;
  });

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "update":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "delete":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "login":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "view":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
        return "➕";
      case "update":
        return "✏️";
      case "delete":
        return "🗑️";
      case "login":
        return "🔑";
      case "view":
        return "👁️";
      default:
        return "⚡";
    }
  };

  const uniqueActions = [...new Set(logs.map((log: ActivityLog) => log.action))];
  const uniqueEntities = [...new Set(logs.map((log: ActivityLog) => log.entityType))];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activity Log
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-6 pb-4 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueEntities.map((entity) => (
                  <SelectItem key={entity} value={entity}>
                    {entity.charAt(0).toUpperCase() + entity.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 px-6 pb-6 max-h-[50vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Loading activity logs...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No activity logs found</p>
              <p className="text-sm">
                {searchTerm || actionFilter !== "all" || entityFilter !== "all" 
                  ? "Try adjusting your filters" 
                  : "System activities will appear here"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log: ActivityLog) => (
                <Card key={log.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <span className="text-lg">{getActionIcon(log.action)}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {log.description}
                            </p>
                            
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={`text-xs ${getActionColor(log.action)}`}>
                                {log.action.toUpperCase()}
                              </Badge>
                              
                              <Badge variant="outline" className="text-xs">
                                {log.entityType}
                              </Badge>
                              
                              {log.userId && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <User className="w-3 h-3" />
                                  {log.userId}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                            <Clock className="w-3 h-3" />
                            {format(new Date(log.timestamp), "MMM dd, HH:mm")}
                          </div>
                        </div>
                        
                        {log.entityName && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Entity: {log.entityName}
                          </p>
                        )}
                        
                        {log.metadata && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                              View metadata
                            </summary>
                            <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
                              {JSON.stringify(JSON.parse(log.metadata), null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}