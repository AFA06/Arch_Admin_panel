import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Users() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("");
  const [status, setStatus] = useState("");

  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-users", search, gender, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (gender) params.append("gender", gender);
      if (status) params.append("status", status);
      const res = await api.get(`/users?${params.toString()}`);
      return res.data;
    },
  });

  const togglePremiumMutation = useMutation({
    mutationFn: (id: string) => api.put(`/users/${id}/premium`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => api.put(`/users/${id}/status`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  if (isLoading) return <div>Loading users...</div>;
  if (isError) return <div>Error: {(error as Error).message}</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>

      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select value={gender} onChange={(e) => setGender(e.target.value)} className="border px-2 py-1 rounded-md">
          <option value="">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border px-2 py-1 rounded-md">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Premium</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user: any) => (
            <TableRow key={user.id}>
              <TableCell>{user.name} {user.surname}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.gender}</TableCell>
              <TableCell>{user.status}</TableCell>
              <TableCell>{user.isPremium ? "Yes" : "No"}</TableCell>
              <TableCell className="space-x-2">
                <Button size="sm" variant="outline" onClick={() => togglePremiumMutation.mutate(user.id)}>
                  {user.isPremium ? "Remove Premium" : "Make Premium"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => toggleStatusMutation.mutate(user.id)}>
                  {user.status === "active" ? "Suspend" : "Activate"}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => deleteUserMutation.mutate(user.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
