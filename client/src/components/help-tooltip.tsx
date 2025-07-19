import { ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HelpTooltipProps {
  content: string;
  children?: ReactNode;
  className?: string;
}

export function HelpTooltip({ content, children, className = "" }: HelpTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || (
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-5 w-5 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ${className}`}
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          )}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-sm">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}