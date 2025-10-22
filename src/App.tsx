import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar.tsx";
import { Navbar } from "@/components/Navbar";
import { AdminAuthProvider } from "@/context/AdminAuthContext";

// Pages
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import CourseManager from "./pages/courses/CourseManager";
import CourseEditor from "./pages/courses/CourseEditor";
import Payments from "./pages/Payments";
import Announcements from "./pages/Announcements";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";

// 🛡️ Protected Route
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";

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
      <AdminAuthProvider>
        <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <AdminProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <AdminProtectedRoute>
                <AppLayout>
                  <Users />
                </AppLayout>
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <AdminProtectedRoute>
                <AppLayout>
                  <CourseManager />
                </AppLayout>
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/courses/:id"
            element={
              <AdminProtectedRoute>
                <AppLayout>
                  <CourseEditor />
                </AppLayout>
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <AdminProtectedRoute>
                <AppLayout>
                  <Payments />
                </AppLayout>
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/announcements"
            element={
              <AdminProtectedRoute>
                <AppLayout>
                  <Announcements />
                </AppLayout>
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <AdminProtectedRoute>
                <AppLayout>
                  <Settings />
                </AppLayout>
              </AdminProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
