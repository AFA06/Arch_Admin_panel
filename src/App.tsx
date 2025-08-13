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
import Videos from "./pages/videos/Videos";
import VideoCategoryManager from "./pages/videos/VideoCategoryManager";
import CategoryVideos from "./pages/videos/CategoryVideos"; // ✅ NEW
import Reviews from "./pages/Reviews";
import Payments from "./pages/Payments";
import Announcements from "./pages/Announcements";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";

// 🛡️ Protected Route
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  </SidebarProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
     <BrowserRouter basename="/Arch_Admin_panel">

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Users />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Videos routes */}
          <Route
            path="/videos"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Videos />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/videos/categories"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <VideoCategoryManager />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          {/* Dynamic category videos */}
          <Route
            path="/videos/:slug"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CategoryVideos />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reviews"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Reviews />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Payments />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/announcements"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Announcements />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Settings />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
