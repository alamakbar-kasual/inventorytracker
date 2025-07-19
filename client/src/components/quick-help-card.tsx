import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, ArrowRight, Lightbulb } from "lucide-react";
import { useLocation } from "wouter";

interface QuickHelpCardProps {
  title: string;
  description: string;
  tips: string[];
  helpPath?: string;
}

export function QuickHelpCard({ title, description, tips, helpPath }: QuickHelpCardProps) {
  const [, setLocation] = useLocation();

  return (
    <Card className="p-4 glassmorphism dark:glassmorphism-dark">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Book className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        {helpPath && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setLocation(helpPath)}
            className="text-xs h-6 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Learn More
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        )}
      </div>
      
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{description}</p>
      
      {tips && tips.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center space-x-1 mb-2">
            <Lightbulb className="w-3 h-3 text-yellow-600" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Quick Tips:</span>
          </div>
          {tips.slice(0, 2).map((tip, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="w-1 h-1 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0" />
              <p className="text-xs text-gray-600 dark:text-gray-400">{tip}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}