import { useEffect, useState } from "react";
import { Users, Video, CreditCard, TrendingUp, TrendingDown } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalUsers: { value: number; change: string; trend: string };
  premiumUsers: { value: number; change: string; trend: string };
  totalVideos: { value: number; change: string; trend: string };
  monthlyRevenue: { value: number; change: string; trend: string };
}

interface ChartData {
  month: string;
  users?: number;
  revenue?: number;
}

export default function Dashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: { value: 0, change: "", trend: "up" },
    premiumUsers: { value: 0, change: "", trend: "up" },
    totalVideos: { value: 0, change: "", trend: "up" },
    monthlyRevenue: { value: 0, change: "", trend: "up" },
  });
  const [userRegistrationData, setUserRegistrationData] = useState<ChartData[]>([]);
  const [revenueData, setRevenueData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/dashboard/stats");
        
        if (res.data.success) {
          const { stats: statsData, charts } = res.data.data;
          setStats(statsData);
          setUserRegistrationData(charts.userRegistrations);
          setRevenueData(charts.revenue);
        }
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Refresh data every 60 seconds
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, [toast]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your platform.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.value.toLocaleString()}
          change={stats.totalUsers.change}
          icon={Users}
          trend={stats.totalUsers.trend as "up" | "down"}
        />
        <StatCard
          title="Premium Users"
          value={stats.premiumUsers.value.toLocaleString()}
          change={stats.premiumUsers.change}
          icon={CreditCard}
          trend={stats.premiumUsers.trend as "up" | "down"}
        />
        <StatCard
          title="Total Videos"
          value={stats.totalVideos.value.toLocaleString()}
          change={stats.totalVideos.change}
          icon={Video}
          trend={stats.totalVideos.trend as "up" | "down"}
        />
        <StatCard
          title="Monthly Revenue"
          value={`${stats.monthlyRevenue.value.toLocaleString()} UZS`}
          change={stats.monthlyRevenue.change}
          icon={stats.monthlyRevenue.trend === "up" ? TrendingUp : TrendingDown}
          trend={stats.monthlyRevenue.trend as "up" | "down"}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Registration Chart */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="text-foreground">User Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userRegistrationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
