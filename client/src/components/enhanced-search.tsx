import { useState, useMemo, useEffect, useRef } from "react";
import { Search, X, Clock, Hash, Package, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MaterialWithSkus } from "@shared/schema";
import { cn } from "@/lib/utils";
import { fuzzySearch, highlightMatches, type FuzzySearchResult } from "@/lib/fuzzy-search";
import { useSearchShortcuts } from "@/hooks/use-search-shortcuts";
import { useDebounce } from "@/hooks/use-debounce";

interface EnhancedSearchProps {
  materials: MaterialWithSkus[];
  onSearch: (query: string) => void;
  onFilterCategory: (category: string) => void;
  selectedCategory: string;
  searchQuery: string;
}

interface SearchSuggestion {
  type: 'material' | 'category' | 'sku' | 'recent';
  value: string;
  label: string;
  icon: React.ComponentType<any>;
  meta?: string;
  matches?: number[];
  fuzzyResult?: FuzzySearchResult<MaterialWithSkus>;
}

export function EnhancedSearch({ 
  materials, 
  onSearch, 
  onFilterCategory, 
  selectedCategory,
  searchQuery 
}: EnhancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Search shortcuts
  useSearchShortcuts({
    onToggleSearch: () => {
      setIsExpanded(!isExpanded);
      if (!isExpanded) {
        inputRef.current?.focus();
      }
    },
    onClearSearch: () => {
      onSearch('');
      onFilterCategory('all');
      setIsExpanded(false);
    },
    onFocusSearch: () => {
      inputRef.current?.focus();
      setIsExpanded(true);
    }
  });

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('material-search-history');
    if (stored) {
      setRecentSearches(JSON.parse(stored).slice(0, 5));
    }
  }, []);

  // Generate suggestions based on current input
  const generateSuggestions = useMemo(() => {
    if (!searchQuery.trim()) {
      // Show recent searches and popular categories when empty
      const recentSuggestions: SearchSuggestion[] = recentSearches.map(search => ({
        type: 'recent',
        value: search,
        label: search,
        icon: Clock
      }));

      const categorySuggestions: SearchSuggestion[] = [
        ...new Set(materials.map(m => m.category))
      ].slice(0, 4).map(category => ({
        type: 'category',
        value: category,
        label: category,
        icon: Tag,
        meta: `${materials.filter(m => m.category === category).length} items`
      }));

      return [...recentSuggestions, ...categorySuggestions];
    }

    const query = searchQuery.toLowerCase();
    const allSuggestions: SearchSuggestion[] = [];

    // Fuzzy search for materials
    const fuzzyMaterialResults = fuzzySearch(
      materials, 
      query, 
      (material) => `${material.name} ${material.description || ''}`,
      0.2
    );
    
    const materialSuggestions = fuzzyMaterialResults
      .slice(0, 5)
      .map(result => ({
        type: 'material' as const,
        value: result.item.name,
        label: result.item.name,
        icon: Package,
        meta: `${result.item.quantity} ${result.item.unit} • ${result.item.category}`,
        matches: result.matches,
        fuzzyResult: result
      }));

    // SKU suggestions
    const skuSuggestions = materials
      .flatMap(material => 
        material.skus?.filter(sku => 
          sku.sku.toLowerCase().includes(query)
        ).map(sku => ({
          type: 'sku' as const,
          value: sku.sku,
          label: sku.sku,
          icon: Hash,
          meta: `${material.name} • ${material.category}`
        })) || []
      )
      .slice(0, 3);

    // Category suggestions
    const categorySuggestions = [
      ...new Set(materials.map(m => m.category))
    ]
      .filter(category => category.toLowerCase().includes(query))
      .slice(0, 3)
      .map(category => ({
        type: 'category' as const,
        value: category,
        label: category,
        icon: Tag,
        meta: `${materials.filter(m => m.category === category).length} items`
      }));

    allSuggestions.push(...materialSuggestions, ...skuSuggestions, ...categorySuggestions);
    return allSuggestions.slice(0, 8);
  }, [searchQuery, materials, recentSearches]);

  useEffect(() => {
    setSuggestions(generateSuggestions);
    setActiveSuggestionIndex(-1);
  }, [generateSuggestions]);

  const handleInputChange = (value: string) => {
    onSearch(value);
    setIsExpanded(true);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'category') {
      onFilterCategory(suggestion.value);
      onSearch('');
    } else {
      onSearch(suggestion.value);
      saveToRecentSearches(suggestion.value);
    }
    setIsExpanded(false);
    inputRef.current?.blur();
  };

  const saveToRecentSearches = (search: string) => {
    if (!search.trim()) return;
    
    const newRecentSearches = [
      search,
      ...recentSearches.filter(s => s !== search)
    ].slice(0, 5);
    
    setRecentSearches(newRecentSearches);
    localStorage.setItem('material-search-history', JSON.stringify(newRecentSearches));
    
    // Track search analytics
    const searchLog = localStorage.getItem('material-search-log') || '[]';
    const log = JSON.parse(searchLog);
    log.push({
      query: search,
      timestamp: Date.now(),
      month: new Date().getMonth(),
      year: new Date().getFullYear()
    });
    
    // Keep only last 100 searches
    const recentLog = log.slice(-100);
    localStorage.setItem('material-search-log', JSON.stringify(recentLog));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isExpanded || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (activeSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[activeSuggestionIndex]);
        } else if (searchQuery.trim()) {
          saveToRecentSearches(searchQuery);
          setIsExpanded(false);
          inputRef.current?.blur();
        }
        break;
      case 'Escape':
        setIsExpanded(false);
        inputRef.current?.blur();
        break;
    }
  };

  const clearSearch = () => {
    onSearch('');
    onFilterCategory('all');
    setIsExpanded(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('material-search-history');
  };

  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(materials.map(material => material.category))];
  }, [materials]);

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search materials, SKUs, categories..."
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-24 glassmorphism dark:glassmorphism-dark border-white/20 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {searchQuery && (
            <Button
              size="sm"
              variant="ghost"
              onClick={clearSearch}
              className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
          <div className="hidden sm:flex items-center space-x-1">
            <kbd className="h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 inline-flex">
              <span className="text-xs">⌘</span>K
            </kbd>
            <span className="text-xs text-gray-400">/</span>
            <kbd className="h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 inline-flex">
              /
            </kbd>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {(selectedCategory !== 'all' || searchQuery) && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedCategory !== 'all' && (
            <Badge 
              variant="secondary" 
              className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
            >
              <Tag className="w-3 h-3" />
              {selectedCategory}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onFilterCategory('all')}
                className="h-4 w-4 p-0 ml-1 hover:bg-blue-200 dark:hover:bg-blue-800"
              >
                <X className="w-2 h-2" />
              </Button>
            </Badge>
          )}
          {searchQuery && (
            <Badge 
              variant="secondary" 
              className="flex items-center gap-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
            >
              <Search className="w-3 h-3" />
              "{searchQuery}"
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onSearch('')}
                className="h-4 w-4 p-0 ml-1 hover:bg-green-200 dark:hover:bg-green-800"
              >
                <X className="w-2 h-2" />
              </Button>
            </Badge>
          )}
        </div>
      )}

      {/* Quick Category Filters */}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => onFilterCategory('all')}
          className="h-8 text-xs"
        >
          All Categories
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            size="sm"
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => onFilterCategory(category)}
            className="h-8 text-xs"
          >
            {category}
            <Badge variant="secondary" className="ml-2 text-[10px]">
              {materials.filter(m => m.category === category).length}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Search Suggestions Dropdown */}
      {isExpanded && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 z-50 glassmorphism dark:glassmorphism-dark border border-white/20 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          <div className="p-2">
            {/* Recent searches header */}
            {!searchQuery && recentSearches.length > 0 && (
              <div className="flex items-center justify-between mb-2 px-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Recent searches</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearRecentSearches}
                  className="h-5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Clear
                </Button>
              </div>
            )}
            
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.type}-${suggestion.value}`}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md cursor-pointer transition-colors",
                  index === activeSuggestionIndex 
                    ? "bg-blue-100 dark:bg-blue-900/50" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <suggestion.icon className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p 
                    className="text-sm font-medium text-gray-900 dark:text-white truncate"
                    dangerouslySetInnerHTML={{
                      __html: suggestion.matches 
                        ? highlightMatches(suggestion.label, suggestion.matches)
                        : suggestion.label
                    }}
                  />
                  {suggestion.meta && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {suggestion.meta}
                    </p>
                  )}
                </div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    suggestion.type === 'material' && "border-green-200 text-green-700 dark:border-green-800 dark:text-green-300",
                    suggestion.type === 'category' && "border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300",
                    suggestion.type === 'sku' && "border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300",
                    suggestion.type === 'recent' && "border-gray-200 text-gray-700 dark:border-gray-600 dark:text-gray-300"
                  )}
                >
                  {suggestion.type}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}