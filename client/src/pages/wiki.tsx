import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BottomNav } from "@/components/bottom-nav";
import { 
  ArrowLeft, 
  Book, 
  Search, 
  Package, 
  BarChart3, 
  Brain, 
  Users, 
  Settings,
  Eye,
  Zap,
  Shield,
  Smartphone,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  Target,
  TrendingUp
} from "lucide-react";
import { useLocation } from "wouter";

export default function Wiki() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("wiki");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

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

  const features = [
    {
      id: "inventory",
      title: "Material Inventory Management",
      icon: Package,
      description: "Track and manage your raw materials with comprehensive inventory controls",
      details: {
        overview: "The inventory system is the core of the app, allowing you to track all your raw materials, monitor stock levels, and manage material information efficiently.",
        keyFeatures: [
          "Add, edit, and delete materials with detailed information",
          "Track quantity, units, categories, and suppliers",
          "Multiple SKU support for materials with variants",
          "Minimum stock level alerts and notifications",
          "Date of purchase and usage tracking",
          "Fabric-specific fields like total yards"
        ],
        howToUse: [
          "Tap the '+' button to add new materials",
          "Fill in material details including name, category, quantity",
          "Set minimum stock levels for automatic alerts",
          "Use the edit button on any material card to update information",
          "Track material consumption for cost analysis"
        ],
        tips: [
          "Set realistic minimum stock levels to avoid stockouts",
          "Use descriptive names and categories for better organization",
          "Regularly update quantities after material usage",
          "Take advantage of supplier tracking for reordering"
        ]
      }
    },
    {
      id: "search",
      title: "Enhanced Search System",
      icon: Search,
      description: "Intelligent search with autocomplete, fuzzy matching, and keyboard shortcuts",
      details: {
        overview: "The enhanced search system helps you quickly find materials using intelligent algorithms and provides suggestions as you type.",
        keyFeatures: [
          "Fuzzy search algorithm that handles typos and partial matches",
          "Autocomplete suggestions for materials, SKUs, and categories",
          "Recent search history and analytics tracking",
          "Keyboard shortcuts for quick access (Cmd+K, /)",
          "Real-time search results with visual highlighting",
          "Category filters with item counts",
          "Search results summary with statistics"
        ],
        howToUse: [
          "Use Cmd+K (Mac) or Ctrl+K (Windows) to open search",
          "Press '/' key to quickly focus on search",
          "Type partial names or even misspelled words",
          "Use arrow keys to navigate suggestions",
          "Press Escape to clear search and filters",
          "Click on category badges to filter by type"
        ],
        tips: [
          "Don't worry about exact spelling - fuzzy search will find matches",
          "Use keyboard shortcuts for faster navigation",
          "Recent searches are saved for quick access",
          "Combine search terms with category filters for precise results"
        ]
      }
    },
    {
      id: "views",
      title: "Multiple View Options",
      icon: Eye,
      description: "Four different ways to view your inventory: Grid, Table, List, and Compact",
      details: {
        overview: "Choose how you want to view your materials with four different layout options, each optimized for different use cases.",
        keyFeatures: [
          "Grid View: Visual cards with material images and key info",
          "Table View: Spreadsheet-like layout for detailed data",
          "List View: Simplified list format for quick scanning", 
          "Compact View: Minimal design for maximum information density",
          "Responsive design that adapts to screen size",
          "View preferences saved automatically"
        ],
        howToUse: [
          "Find the view selector in the top-right of inventory page",
          "Tap different view icons to switch layouts",
          "Your preferred view is saved automatically",
          "Each view shows the same data, just formatted differently"
        ],
        tips: [
          "Use Grid view for visual material identification",
          "Table view is best for comparing multiple data points",
          "List view works well on mobile devices",
          "Compact view fits more materials on screen"
        ]
      }
    },
    {
      id: "predictions",
      title: "AI-Powered Predictions",
      icon: Brain,
      description: "Intelligent inventory forecasting with reorder suggestions and trend analysis",
      details: {
        overview: "AI predictions analyze your usage patterns to forecast when materials will run out and suggest optimal reorder quantities.",
        keyFeatures: [
          "Predictive analytics for stock depletion dates",
          "Usage trend analysis (increasing/decreasing/stable)",
          "Intelligent reorder quantity recommendations",
          "Criticality levels (low/medium/high/critical)",
          "Confidence scoring for prediction accuracy",
          "Historical consumption pattern analysis",
          "Seasonal trend identification"
        ],
        howToUse: [
          "View predictions widget on main inventory page",
          "Navigate to dedicated Predictions page for full analysis",
          "Check 'Top Risks' tab for materials needing attention",
          "Review 'Reorder Suggestions' for purchase recommendations",
          "Monitor confidence levels to trust predictions"
        ],
        tips: [
          "Predictions improve with more consumption data",
          "Act on critical alerts quickly to avoid stockouts",
          "Use reorder suggestions as starting points for purchasing",
          "Track prediction accuracy over time"
        ]
      }
    },
    {
      id: "analytics",
      title: "Comprehensive Analytics",
      icon: BarChart3,
      description: "Visual dashboards with charts, trends, and actionable insights",
      details: {
        overview: "Analytics provide deep insights into your inventory performance with interactive charts and comprehensive reporting.",
        keyFeatures: [
          "Interactive charts for stock distribution and usage trends",
          "Material consumption tracking over time",
          "Category-wise analysis and comparisons",
          "Stock level alerts and notifications",
          "Usage efficiency metrics",
          "Cost analysis and COGS tracking",
          "Exportable reports and data"
        ],
        howToUse: [
          "Access Analytics from bottom navigation",
          "Explore different chart types and time periods",
          "Interact with charts to drill down into data",
          "Use filters to focus on specific categories",
          "Export data for external analysis"
        ],
        tips: [
          "Regular analytics review helps optimize inventory",
          "Use trend data to plan future purchases",
          "Set up alerts for proactive management",
          "Compare periods to identify patterns"
        ]
      }
    },
    {
      id: "users",
      title: "User Management System",
      icon: Users,
      description: "Role-based access control with comprehensive user administration",
      details: {
        overview: "Manage team access with role-based permissions, ensuring the right people have appropriate access to inventory functions.",
        keyFeatures: [
          "Four user roles: Admin, Manager, Employee, Viewer",
          "Granular permission controls",
          "User profile management",
          "Password security and session management",
          "User activity tracking",
          "Bulk user operations",
          "Role hierarchy and inheritance"
        ],
        howToUse: [
          "Access User Management from settings or direct link",
          "Create users with appropriate roles",
          "Assign permissions based on job functions",
          "Monitor user activity and access logs",
          "Update roles as team members change responsibilities"
        ],
        tips: [
          "Follow principle of least privilege",
          "Regularly review user permissions",
          "Use Manager role for department heads",
          "Employee role for day-to-day operations"
        ]
      }
    },
    {
      id: "settings",
      title: "Comprehensive Settings",
      icon: Settings,
      description: "Customize app behavior, notifications, and personal preferences",
      details: {
        overview: "Settings allow you to personalize the app experience and configure system behavior to match your workflow.",
        keyFeatures: [
          "Profile management and company information",
          "Notification preferences and alert settings",
          "Inventory configuration and default values",
          "Display options including theme and language",
          "Data management and export capabilities",
          "Security and privacy controls",
          "System integration settings"
        ],
        howToUse: [
          "Access Settings from bottom navigation",
          "Navigate through different setting categories",
          "Adjust preferences to match your workflow",
          "Save changes and test new configurations",
          "Export data when needed for backup"
        ],
        tips: [
          "Set up notifications to stay informed",
          "Choose dark/light theme based on preference",
          "Configure default units for efficiency",
          "Regularly backup your data"
        ]
      }
    }
  ];

  const getStartedSteps = [
    {
      title: "Add Your First Material",
      description: "Start by adding a material to your inventory",
      icon: Package,
      steps: ["Tap the '+' button", "Fill in material details", "Set minimum stock level", "Save the material"]
    },
    {
      title: "Record Material Usage",
      description: "Track consumption for accurate predictions",
      icon: Target,
      steps: ["Find material in inventory", "Tap consumption button", "Enter quantity used", "Select product/purpose"]
    },
    {
      title: "Explore AI Predictions",
      description: "Get intelligent insights about your inventory",
      icon: Brain,
      steps: ["Check predictions widget", "Visit Predictions page", "Review reorder suggestions", "Act on critical alerts"]
    },
    {
      title: "Customize Your Experience",
      description: "Set up the app to match your workflow",
      icon: Settings,
      steps: ["Go to Settings", "Configure notifications", "Set display preferences", "Add team members"]
    }
  ];

  if (selectedTopic) {
    const feature = features.find(f => f.id === selectedTopic);
    if (feature) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          {/* Header */}
          <header className="glassmorphism dark:glassmorphism-dark sticky top-0 z-50 px-4 py-3 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedTopic(null)}
                  className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <feature.icon className="w-6 h-6 text-blue-600" />
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">{feature.title}</h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="px-4 mb-20 space-y-6">
            <Card className="p-6 glassmorphism dark:glassmorphism-dark">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Overview</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {feature.details.overview}
              </p>
            </Card>

            <Card className="p-6 glassmorphism dark:glassmorphism-dark">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Key Features</h2>
              <div className="space-y-3">
                {feature.details.keyFeatures.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300">{item}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 glassmorphism dark:glassmorphism-dark">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">How to Use</h2>
              <div className="space-y-4">
                {feature.details.howToUse.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex-shrink-0">
                      {index + 1}
                    </Badge>
                    <p className="text-gray-700 dark:text-gray-300">{step}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 glassmorphism dark:glassmorphism-dark">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                <Lightbulb className="w-5 h-5 inline mr-2 text-yellow-600" />
                Tips & Best Practices
              </h2>
              <div className="space-y-3">
                {feature.details.tips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300">{tip}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
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
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Book className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Help & Documentation</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Learn how to use all features</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 mb-20">
        <Tabs value="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* App Overview */}
            <Card className="p-6 glassmorphism dark:glassmorphism-dark">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to Material Inventory Management
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                This app is a comprehensive inventory management system designed specifically for fashion manufacturing and small businesses. 
                It helps you track raw materials, predict inventory needs, and optimize your purchasing decisions.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Package className="w-6 h-6 mx-auto text-blue-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Inventory</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Material tracking</p>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Brain className="w-6 h-6 mx-auto text-green-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">AI Predictions</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Smart forecasting</p>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <BarChart3 className="w-6 h-6 mx-auto text-purple-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Analytics</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Data insights</p>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <Smartphone className="w-6 h-6 mx-auto text-orange-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Mobile First</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Works anywhere</p>
                </div>
              </div>
            </Card>

            {/* Key Benefits */}
            <Card className="p-6 glassmorphism dark:glassmorphism-dark">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Benefits</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">Reduce stockouts with predictive analytics</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">Save time with intelligent search and shortcuts</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">Control access with role-based permissions</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">Access from any device with responsive design</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            {features.map((feature) => (
              <Card 
                key={feature.id} 
                className="p-4 glassmorphism dark:glassmorphism-dark hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedTopic(feature.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <feature.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="getting-started" className="space-y-6">
            <Card className="p-6 glassmorphism dark:glassmorphism-dark">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Start Guide</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Follow these steps to get up and running with your inventory management system:
              </p>
              
              <div className="space-y-6">
                {getStartedSteps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <step.icon className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">{step.description}</p>
                      <div className="space-y-2">
                        {step.steps.map((substep, subIndex) => (
                          <div key={subIndex} className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{substep}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Need Help Section */}
            <Card className="p-6 glassmorphism dark:glassmorphism-dark">
              <div className="flex items-center space-x-3 mb-4">
                <HelpCircle className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Need More Help?</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Explore the Features tab above to learn about specific functionality, or start using the app and discover features as you go!
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => setLocation("/")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Start Using the App
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    const tabsList = document.querySelector('[role="tablist"]');
                    const featuresTab = tabsList?.querySelector('[value="features"]') as HTMLElement;
                    featuresTab?.click();
                  }}
                >
                  Explore All Features
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}