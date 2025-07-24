import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";

// Pages
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Videos from "./pages/Videos";
import Reviews from "./pages/Reviews";
import Payments from "./pages/Payments";
import Announcements from "./pages/Announcements";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  </SidebarProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={
            <AppLayout>
              <Dashboard />
            </AppLayout>
          } />
          <Route path="/users" element={
            <AppLayout>
              <Users />
            </AppLayout>
          } />
          <Route path="/videos" element={
            <AppLayout>
              <Videos />
            </AppLayout>
          } />
          <Route path="/reviews" element={
            <AppLayout>
              <Reviews />
            </AppLayout>
          } />
          <Route path="/payments" element={
            <AppLayout>
              <Payments />
            </AppLayout>
          } />
          <Route path="/announcements" element={
            <AppLayout>
              <Announcements />
            </AppLayout>
          } />
          <Route path="/settings" element={
            <AppLayout>
              <Settings />
            </AppLayout>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
