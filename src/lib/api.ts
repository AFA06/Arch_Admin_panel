// admin/lib/api.ts
import axios from "axios";

const API_BASE = "http://localhost:5050/api/admin";

export const api = axios.create({
  baseURL: API_BASE,
});

// ✅ Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin-token");
      localStorage.removeItem("admin-user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Course Management APIs
export const courseAPI = {
  // Get all courses
  getAllCourses: (params?: { type?: string; search?: string }) => 
    api.get("/courses", { params }),

  // Get single course
  getCourse: (id: string) => 
    api.get(`/courses/${id}`),

  // Create course
  createCourse: (formData: FormData) => 
    api.post("/courses", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Update course
  updateCourse: (id: string, formData: FormData) => 
    api.put(`/courses/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Delete course
  deleteCourse: (id: string) => 
    api.delete(`/courses/${id}`),

  // Add video to pack
  addVideoToPack: (courseId: string, formData: FormData) => 
    api.post(`/courses/${courseId}/videos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Update video in pack
  updateVideo: (courseId: string, videoId: string, data: any) => 
    api.put(`/courses/${courseId}/videos/${videoId}`, data),

  // Delete video from pack
  deleteVideo: (courseId: string, videoId: string) => 
    api.delete(`/courses/${courseId}/videos/${videoId}`),

  // Reorder videos
  reorderVideos: (courseId: string, videoOrders: Array<{ videoId: string; order: number }>) => 
    api.put(`/courses/${courseId}/videos-order`, { videoOrders }),
};

// User Management APIs
export const userAPI = {
  // Get all users
  getUsers: (params?: { search?: string; status?: string; plan?: string }) =>
    api.get("/users", { params }),

  // Get available courses for assignment
  getAvailableCourses: () =>
    api.get("/users/courses"),

  // Grant course access
  grantCourseAccess: (userId: string, courseId: string) =>
    api.post(`/users/${userId}/grant-course`, { courseId }),

  // Remove course access
  removeCourseAccess: (userId: string, courseId: string) =>
    api.post(`/users/${userId}/remove-course`, { courseId }),

  // Toggle user status
  toggleStatus: (userId: string) =>
    api.put(`/users/${userId}/status`),

  // Delete user
  deleteUser: (userId: string) =>
    api.delete(`/users/${userId}`),

  // Add user
  addUser: (userData: any) =>
    api.post("/users", userData),
};

// Payment Management APIs
export const paymentAPI = {
  // Get all payments with filtering and pagination
  getAllPayments: (params?: {
    month?: string;
    year?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get("/payments", { params }),

  // Get payment statistics
  getPaymentStats: (params?: { month?: string; year?: string }) =>
    api.get("/payments/stats", { params }),

  // Get available months for filtering
  getAvailableMonths: () =>
    api.get("/payments/months"),
};

// Company Management APIs
export const companyAPI = {
  // Get all companies
  getCompanies: (params?: { search?: string; status?: string }) =>
    api.get("/companies", { params }),

  // Create company
  createCompany: (companyData: {
    name: string;
    description?: string;
    contactEmail?: string;
    contactPhone?: string;
  }) => api.post("/companies", companyData),

  // Update company
  updateCompany: (companyId: string, companyData: {
    name?: string;
    description?: string;
    contactEmail?: string;
    contactPhone?: string;
    isActive?: boolean;
  }) => api.put(`/companies/${companyId}`, companyData),

  // Toggle company status
  toggleCompanyStatus: (companyId: string) =>
    api.put(`/companies/${companyId}/toggle-status`),

  // Get company stats
  getCompanyStats: (companyId: string) =>
    api.get(`/companies/${companyId}/stats`),

  // Delete company
  deleteCompany: (companyId: string) =>
    api.delete(`/companies/${companyId}`),

  // Create company admin
  createCompanyAdmin: (adminData: {
    name: string;
    surname?: string;
    email: string;
    password: string;
    companyId: string;
  }) => api.post("/users/create-company-admin", adminData),
};
