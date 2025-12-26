import { PredictionsDashboard } from "@/components/predictions-dashboard";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain, Sparkles } from "lucide-react";
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
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 px-4 py-3 mb-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Smart Restock</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">AI-Powered Inventory Insights</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 pb-24 max-w-6xl mx-auto">
        <PredictionsDashboard />
      </main>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}