import { useEffect, useState, useCallback } from "react";
import { Search, CreditCard, CheckCircle, DollarSign, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { paymentAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type Payment = {
  _id: string;
  userName: string;
  email: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  date: string;
  courseSlug: string;
};

type PaymentStats = {
  summary: {
    totalRevenue: number;
    totalPayments: number;
    completedPayments: number;
    uniqueUsers: number;
    revenueChange: string;
    trend: 'up' | 'down';
  };
  topCourses: Array<{
    slug: string;
    title: string;
    sales: number;
    revenue: number;
  }>;
};

type AvailableMonth = {
  year: number;
  month: number;
  monthName: string;
  displayName: string;
  count: number;
};

type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  totalPayments: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
};

export default function Payments() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [availableMonths, setAvailableMonths] = useState<AvailableMonth[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number | undefined> = {
        page: currentPage,
        limit: 10,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchTerm || undefined,
      };

      const res = await paymentAPI.getAllPayments(params);
      setPayments(res.data.payments);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error("Error fetching payments:", err);
      toast({
        title: "Error",
        description: "Failed to fetch payments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm, toast]);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const params: Record<string, string | undefined> = {};
      if (selectedMonth !== "all") {
        const [month, year] = selectedMonth.split('-');
        params.month = month;
        params.year = year;
      }

      const res = await paymentAPI.getPaymentStats(params);
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
      toast({
        title: "Error",
        description: "Failed to fetch payment statistics",
        variant: "destructive",
      });
    } finally {
      setStatsLoading(false);
    }
  }, [selectedMonth, toast]);

  const fetchAvailableMonths = async () => {
    try {
      const res = await paymentAPI.getAvailableMonths();
      setAvailableMonths(res.data);
    } catch (err) {
      console.error("Error fetching months:", err);
    }
  };

  useEffect(() => {
    fetchAvailableMonths();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchPayments();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, fetchPayments]);

  // Frontend fallback filter for month
  useEffect(() => {
    let temp = [...payments];

    if (selectedMonth !== "all") {
      const [month, year] = selectedMonth.split("-");
      temp = temp.filter(p => {
        const date = new Date(p.date);
        return date.getMonth() + 1 === parseInt(month) && date.getFullYear() === parseInt(year);
      });
    }

    setFilteredPayments(temp);
  }, [payments, selectedMonth]);

  const getStatusIcon = (status: string) => status === "completed" ? <CheckCircle className="w-4 h-4 text-success" /> : null;
  const getStatusBadge = (status: string) => status === "completed"
    ? <Badge className="bg-success text-success-foreground">Completed</Badge>
    : <Badge variant="secondary">{status}</Badge>;

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
    setCurrentPage(1); 
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payment Management</h1>
        <p className="text-muted-foreground">Track and manage all manually confirmed payments.</p>
      </div>

      {/* Stats and Top Courses Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-foreground">{statsLoading ? "..." : `${(stats?.summary.totalRevenue || 0).toLocaleString()} UZS`}</p>
                {stats && (
                  <div className="flex items-center mt-1">
                    {stats.summary.trend === 'up'
                      ? <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      : <TrendingDown className="w-4 h-4 text-red-500 mr-1" />}
                    <span className={`text-xs ${stats.summary.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                      {stats.summary.revenueChange} from last period
                    </span>
                  </div>
                )}
              </div>
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Transactions */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                <p className="text-3xl font-bold text-foreground">{statsLoading ? "..." : (stats?.summary.totalPayments || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-foreground">{statsLoading ? "..." : (stats?.summary.completedPayments || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unique Users */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique Users</p>
                <p className="text-3xl font-bold text-foreground">{statsLoading ? "..." : (stats?.summary.uniqueUsers || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by name, email, or course..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>

              <Select value={selectedMonth} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  {availableMonths.map((month) => (
                    <SelectItem key={`${month.month}-${month.year}`} value={`${month.month}-${month.year}`}>
                      {month.displayName} ({month.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pagination Info */}
            {pagination && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>
                  Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{" "}
                  {Math.min(pagination.currentPage * pagination.limit, pagination.totalPayments)} of{" "}
                  {pagination.totalPayments} payments
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={!pagination.hasPrevPage}>Previous</Button>
                  <span className="px-3 py-1 bg-muted rounded">{pagination.currentPage} of {pagination.totalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={!pagination.hasNextPage}>Next</Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Transactions {loading ? "(Loading...)" : `(${filteredPayments.length})`}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading payments...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar>
                          <AvatarFallback>{payment.userName[0]}</AvatarFallback>
                        </Avatar>
                        <span>{payment.userName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{payment.email}</TableCell>
                    <TableCell>{payment.courseSlug}</TableCell>
                    <TableCell>{payment.amount.toLocaleString()} {payment.currency}</TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
