import { PredictionsDashboard } from "@/components/predictions-dashboard";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export default function Predictions() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("predictions");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "home") {
      setLocation("/");
    } else if (tab === "analytics") {
      setLocation("/analytics");
    } else if (tab === "settings") {
      setLocation("/settings");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Header */}
      <header className="glassmorphism dark:glassmorphism-dark sticky top-0 z-50 px-4 py-3 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Brain className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">AI Predictions</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Inventory Intelligence</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 mb-20">
        <PredictionsDashboard />
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}