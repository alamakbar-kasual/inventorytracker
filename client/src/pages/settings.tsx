import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Package, 
  Palette, 
  Download, 
  Shield,
  Zap,
  ArrowLeft,
  Save,
  Moon,
  Sun,
  Mail,
  Phone,
  Building,
  Globe,
  DollarSign,
  Calendar,
  Trash2,
  Plus,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ui/theme-provider";
import { BottomNav } from "@/components/bottom-nav";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [location, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  // Profile Settings
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    company: "Fashion Co.",
    phone: "+1 (555) 123-4567",
    bio: "Managing inventory for sustainable fashion production."
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    lowStockAlerts: true,
    weeklyReports: true,
    criticalAlerts: true,
    dailyDigest: false
  });

  // Inventory Settings
  const [inventorySettings, setInventorySettings] = useState({
    defaultUnit: "yards",
    currency: "USD",
    autoReorder: false,
    reorderThreshold: 20,
    categories: ["Fabric", "Notions", "Trims", "Hardware"]
  });

  // Display Settings
  const [displaySettings, setDisplaySettings] = useState({
    language: "en",
    dateFormat: "MM/DD/YYYY",
    timezone: "America/New_York",
    compactView: false
  });

  // New category input
  const [newCategory, setNewCategory] = useState("");

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notifications Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleSaveInventory = () => {
    toast({
      title: "Inventory Settings Updated", 
      description: "Your inventory preferences have been saved.",
    });
  };

  const handleSaveDisplay = () => {
    toast({
      title: "Display Settings Updated",
      description: "Your display preferences have been saved.",
    });
  };

  const addCategory = () => {
    if (newCategory.trim() && !inventorySettings.categories.includes(newCategory.trim())) {
      setInventorySettings(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()]
      }));
      setNewCategory("");
    }
  };

  const removeCategory = (category: string) => {
    setInventorySettings(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category)
    }));
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your data export will be available for download shortly.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="glassmorphism dark:glassmorphism-dark sticky top-0 z-50 px-4 py-3 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setLocation("/")}
              className="p-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors border-none"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <SettingsIcon className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Manage your preferences</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors border-none"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="px-4 pb-20">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="display" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Display</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6 mt-6">
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={profile.company}
                      onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                  />
                </div>
                <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailNotifications: checked }))}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Low Stock Alerts</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when materials run low</p>
                    </div>
                    <Switch
                      checked={notifications.lowStockAlerts}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, lowStockAlerts: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Critical Alerts</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Urgent notifications for critical stock levels</p>
                    </div>
                    <Switch
                      checked={notifications.criticalAlerts}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, criticalAlerts: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Weekly Reports</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Summary of inventory activity</p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyReports: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Daily Digest</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Daily summary of key metrics</p>
                    </div>
                    <Switch
                      checked={notifications.dailyDigest}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, dailyDigest: checked }))}
                    />
                  </div>
                </div>
                
                <Button onClick={handleSaveNotifications} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Settings */}
          <TabsContent value="inventory" className="space-y-6 mt-6">
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Inventory Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Default Unit</Label>
                    <Select 
                      value={inventorySettings.defaultUnit} 
                      onValueChange={(value) => setInventorySettings(prev => ({ ...prev, defaultUnit: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yards">Yards</SelectItem>
                        <SelectItem value="meters">Meters</SelectItem>
                        <SelectItem value="pieces">Pieces</SelectItem>
                        <SelectItem value="kg">Kilograms</SelectItem>
                        <SelectItem value="lbs">Pounds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select 
                      value={inventorySettings.currency} 
                      onValueChange={(value) => setInventorySettings(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-Reorder</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Automatically suggest reorders when stock is low</p>
                    </div>
                    <Switch
                      checked={inventorySettings.autoReorder}
                      onCheckedChange={(checked) => setInventorySettings(prev => ({ ...prev, autoReorder: checked }))}
                    />
                  </div>
                  
                  {inventorySettings.autoReorder && (
                    <div className="space-y-2">
                      <Label>Reorder Threshold (%)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={inventorySettings.reorderThreshold}
                        onChange={(e) => setInventorySettings(prev => ({ ...prev, reorderThreshold: parseInt(e.target.value) }))}
                      />
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <Label>Material Categories</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {inventorySettings.categories.map((category) => (
                      <Badge key={category} variant="secondary" className="flex items-center gap-1">
                        {category}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                          onClick={() => removeCategory(category)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add new category..."
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                    />
                    <Button onClick={addCategory} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <Button onClick={handleSaveInventory} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Inventory Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Display Settings */}
          <TabsContent value="display" className="space-y-6 mt-6">
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Display Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select 
                      value={displaySettings.language} 
                      onValueChange={(value) => setDisplaySettings(prev => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select 
                      value={displaySettings.dateFormat} 
                      onValueChange={(value) => setDisplaySettings(prev => ({ ...prev, dateFormat: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select 
                      value={displaySettings.timezone} 
                      onValueChange={(value) => setDisplaySettings(prev => ({ ...prev, timezone: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Compact View</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Show more items per screen</p>
                  </div>
                  <Switch
                    checked={displaySettings.compactView}
                    onCheckedChange={(checked) => setDisplaySettings(prev => ({ ...prev, compactView: checked }))}
                  />
                </div>
                
                <Button onClick={handleSaveDisplay} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Display Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data & Export Settings */}
          <TabsContent value="data" className="space-y-6 mt-6">
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Export Data</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Export your inventory data for backup or analysis
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button onClick={handleExportData} variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Export as CSV
                      </Button>
                      <Button onClick={handleExportData} variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Export as PDF Report
                      </Button>
                      <Button onClick={handleExportData} variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Export as JSON
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-semibold mb-2">Data Backup</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Automatic backups are created daily and stored securely
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Last backup:</span>
                        <Badge variant="secondary">Today, 2:00 AM</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Backup frequency:</span>
                        <Badge variant="default">Daily</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6 mt-6">
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Password</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Change your account password
                    </p>
                    <Button variant="outline">
                      <Shield className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-semibold mb-2">Active Sessions</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Manage your active login sessions
                    </p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Current Session</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Chrome on Windows • Active now</p>
                        </div>
                        <Badge variant="default">Current</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Mobile App</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">iPhone • Last active 2 hours ago</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-semibold mb-2">Data Privacy</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Control how your data is used and shared
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Analytics Data</Label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Help improve the app with usage analytics</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Marketing Communications</Label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Receive product updates and tips</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav activeTab="settings" onTabChange={(tab) => {
        if (tab === "home") setLocation("/");
        if (tab === "analytics") setLocation("/analytics");
      }} />
    </div>
  );
}