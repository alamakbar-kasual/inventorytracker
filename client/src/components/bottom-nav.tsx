import { Link, useLocation } from "wouter";
import { Home, BarChart3, Settings, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { t } = useLanguage();
  const [location] = useLocation();
  
  const tabs = [
    { id: "home", path: "/", label: t('nav.inventory'), icon: Home },
    { id: "analytics", path: "/analytics", label: t('nav.analytics'), icon: BarChart3 },
    { id: "finance", path: "/finance", label: "Finance", icon: DollarSign },
    { id: "settings", path: "/settings", label: t('nav.settings'), icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 glassmorphism dark:glassmorphism-dark border-t border-gray-200 dark:border-gray-700 z-40">
      <div className="flex justify-around py-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location === tab.path || (location === "/" && tab.id === "home");
          
          return (
            <Link 
              key={tab.id} 
              href={tab.path}
              className={cn(
                "flex flex-col items-center p-2 transition-colors",
                isActive
                  ? "text-blue-600"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
