// admin/pages/Login.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function Login() {
  const [email, setEmail] = useState("admin@videoadmin.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Missing Fields",
        description: "Please enter email and password",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5050/api/admin/auth/login", {
        email,
        password,
      });

      if (res.data.success) {
        // Use the auth context to store user data
        login(res.data.user, res.data.token);

        toast({
          title: "Login Successful",
          description: "Redirecting to dashboard...",
        });

        // Check if there's a return URL
        const returnUrl = localStorage.getItem("admin-return-after-login");
        if (returnUrl) {
          localStorage.removeItem("admin-return-after-login");
          navigate(returnUrl);
        } else {
          navigate("/");
        }
      } else {
        throw new Error(res.data.message || "Login failed");
      }
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err.response?.data?.message || err.message || "Server error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-900 text-white">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 w-full max-w-sm p-6 bg-gray-800 rounded-xl"
      >
        <h2 className="text-2xl font-bold">Admin Login</h2>

        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          <LogIn className="mr-2 w-4 h-4" />
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </div>
  );
}
