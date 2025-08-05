import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Users, MessageCircle, FileText, Settings } from "lucide-react";

interface TabBarProps {
  activeTab: string;
}

export default function TabBar({ activeTab }: TabBarProps) {
  const [, setLocation] = useLocation();

  const tabs = [
    { id: "home", label: "Home", icon: Home, path: "/" },
    { id: "room", label: "Room", icon: Users, path: "/rooms" },
    { id: "dm", label: "DM", icon: MessageCircle, path: "/" },
    { id: "feed", label: "Feed", icon: FileText, path: "/feed" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ];

  const handleTabClick = (tab: typeof tabs[0]) => {
    if (tab.id === "dm") {
      // For DM, we stay on home to show friends list
      setLocation("/");
    } else if (tab.id === "feed") {
      setLocation("/feed");
    } else {
      setLocation(tab.path);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-sm mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => handleTabClick(tab)}
              className={`flex flex-col items-center py-2 px-3 ${
                isActive 
                  ? "text-[hsl(196,100%,50%)]" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
              data-testid={`tab-${tab.id}`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs">{tab.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
