import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { categories } from "@shared/schema";
import { cn } from "@/lib/utils";

interface SearchFilterProps {
  onSearch: (query: string) => void;
  onFilterCategory: (category: string) => void;
  selectedCategory: string;
}

export function SearchFilter({ onSearch, onFilterCategory, selectedCategory }: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <div className="glassmorphism dark:glassmorphism-dark rounded-2xl p-4">
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="p-3 bg-blue-600 hover:bg-blue-700 text-white border-none rounded-xl"
        >
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterCategory("all")}
          className={cn(
            "whitespace-nowrap rounded-full text-sm font-medium transition-colors",
            selectedCategory === "all"
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          )}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterCategory(category)}
            className={cn(
              "whitespace-nowrap rounded-full text-sm font-medium transition-colors",
              selectedCategory === category
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            )}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
}
