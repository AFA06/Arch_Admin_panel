import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Users,
  Video,
  MessageSquare,
  CreditCard,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const collapsed = state === "collapsed";

  const [videoMenuOpen, setVideoMenuOpen] = useState(true);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const getNavClasses = (path: string) => {
    const active = isActive(path);
    return `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
      active
        ? "bg-primary text-primary-foreground shadow-glow"
        : "text-muted-foreground hover:text-foreground hover:bg-accent"
    }`;
  };

  const handleLogout = () => {
    localStorage.removeItem("admin-token");
    navigate("/login");
  };

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-gradient-dark border-r border-border">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Video className="w-4 h-4 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-bold text-lg text-foreground">VideoAdmin</h2>
                <p className="text-xs text-muted-foreground">Premium Platform</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup className="px-4 py-6">
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">

              {/* Dashboard */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/" className={getNavClasses("/")}>
                    <BarChart3 className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="font-medium">Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Users */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/users" className={getNavClasses("/users")}>
                    <Users className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="font-medium">Users</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Videos with submenu */}
              <SidebarMenuItem>
                <button
                  onClick={() => setVideoMenuOpen(!videoMenuOpen)}
                  className={getNavClasses("/videos")}
                >
                  <Video className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="font-medium">Videos</span>
                      <span className="ml-auto">
                        {videoMenuOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </span>
                    </>
                  )}
                </button>
                {videoMenuOpen && !collapsed && (
                  <div className="ml-8 mt-2 space-y-1">
                    <NavLink
                      to="/videos"
                      className={({ isActive }) =>
                        `block text-sm px-2 py-1 rounded-md ${
                          isActive
                            ? "text-primary font-medium bg-muted"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`
                      }
                    >
                      All Videos
                    </NavLink>
                    <NavLink
                      to="/videos/categories"
                      className={({ isActive }) =>
                        `block text-sm px-2 py-1 rounded-md ${
                          isActive
                            ? "text-primary font-medium bg-muted"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`
                      }
                    >
                      Categories
                    </NavLink>
                  </div>
                )}
              </SidebarMenuItem>

              {/* Reviews */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/reviews" className={getNavClasses("/reviews")}>
                    <MessageSquare className="w-5 h-5" />
                    {!collapsed && <span className="font-medium">Reviews</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Payments */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/payments" className={getNavClasses("/payments")}>
                    <CreditCard className="w-5 h-5" />
                    {!collapsed && <span className="font-medium">Payments</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Announcements */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/announcements" className={getNavClasses("/announcements")}>
                    <Bell className="w-5 h-5" />
                    {!collapsed && <span className="font-medium">Announcements</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Settings */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/settings" className={getNavClasses("/settings")}>
                    <Settings className="w-5 h-5" />
                    {!collapsed && <span className="font-medium">Settings</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout */}
        <div className="mt-auto p-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
