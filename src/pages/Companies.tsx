// src/pages/Companies.tsx
import { useState, useEffect } from "react";
import { companyAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Trash2, Building, Loader2, UserPlus } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";

interface Company {
  _id: string;
  name: string;
  description: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
  stats?: {
    adminCount: number;
    courseCount: number;
    totalRevenue: number;
    totalPayments: number;
  };
}

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const { user } = useAdminAuth();
  const { toast } = useToast();


  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
  });

  // Admin form state
  const [adminFormData, setAdminFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await companyAPI.getCompanies();
      const companiesData = response.data;

      // Fetch stats for each company
      const companiesWithStats = await Promise.all(
        companiesData.map(async (company: Company) => {
          try {
            const statsResponse = await companyAPI.getCompanyStats(company._id);
            return { ...company, stats: statsResponse.data.stats };
          } catch (error) {
            // If stats fetch fails, return company without stats
            console.warn(`Failed to fetch stats for company ${company._id}:`, error);
            return company;
          }
        })
      );

      setCompanies(companiesWithStats);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch companies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Company name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await companyAPI.createCompany(formData);

      toast({
        title: "Success",
        description: "Company created successfully",
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        contactEmail: "",
        contactPhone: "",
      });
      setIsCreateDialogOpen(false);

      fetchCompanies();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create company",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingCompany || !formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Company name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await companyAPI.updateCompany(editingCompany._id, formData);

      toast({
        title: "Success",
        description: "Company updated successfully",
      });

      setIsEditDialogOpen(false);
      setEditingCompany(null);
      fetchCompanies();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update company",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCompany = async (companyId: string, companyName: string) => {
    if (!confirm(`Are you sure you want to delete "${companyName}"? This will also remove all associated courses and admin accounts.`)) {
      return;
    }

    try {
      await companyAPI.deleteCompany(companyId);
      toast({
        title: "Success",
        description: "Company deleted successfully",
      });
      fetchCompanies();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete company",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      description: company.description,
      contactEmail: company.contactEmail || "",
      contactPhone: company.contactPhone || "",
    });
    setIsEditDialogOpen(true);
  };

  const openAdminDialog = (company: Company) => {
    setSelectedCompany(company);
    setAdminFormData({
      name: "",
      surname: "",
      email: "",
      password: "",
    });
    setIsAdminDialogOpen(true);
  };

  const handleCreateCompanyAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCompany || !adminFormData.name || !adminFormData.email || !adminFormData.password) {
      toast({
        title: "Validation Error",
        description: "Name, email, and password are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await companyAPI.createCompanyAdmin({
        name: adminFormData.name,
        surname: adminFormData.surname,
        email: adminFormData.email,
        password: adminFormData.password,
        companyId: selectedCompany._id,
      });

      toast({
        title: "Success",
        description: `Company admin created successfully for ${selectedCompany.name}`,
      });

      // Reset form
      setAdminFormData({
        name: "",
        surname: "",
        email: "",
        password: "",
      });
      setIsAdminDialogOpen(false);
      setSelectedCompany(null);

      // Show the credentials in a more prominent way
      toast({
        title: "Admin Credentials",
        description: `Email: ${adminFormData.email}, Password: ${adminFormData.password}`,
        duration: 10000, // Show for 10 seconds
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create company admin",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (companyId: string, companyName: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} "${companyName}"?`)) {
      return;
    }

    try {
      await companyAPI.toggleCompanyStatus(companyId);

      toast({
        title: "Success",
        description: `Company ${currentStatus ? 'deactivated' : 'activated'} successfully`,
      });

      fetchCompanies();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to toggle company status",
        variant: "destructive",
      });
    }
  };

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Only main admin can manage companies
  // Allow main admins or admins without role (backward compatibility)
  if (!user?.isAdmin || (user.adminRole && user.adminRole !== 'main')) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Building className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Access denied. Only main admin can manage companies.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Company Management</h1>
          <p className="text-muted-foreground">Create and manage partner companies and their admin accounts</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Company
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Company</DialogTitle>
              <DialogDescription>
                Add a new partner company to the platform
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter company name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter company description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="contact@company.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="+998 XX XXX XX XX"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Company
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Companies Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredCompanies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Building className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No companies found</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Admins</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company._id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {company.description || "No description"}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {company.contactEmail && (
                        <div className="truncate">{company.contactEmail}</div>
                      )}
                      {company.contactPhone && (
                        <div className="text-muted-foreground">{company.contactPhone}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{company.stats?.adminCount || 0}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={company.isActive ? "default" : "secondary"}
                      className="cursor-pointer hover:opacity-80"
                      onClick={() => handleToggleStatus(company._id, company.name, company.isActive)}
                    >
                      {company.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="truncate">{company.createdBy.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(company)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openAdminDialog(company)}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create Admin
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteCompany(company._id, company.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Edit Company Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>Update company information</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateCompany} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Company Name *</Label>
              <Input
                id="editName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter company name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter company description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editContactEmail">Contact Email</Label>
              <Input
                id="editContactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="contact@company.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editContactPhone">Contact Phone</Label>
              <Input
                id="editContactPhone"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="+998 XX XXX XX XX"
              />
            </div>

              <DialogFooter className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    if (editingCompany) {
                      openAdminDialog(editingCompany);
                    }
                  }}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Admin
                </Button>
                <div className="flex gap-2 ml-auto">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Company
                  </Button>
                </div>
              </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Company Admin Dialog */}
      <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Company Admin</DialogTitle>
            <DialogDescription>
              Create an admin account for {selectedCompany?.name}. The admin will have access to this company's dashboard and payments only.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCompanyAdmin} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adminName">Name *</Label>
                <Input
                  id="adminName"
                  value={adminFormData.name}
                  onChange={(e) => setAdminFormData({ ...adminFormData, name: e.target.value })}
                  placeholder="Enter admin name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminSurname">Surname</Label>
                <Input
                  id="adminSurname"
                  value={adminFormData.surname}
                  onChange={(e) => setAdminFormData({ ...adminFormData, surname: e.target.value })}
                  placeholder="Enter admin surname"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminEmail">Email *</Label>
              <Input
                id="adminEmail"
                type="email"
                value={adminFormData.email}
                onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                placeholder="admin@company.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminPassword">Password *</Label>
              <Input
                id="adminPassword"
                type="password"
                value={adminFormData.password}
                onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                placeholder="Enter secure password"
                required
              />
              <p className="text-sm text-muted-foreground">
                Make sure to save these credentials securely. The admin will need them to log in.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAdminDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Company Admin
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
