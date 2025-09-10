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

// Mock user registration (can later connect to real data)
const userRegistrationData = [
  { month: "Jan", users: 120 },
  { month: "Feb", users: 180 },
  { month: "Mar", users: 250 },
  { month: "Apr", users: 320 },
  { month: "May", users: 450 },
  { month: "Jun", users: 380 },
];

export default function Dashboard() {
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number }[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [latestMonthRevenue, setLatestMonthRevenue] = useState(0);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get("/payments");
        const payments = res.data || [];

        // Filter only completed payments
        const completed = payments.filter((p: any) => p.status === "completed");

        // Group by month
        const monthly: { [key: string]: number } = {};
        completed.forEach((p: any) => {
          const date = new Date(p.date);
          const month = date.toLocaleString("default", { month: "short" });
          monthly[month] = (monthly[month] || 0) + p.amount;
        });

        // Sort months Jan–Dec
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const chartData = months.map((m) => ({ month: m, revenue: monthly[m] || 0 }));

        setRevenueData(chartData);
        setTotalRevenue(completed.reduce((sum: number, p: any) => sum + p.amount, 0));

        // Get latest month revenue (last non-zero month)
        const lastNonZero = [...chartData].reverse().find((d) => d.revenue > 0);
        setLatestMonthRevenue(lastNonZero ? lastNonZero.revenue : 0);
      } catch (err) {
        console.error("Error fetching payments for dashboard:", err);
      }
    };

    fetchPayments();
  }, []);

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
          value="12,847"
          change="+12% from last month"
          icon={Users}
          trend="up"
        />
        <StatCard
          title="Premium Users"
          value="3,241"
          change="+8% from last month"
          icon={CreditCard}
          trend="up"
        />
        <StatCard
          title="Total Videos"
          value="1,523"
          change="+15 new this week"
          icon={Video}
          trend="up"
        />
        <StatCard
          title="Monthly Revenue"
          value={`${latestMonthRevenue.toLocaleString()} UZS`}
          change="Based on payments"
          icon={latestMonthRevenue > 0 ? TrendingUp : TrendingDown}
          trend={latestMonthRevenue > 0 ? "up" : "down"}
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
