import { Button } from "@/components/ui/button";
import { 
  Grid3x3, 
  List, 
  Table,
  LayoutGrid
} from "lucide-react";

export type ViewType = "grid" | "table" | "list" | "compact";

interface ViewSelectorProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  className?: string;
}

export function ViewSelector({ currentView, onViewChange, className = "" }: ViewSelectorProps) {
  const viewOptions = [
    { 
      type: "grid" as ViewType, 
      icon: Grid3x3, 
      label: "Grid View",
      description: "Visual cards with details"
    },
    { 
      type: "table" as ViewType, 
      icon: Table, 
      label: "Table View",
      description: "Detailed table format"
    },
    { 
      type: "list" as ViewType, 
      icon: List, 
      label: "List View",
      description: "Compact list format"
    },
    { 
      type: "compact" as ViewType, 
      icon: LayoutGrid, 
      label: "Compact View",
      description: "Dense information"
    }
  ];

  return (
    <div className={`flex items-center gap-1 p-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border ${className}`}>
      {viewOptions.map(({ type, icon: Icon, label }) => (
        <Button
          key={type}
          variant={currentView === type ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewChange(type)}
          className={`
            ${currentView === type 
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm" 
              : "hover:bg-gray-100 dark:hover:bg-gray-700/50"
            }
            transition-all duration-200 text-xs
          `}
          title={label}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden md:inline ml-1">{label.split(' ')[0]}</span>
        </Button>
      ))}
    </div>
  );
}