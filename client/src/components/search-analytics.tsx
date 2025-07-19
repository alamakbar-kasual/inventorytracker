import { useState, useEffect } from "react";
import { MaterialWithSkus } from "@shared/schema";
import { TrendingUp, Search, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SearchAnalyticsProps {
  materials: MaterialWithSkus[];
}

interface SearchStats {
  popularSearches: string[];
  recentTrends: string[];
  searchVolume: number;
}

export function SearchAnalytics({ materials }: SearchAnalyticsProps) {
  const [stats, setStats] = useState<SearchStats>({
    popularSearches: [],
    recentTrends: [],
    searchVolume: 0
  });

  useEffect(() => {
    const loadSearchStats = () => {
      try {
        const history = localStorage.getItem('material-search-history');
        const searchLog = localStorage.getItem('material-search-log');
        
        if (history) {
          const recentSearches = JSON.parse(history);
          setStats(prev => ({
            ...prev,
            popularSearches: recentSearches.slice(0, 3),
            recentTrends: [...new Set([...materials.map(m => m.category), ...materials.map(m => m.name.split(' ')[0])])].slice(0, 5)
          }));
        }

        if (searchLog) {
          const log = JSON.parse(searchLog);
          setStats(prev => ({
            ...prev,
            searchVolume: log.length
          }));
        }
      } catch (error) {
        console.error('Failed to load search stats:', error);
      }
    };

    loadSearchStats();
  }, [materials]);

  return (
    <div className="glassmorphism dark:glassmorphism-dark rounded-xl p-4 space-y-3">
      <div className="flex items-center space-x-2 mb-3">
        <TrendingUp className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Search Insights</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center space-x-1 mb-2">
            <Search className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Popular</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {stats.popularSearches.slice(0, 3).map((search, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20">
                {search}
              </Badge>
            ))}
          </div>
        </div>
        
        <div>
          <div className="flex items-center space-x-1 mb-2">
            <Clock className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Trending</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {stats.recentTrends.slice(0, 3).map((trend, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-green-50 dark:bg-green-900/20">
                {trend}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      
      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {stats.searchVolume} searches this month
        </span>
      </div>
    </div>
  );
}