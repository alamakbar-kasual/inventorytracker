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
      description: "Complete raw material tracking with advanced inventory controls and COGS integration",
      details: {
        overview: "The inventory system is the foundation of your manufacturing operation, providing comprehensive material tracking, stock monitoring, and cost management. It supports complex material relationships, multi-SKU management, and integrates with production tracking for accurate cost analysis.",
        keyFeatures: [
          "Complete material lifecycle management from purchase to consumption",
          "Multi-SKU support for materials with variants, sizes, or colors",
          "Advanced categorization with 10 predefined categories (Fabrics, Buttons, Threads, etc.)",
          "Intelligent stock alerts with customizable minimum levels",
          "Purchase tracking with supplier information and date management",
          "Fabric-specific measurements including total yards and usage tracking",
          "Material consumption logging for accurate COGS calculation",
          "Batch and lot tracking for quality control",
          "Integration with production planning and forecasting",
          "Comprehensive audit trail for all material transactions"
        ],
        howToUse: [
          "Adding Materials: Click '+' → Fill material details → Set category and units → Add supplier info → Save",
          "SKU Management: Edit material → Add SKUs tab → Create variants with unique codes",
          "Stock Monitoring: Set minimum levels → Enable notifications → Monitor dashboard alerts",
          "Recording Usage: Click 'Use Material' → Select product/purpose → Enter quantity → Confirm consumption",
          "Updating Inventory: Edit quantities after purchases → Update supplier information → Adjust stock levels",
          "Category Management: Use predefined categories → Filter materials by type → Organize workflow"
        ],
        tips: [
          "Establish consistent naming conventions for materials (Brand-Color-Type-Size)",
          "Set minimum stock levels at 2-3 weeks of average consumption",
          "Use supplier tracking to streamline reordering processes",
          "Record consumption immediately after production to maintain accuracy",
          "Regular inventory audits help identify discrepancies early",
          "Take advantage of bulk operations for efficiency"
        ],
        advanced: [
          "Material relationships and dependencies mapping",
          "Custom field creation for specialized tracking needs",
          "Integration with external inventory management systems",
          "Automated reorder point calculations based on usage patterns",
          "Quality control integration with supplier performance metrics"
        ]
      }
    },
    {
      id: "search",
      title: "Enhanced Search System",
      icon: Search,
      description: "AI-powered search with intelligent autocomplete, fuzzy matching, and advanced filtering",
      details: {
        overview: "The enhanced search system uses advanced algorithms to help you find materials instantly, even with partial information or misspellings. It learns from your usage patterns and provides intelligent suggestions to improve workflow efficiency.",
        keyFeatures: [
          "Fuzzy search algorithm with 80% accuracy on misspelled terms",
          "Real-time autocomplete with material names, SKUs, categories, and suppliers",
          "Search analytics and usage pattern learning",
          "Universal keyboard shortcuts (Cmd+K, Ctrl+K, /) for instant access",
          "Visual search results with highlighted matching terms",
          "Advanced filtering with category counts and quick filters",
          "Recent search history with frequency tracking",
          "Search results statistics and performance metrics",
          "Multi-field search across all material properties",
          "Export search results to CSV or PDF"
        ],
        howToUse: [
          "Quick Search: Press Cmd+K or '/' → Type material name → Press Enter",
          "Advanced Search: Use search box → Apply category filters → Review results summary",
          "Navigation: Use arrow keys in suggestions → Tab to accept → Esc to clear",
          "History Access: Click recent searches → Review popular terms → Clear history if needed",
          "Filtering: Combine search terms → Apply category filters → Use quick filter buttons",
          "Export Results: Search materials → Click export → Choose format → Download file"
        ],
        tips: [
          "Search works with partial words - 'cot' finds 'Cotton Canvas'",
          "Use category prefixes like 'fabric:' for targeted searches",
          "Recent searches sync across devices and sessions",
          "Combine multiple search terms for more precise results",
          "Use wildcards (*) for complex pattern matching",
          "Search analytics help identify most-used materials"
        ],
        advanced: [
          "Custom search operators and boolean logic",
          "Saved search queries for repeated operations",
          "Search API integration for external systems",
          "Machine learning improvements based on usage patterns"
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
      description: "Advanced machine learning for inventory forecasting, demand planning, and cost optimization",
      details: {
        overview: "The AI prediction system combines statistical analysis with machine learning to provide intelligent inventory insights. It analyzes consumption patterns, seasonal trends, and production data to forecast inventory needs and optimize purchasing decisions with high accuracy.",
        keyFeatures: [
          "Predictive analytics with 85%+ accuracy for stock depletion forecasting",
          "Multi-dimensional trend analysis (usage, seasonal, cyclical patterns)",
          "Intelligent reorder optimization with quantity and timing recommendations",
          "Risk assessment with 4-tier criticality system (Low/Medium/High/Critical)",
          "Confidence scoring based on data quality and historical accuracy",
          "Consumption pattern analysis with volatility measurements",
          "Seasonal and cyclical demand identification",
          "Cost-based purchasing optimization",
          "Lead time integration for supplier-specific recommendations",
          "What-if scenario modeling for demand changes"
        ],
        howToUse: [
          "Dashboard Overview: Check prediction widget on main page → Review critical alerts",
          "Full Analysis: Go to Predictions page → Explore Overview/Risks/Reorders tabs",
          "Risk Management: Monitor Top Risks → Act on critical materials → Set up alerts",
          "Purchase Planning: Review reorder suggestions → Check recommended quantities → Plan orders",
          "Accuracy Tracking: Monitor confidence scores → Review prediction vs actual → Improve data quality",
          "Advanced Analytics: Use usage patterns → Analyze seasonal trends → Plan for demand changes"
        ],
        tips: [
          "Minimum 30 days of consumption data needed for basic predictions",
          "90+ days of data provides seasonal trend analysis",
          "Act on critical alerts within 24-48 hours to avoid stockouts",
          "Use reorder suggestions as starting points, adjust for business needs",
          "Track prediction accuracy and provide feedback for improvements",
          "Consider lead times when planning orders based on predictions"
        ],
        advanced: [
          "Custom prediction models for specific material types",
          "Integration with external demand forecasting systems",
          "Machine learning model training with business-specific data",
          "API access for automated purchasing system integration"
        ]
      }
    },
    {
      id: "analytics",
      title: "Comprehensive Analytics Dashboard",
      icon: BarChart3,
      description: "Advanced business intelligence with interactive charts, KPIs, and executive reporting",
      details: {
        overview: "The analytics system provides comprehensive business intelligence for inventory management, combining real-time data visualization with historical analysis. It includes KPI tracking, trend analysis, cost optimization insights, and executive-level reporting for data-driven decision making.",
        keyFeatures: [
          "Interactive dashboard with 15+ chart types and visualizations",
          "Real-time KPI monitoring (stock levels, usage rates, costs)",
          "Advanced time-series analysis with multiple period comparisons",
          "Category and supplier performance analytics",
          "Cost analysis including COGS tracking and variance analysis",
          "Inventory turnover and efficiency metrics",
          "Customizable alerts and notification system",
          "Executive summary reports with key insights",
          "Drill-down capabilities from summary to transaction level",
          "Export functionality (PDF, Excel, CSV) with scheduled reports",
          "Predictive charts showing forecasted trends",
          "Mobile-optimized charts and responsive design"
        ],
        howToUse: [
          "Dashboard Navigation: Analytics tab → Choose overview/charts/reports → Filter by period",
          "Chart Interaction: Click chart elements → Drill down to details → Compare periods",
          "Custom Reports: Select metrics → Set date ranges → Apply filters → Generate report",
          "Alert Setup: Go to settings → Configure thresholds → Enable notifications",
          "Data Export: Choose report type → Select format → Download or email",
          "Mobile Analytics: Access on mobile → Swipe through charts → Tap for details"
        ],
        tips: [
          "Review analytics weekly for operational insights",
          "Set up automated alerts for critical metrics",
          "Use period comparisons to identify trends and seasonality",
          "Export reports before important meetings or reviews",
          "Focus on inventory turnover ratios for efficiency optimization",
          "Use predictive charts to plan purchasing and production"
        ],
        advanced: [
          "Custom KPI creation and tracking",
          "Advanced statistical analysis and correlation studies",
          "Integration with business intelligence platforms",
          "Real-time dashboard widgets for executive monitoring"
        ]
      }
    },
    {
      id: "users",
      title: "Enterprise User Management",
      icon: Users,
      description: "Advanced role-based access control with audit trails and team collaboration features",
      details: {
        overview: "The user management system provides enterprise-grade security and collaboration features. It includes sophisticated role-based permissions, comprehensive audit logging, team collaboration tools, and integration capabilities for existing authentication systems.",
        keyFeatures: [
          "Four-tier role system: Super Admin, Manager, Employee, Viewer with granular permissions",
          "Custom permission sets for specific business needs",
          "Comprehensive user profile management with photo and contact info",
          "Advanced password policies with 2FA support",
          "Session management with timeout and concurrent session controls",
          "Detailed activity logging and audit trails",
          "Bulk user operations (import, export, mass updates)",
          "Team collaboration features with shared workspaces",
          "User onboarding workflows with training checklists",
          "Integration with external authentication systems (LDAP, SSO)"
        ],
        howToUse: [
          "User Creation: Settings → User Management → Add User → Assign role → Send invitation",
          "Permission Management: Edit user → Permissions tab → Customize access → Save changes",
          "Role Assignment: Select users → Bulk actions → Change role → Confirm",
          "Activity Monitoring: User list → Activity logs → Filter by date/user → Export reports",
          "Team Setup: Create departments → Assign managers → Set permissions → Enable collaboration",
          "Security Settings: Configure password policy → Enable 2FA → Set session timeouts"
        ],
        tips: [
          "Start with standard roles, customize permissions as needed",
          "Regular permission audits help maintain security",
          "Use department-based role assignment for large teams",
          "Enable activity logging for compliance requirements",
          "Train users on their specific role capabilities",
          "Set up automated user provisioning for efficiency"
        ],
        advanced: [
          "Single Sign-On (SSO) integration with corporate systems",
          "API-based user provisioning and management",
          "Advanced audit reporting and compliance features",
          "Custom role creation with specific permission combinations"
        ]
      }
    },
    {
      id: "settings",
      title: "Advanced System Configuration",
      icon: Settings,
      description: "Complete system customization with business rules, integrations, and enterprise features",
      details: {
        overview: "The settings system provides comprehensive customization capabilities for enterprise deployments. It includes business rule configuration, system integration options, advanced notification management, and complete data control features.",
        keyFeatures: [
          "Six-tab settings organization: Profile, Notifications, Inventory, Display, Data, Security",
          "Company profile with branding and business information",
          "Advanced notification system with custom rules and channels",
          "Inventory configuration including units, currencies, categories",
          "Display customization with themes, languages, and layouts",
          "Comprehensive data management with backup and export options",
          "Enterprise security controls and privacy settings",
          "API configuration and integration management",
          "Custom field creation for specialized business needs",
          "Workflow automation and business rule engine"
        ],
        howToUse: [
          "Profile Setup: Settings → Profile → Enter company info → Upload logo → Save",
          "Notifications: Notifications tab → Configure alerts → Set thresholds → Enable channels",
          "Inventory Config: Inventory tab → Set defaults → Configure categories → Define units",
          "Display Options: Display tab → Choose theme → Set language → Adjust layout",
          "Data Management: Data tab → Configure backups → Set retention → Export data",
          "Security: Security tab → Password policy → Session settings → Privacy controls"
        ],
        tips: [
          "Complete profile setup for better team collaboration",
          "Configure notifications based on role responsibilities",
          "Set inventory defaults to speed up data entry",
          "Use dark theme for extended computer use",
          "Regular data exports provide backup security",
          "Review security settings quarterly for compliance"
        ],
        advanced: [
          "Custom business rules and workflow automation",
          "Advanced integration with ERP and accounting systems",
          "White-label customization for partner deployments",
          "Advanced security features including encryption and compliance"
        ]
      }
    },
    // Additional comprehensive features
    {
      id: "cogs",
      title: "Cost of Goods Sold (COGS) Tracking",
      icon: TrendingUp,
      description: "Advanced cost accounting with material consumption tracking and profitability analysis",
      details: {
        overview: "The COGS system provides sophisticated cost accounting for manufacturing operations. It tracks material consumption against specific products, calculates true production costs, and provides profitability analysis with detailed reporting.",
        keyFeatures: [
          "Real-time material consumption tracking by product and batch",
          "Automated COGS calculation with labor and overhead allocation",
          "Product profitability analysis with margin reporting",
          "Batch and lot cost tracking for quality control",
          "Standard vs actual cost variance analysis",
          "Integration with accounting systems for financial reporting",
          "Multi-currency support for international operations",
          "Historical cost trending and inflation impact analysis"
        ],
        howToUse: [
          "Record Consumption: Select material → Click 'Use' → Choose product → Enter quantity → Confirm",
          "View Costs: Analytics → COGS tab → Select product → Review cost breakdown",
          "Profitability: Reports → Product analysis → Compare margins → Export data",
          "Cost Analysis: Materials → Cost tab → Track price changes → Analyze trends"
        ],
        tips: [
          "Record consumption immediately after production",
          "Regular cost reviews help identify optimization opportunities",
          "Use batch tracking for quality control and cost accuracy",
          "Monitor cost trends to adjust pricing strategies"
        ]
      }
    },
    {
      id: "mobile",
      title: "Mobile-First Design",
      icon: Smartphone,
      description: "Complete mobile functionality with offline capabilities and touch-optimized interface",
      details: {
        overview: "The mobile system is designed for manufacturing floor use with offline capabilities, touch-optimized interface, and full feature parity with desktop. It includes barcode scanning, voice input, and field-specific optimizations.",
        keyFeatures: [
          "Full feature parity between mobile and desktop versions",
          "Offline functionality with automatic sync when connected",
          "Touch-optimized interface with large buttons and gestures",
          "Barcode scanning for quick material identification",
          "Voice input for hands-free data entry",
          "GPS location tracking for multi-site operations",
          "Mobile-specific shortcuts and quick actions",
          "Battery optimization for extended field use"
        ],
        howToUse: [
          "Install: Add to home screen for app-like experience",
          "Offline: Work without internet, sync when connected",
          "Scanning: Use camera to scan barcodes and QR codes",
          "Voice: Tap microphone icon for voice input",
          "Gestures: Swipe, pinch, and tap for navigation"
        ],
        tips: [
          "Add to home screen for faster access",
          "Enable offline mode for factory floor use",
          "Use voice input for quick data entry",
          "Take advantage of touch gestures for efficiency"
        ]
      }
    },
    {
      id: "integration",
      title: "System Integrations",
      icon: Zap,
      description: "API connections with accounting, ERP, and supply chain management systems",
      details: {
        overview: "The integration system connects with existing business systems through APIs, webhooks, and file imports. It supports popular accounting, ERP, and supply chain platforms with real-time data synchronization.",
        keyFeatures: [
          "RESTful API for custom integrations",
          "Pre-built connectors for QuickBooks, Xero, SAP",
          "Webhook support for real-time data synchronization",
          "File import/export in multiple formats (CSV, Excel, JSON)",
          "OAuth 2.0 authentication for secure connections",
          "Rate limiting and error handling for reliable integration",
          "Data mapping tools for field customization",
          "Integration monitoring and logging"
        ],
        howToUse: [
          "API Setup: Settings → Integrations → Generate API key → Configure endpoints",
          "Accounting: Connect to QuickBooks → Map accounts → Enable sync",
          "ERP Integration: Choose system → Enter credentials → Test connection",
          "Data Import: Upload file → Map fields → Preview → Import"
        ],
        tips: [
          "Start with accounting integration for cost tracking",
          "Test integrations with small data sets first",
          "Monitor integration logs for issues",
          "Use webhooks for real-time updates"
        ]
      }
    }
  ];

  const getStartedSteps = [
    {
      title: "Add Your First Material",
      description: "Start by adding a material to your inventory",
      icon: Package,
      steps: ["Tap the '+' button", "Fill in material details (name, category, quantity)", "Set minimum stock level for alerts", "Add supplier information", "Save the material"]
    },
    {
      title: "Record Material Usage",
      description: "Track consumption for accurate COGS and predictions",
      icon: Target,
      steps: ["Find material in inventory", "Tap 'Use Material' button", "Enter quantity used and select product", "Confirm consumption record", "View updated stock levels"]
    },
    {
      title: "Explore AI Predictions",
      description: "Get intelligent insights about your inventory needs",
      icon: Brain,
      steps: ["Check predictions widget on main page", "Visit dedicated Predictions page", "Review reorder suggestions and timing", "Set up alerts for critical materials", "Act on high-risk alerts"]
    },
    {
      title: "Set Up Your Team",
      description: "Configure users and permissions for your organization",
      icon: Users,
      steps: ["Go to User Management", "Add team members with appropriate roles", "Configure permissions and access levels", "Set up notification preferences", "Train team on their specific functions"]
    },
    {
      title: "Customize Your Experience",
      description: "Configure the app to match your workflow",
      icon: Settings,
      steps: ["Go to Settings", "Set up company profile and branding", "Configure notifications and alerts", "Set display preferences and theme", "Configure default units and categories"]
    },
    {
      title: "Analyze Your Data",
      description: "Use analytics to optimize your operations",
      icon: BarChart3,
      steps: ["Visit Analytics dashboard", "Review inventory trends and usage patterns", "Set up automated reports", "Export data for external analysis", "Use insights for purchasing decisions"]
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
                This is a comprehensive inventory management system designed specifically for fashion manufacturing and small to medium enterprises. 
                It combines advanced inventory tracking, AI-powered predictions, cost accounting (COGS), and business intelligence to optimize your material management and purchasing decisions.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  🎯 Built for Manufacturing Excellence
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  Designed by manufacturers for manufacturers, this system understands the unique challenges of material planning, 
                  cost control, and production efficiency in fashion and textile operations.
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Package className="w-6 h-6 mx-auto text-blue-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Smart Inventory</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Multi-SKU tracking</p>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Brain className="w-6 h-6 mx-auto text-green-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">AI Predictions</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">85%+ accuracy</p>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <BarChart3 className="w-6 h-6 mx-auto text-purple-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Business Intel</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">15+ chart types</p>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 mx-auto text-orange-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">COGS Tracking</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Cost accuracy</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <Search className="w-6 h-6 mx-auto text-yellow-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Smart Search</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Fuzzy matching</p>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <Users className="w-6 h-6 mx-auto text-red-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Team Management</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Role-based access</p>
                </div>
                <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <Smartphone className="w-6 h-6 mx-auto text-indigo-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Mobile First</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Offline capable</p>
                </div>
                <div className="text-center p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                  <Zap className="w-6 h-6 mx-auto text-cyan-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Integrations</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">API & webhooks</p>
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