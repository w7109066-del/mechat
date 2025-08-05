import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Welcome from "@/pages/welcome";
import Home from "@/pages/home";
import Chat from "@/pages/chat";
import Rooms from "@/pages/rooms";
import RoomChat from "@/pages/room-chat";
import Settings from "@/pages/settings";
import Feed from "@/pages/feed";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Welcome} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/chat/:friendId" component={Chat} />
          <Route path="/rooms" component={Rooms} />
          <Route path="/room-chat" component={RoomChat} />
          <Route path="/feed" component={Feed} />
          <Route path="/settings" component={Settings} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-100">
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
