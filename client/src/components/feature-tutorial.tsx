import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Play,
  BookOpen,
  Target
} from "lucide-react";

interface TutorialStep {
  title: string;
  description: string;
  action: string;
  tip?: string;
}

interface FeatureTutorialProps {
  title: string;
  description: string;
  steps: TutorialStep[];
  onComplete?: () => void;
}

export function FeatureTutorial({ title, description, steps, onComplete }: FeatureTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepComplete = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    if (currentStep === steps.length - 1 && onComplete) {
      onComplete();
    } else {
      handleNext();
    }
  };

  const progress = (completedSteps.length / steps.length) * 100;

  return (
    <Card className="p-6 glassmorphism dark:glassmorphism-dark max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
          <BookOpen className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm font-medium text-blue-600">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Step */}
      <div className="mb-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            {completedSteps.includes(currentStep) ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600">{currentStep + 1}</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {steps[currentStep].title}
            </h4>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              {steps[currentStep].description}
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-3">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Action Required:</span>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {steps[currentStep].action}
              </p>
            </div>

            {steps[currentStep].tip && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>💡 Tip:</strong> {steps[currentStep].tip}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>

        <div className="flex space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                completedSteps.includes(index)
                  ? 'bg-green-600'
                  : index === currentStep
                  ? 'bg-blue-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={handleStepComplete}
          className="flex items-center space-x-2"
        >
          {completedSteps.includes(currentStep) ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Done</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Mark Complete</span>
            </>
          )}
          {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
        </Button>
      </div>

      {/* Completion Message */}
      {completedSteps.length === steps.length && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h4 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-1">
            Tutorial Complete!
          </h4>
          <p className="text-sm text-green-800 dark:text-green-200">
            You've successfully learned how to use {title.toLowerCase()}. 
            Start using these features to improve your workflow!
          </p>
        </div>
      )}
    </Card>
  );
}