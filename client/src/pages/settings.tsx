import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  User as UserIcon, 
  Bell, 
  Shield, 
  Moon, 
  Globe, 
  HelpCircle, 
  LogOut,
  ChevronRight
} from "lucide-react";
import TabBar from "@/components/TabBar";
import type { User } from "@shared/schema";

export default function Settings() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[hsl(196,100%,50%)]"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const displayName = user?.username || user?.firstName || user?.email || "User";

  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      {/* Header */}
      <div className="gradient-bg p-4 pt-12">
        <h1 className="text-white text-xl font-semibold text-center" data-testid="text-settings-title">Settings</h1>
      </div>

      {/* Profile Section */}
      <div className="p-4">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16" data-testid="img-profile-avatar">
                <AvatarImage 
                  src={user?.profileImageUrl || undefined} 
                  alt={displayName}
                />
                <AvatarFallback className="bg-[hsl(196,100%,50%)] text-white text-xl font-semibold">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800" data-testid="text-profile-name">{displayName}</h2>
                <p className="text-gray-600" data-testid="text-profile-email">{user?.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-500">Level {user?.level || 1}</span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-500">{user?.country || "Unknown"}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" data-testid="button-edit-profile">
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Settings Options */}
        <div className="space-y-4">
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                <Button 
                  variant="ghost" 
                  className="w-full justify-between p-4 h-auto"
                  data-testid="button-profile-settings"
                >
                  <div className="flex items-center space-x-3">
                    <UserIcon className="w-5 h-5 text-gray-500" />
                    <span>Profile Settings</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Button>
                <Separator />
                <Button 
                  variant="ghost" 
                  className="w-full justify-between p-4 h-auto"
                  data-testid="button-privacy-settings"
                >
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-gray-500" />
                    <span>Privacy & Security</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* App Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">App Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                <Button 
                  variant="ghost" 
                  className="w-full justify-between p-4 h-auto"
                  data-testid="button-notifications"
                >
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <span>Notifications</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Button>
                <Separator />
                <Button 
                  variant="ghost" 
                  className="w-full justify-between p-4 h-auto"
                  data-testid="button-appearance"
                >
                  <div className="flex items-center space-x-3">
                    <Moon className="w-5 h-5 text-gray-500" />
                    <span>Appearance</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Button>
                <Separator />
                <Button 
                  variant="ghost" 
                  className="w-full justify-between p-4 h-auto"
                  data-testid="button-language"
                >
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-gray-500" />
                    <span>Language</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Support</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                <Button 
                  variant="ghost" 
                  className="w-full justify-between p-4 h-auto"
                  data-testid="button-help"
                >
                  <div className="flex items-center space-x-3">
                    <HelpCircle className="w-5 h-5 text-gray-500" />
                    <span>Help & Support</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Logout */}
          <Card>
            <CardContent className="p-0">
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="w-full justify-start p-4 h-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                data-testid="button-logout"
              >
                <div className="flex items-center space-x-3">
                  <LogOut className="w-5 h-5" />
                  <span>Log Out</span>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <TabBar activeTab="settings" />
    </div>
  );
}
