import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AddUserModal } from "../components/userspage/AddUserModal";

import { api } from "@/lib/api";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Plus, MoreHorizontal } from "lucide-react";
import { useState } from "react";

export default function Users() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("");
  const [status, setStatus] = useState(""); // "active" | "suspended"
  const [plan, setPlan] = useState(""); // "" | "premium" | "free"
  const [showAddUser, setShowAddUser] = useState(false);

  const queryKey = ["admin-users", search, gender, status, plan];

  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (gender) params.append("gender", gender);
      if (status) params.append("status", status);
      if (plan) params.append("plan", plan);
      const res = await api.get(`/users?${params.toString()}`);
      return res.data;
    },
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const togglePremiumMutation = useMutation({
    mutationFn: (id: string) => api.put(`/users/${id}/premium`),
    onSuccess: invalidateAll,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => api.put(`/users/${id}/status`),
    onSuccess: invalidateAll,
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: invalidateAll,
  });

  const addUserMutation = useMutation({
    mutationFn: (data: any) => api.post("/users", data),
    onSuccess: () => {
      invalidateAll();
      setShowAddUser(false);
    },
    onError: (err: any) => {
      alert(err?.response?.data?.error || "Failed to add user");
    }
  });

  const getInitials = (name: string, surname: string) => {
    return `${name?.[0] || ''}${surname?.[0] || ''}`.toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-purple-500", "bg-blue-500", "bg-green-500",
      "bg-yellow-500", "bg-pink-500", "bg-indigo-500"
    ];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading users...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-destructive">Error: {(error as Error).message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage your platform users and their permissions.
            </p>
          </div>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setShowAddUser(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-lg border">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={plan === "" ? "default" : "outline"}
              onClick={() => setPlan("")}
              className={plan === "" ? "bg-primary text-primary-foreground" : ""}
            >
              All Users
            </Button>
            <Button
              variant={plan === "premium" ? "default" : "outline"}
              onClick={() => setPlan("premium")}
              className={plan === "premium" ? "bg-primary text-primary-foreground" : ""}
            >
              Premium Only
            </Button>
            <Button
              variant={plan === "free" ? "default" : "outline"}
              onClick={() => setPlan("free")}
              className={plan === "free" ? "bg-primary text-primary-foreground" : ""}
            >
              Free Users
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card rounded-lg border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Users ({users.length})</h2>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b">
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className={`${getAvatarColor(user.name)} text-white font-medium`}>
                          {getInitials(user.name, user.surname)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name} {user.surname}</div>
                        <div className="text-sm text-muted-foreground">ID: {user.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.status === "active" ? "default" : "destructive"}
                      className={
                        user.status === "active"
                          ? "bg-success text-success-foreground"
                          : "bg-destructive text-destructive-foreground"
                      }
                    >
                      {user.status === "active" ? "Active" : "Suspended"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.isPremium ? (
                      <Badge className="bg-primary text-primary-foreground">Premium</Badge>
                    ) : (
                      <span className="text-muted-foreground">Free</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => togglePremiumMutation.mutate(user.id)}>
                          {user.isPremium ? "Remove Premium" : "Make Premium"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleStatusMutation.mutate(user.id)}>
                          {user.status === "active" ? "Suspend" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteUserMutation.mutate(user.id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        open={showAddUser}
        onClose={() => setShowAddUser(false)}
        onSubmit={(formData) => addUserMutation.mutate(formData)}
      />
    </div>
  );
}
