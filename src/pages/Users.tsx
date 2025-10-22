import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AddUserModal } from "../components/userspage/AddUserModal";
import { AssignCourseModal } from "../components/userspage/AssignCourseModal";
import { api, userAPI } from "@/lib/api";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Plus, MoreHorizontal, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Users() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [plan, setPlan] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAssignCourse, setShowAssignCourse] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // ✅ TASK 5: Debounced live search with 300ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);
  
  const queryKey = ["admin-users", debouncedSearch, plan];

  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (plan) params.append("plan", plan);
      const res = await api.get(`/users?${params.toString()}`);
      return res.data;
    },
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey });
  };

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
    },
  });

  const grantCourseMutation = useMutation({
    mutationFn: ({ userId, courseId }: { userId: string; courseId: string }) =>
      userAPI.grantCourseAccess(userId, courseId),
    onSuccess: (response) => {
      invalidateAll();
      setShowAssignCourse(false);
      toast({
        title: "Success",
        description: response.data.message || "Course access granted successfully",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err?.response?.data?.error || "Failed to grant course access",
        variant: "destructive",
      });
    },
  });

  const revokeCourseMutation = useMutation({
    mutationFn: ({ userId, courseId }: { userId: string; courseId: string }) =>
      userAPI.removeCourseAccess(userId, courseId),
    onSuccess: (response) => {
      invalidateAll();
      toast({
        title: "Success",
        description: response.data.message || "Course access removed successfully",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err?.response?.data?.error || "Failed to remove course access",
        variant: "destructive",
      });
    },
  });

  const handleOpenAssignCourse = (user: any) => {
    setSelectedUser(user);
    setShowAssignCourse(true);
  };

  const handleAssignCourse = (courseId: string) => {
    if (selectedUser) {
      grantCourseMutation.mutate({ userId: selectedUser.id, courseId });
    }
  };

  const getInitials = (name: string, surname: string) =>
    `${name?.[0] || ""}${surname?.[0] || ""}`.toUpperCase();

  const getAvatarColor = (name: string) => {
    const colors = ["bg-purple-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-pink-500", "bg-indigo-500"];
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-1">Manage your platform users and their permissions.</p>
          </div>
          <Button onClick={() => setShowAddUser(true)} className="bg-primary text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

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
            {["", "premium", "free"].map((p) => (
              <Button
                key={p}
                variant={plan === p ? "default" : "outline"}
                onClick={() => setPlan(p)}
                className={plan === p ? "bg-primary text-white" : ""}
              >
                {p === "" ? "All Users" : p === "premium" ? "Premium Only" : "Free Users"}
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Users ({users.length})</h2>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Courses</TableHead>
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
                        <AvatarFallback className={`${getAvatarColor(user.name)} text-white`}>
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
                      className={user.status === "active" ? "bg-green-500" : "bg-red-500"}
                    >
                      {user.status === "active" ? "Active" : "Suspended"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.purchasedCourses?.length > 0 ? (
                        user.purchasedCourses.map((courseId: string) => (
                          <Badge key={courseId} variant="secondary" className="flex items-center gap-1">
                            Course
                            <X
                              className="w-3 h-3 cursor-pointer hover:text-destructive"
                              onClick={() => {
                                if (confirm(`Remove this course from ${user.name}?`)) {
                                  revokeCourseMutation.mutate({ userId: user.id, courseId });
                                }
                              }}
                            />
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">No courses</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenAssignCourse(user)}>
                          Assign Course
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleStatusMutation.mutate(user.id)}>
                          {user.status === "active" ? "Suspend" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => {
                          if (confirm(`Are you sure you want to delete ${user.name}?`)) {
                            deleteUserMutation.mutate(user.id);
                          }
                        }}>
                          Delete User
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

      <AddUserModal
        open={showAddUser}
        onClose={() => setShowAddUser(false)}
        onSubmit={(formData) => addUserMutation.mutate(formData)}
      />

      <AssignCourseModal
        open={showAssignCourse}
        onClose={() => {
          setShowAssignCourse(false);
          setSelectedUser(null);
        }}
        onAssign={handleAssignCourse}
        userName={selectedUser?.name || ""}
        isSubmitting={grantCourseMutation.isPending}
      />
    </div>
  );
}
