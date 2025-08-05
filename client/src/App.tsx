
import { Switch, Route, Router } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "./hooks/useAuth";
import { useSocket } from "./hooks/useSocket";

// Pages
import WelcomePage from "./pages/welcome";
import HomePage from "./pages/home";
import ChatPage from "./pages/chat";
import RoomChatPage from "./pages/room-chat";
import RoomsPage from "./pages/rooms";
import FeedPage from "./pages/feed";
import SettingsPage from "./pages/settings";
import NotFoundPage from "./pages/not-found";

function AppContent() {
  const { user, isLoading } = useAuth();
  useSocket(user?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <WelcomePage />;
  }

  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/chat/:friendId" component={ChatPage} />
      <Route path="/rooms" component={RoomsPage} />
      <Route path="/room/:roomId" component={RoomChatPage} />
      <Route path="/feed" component={FeedPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
