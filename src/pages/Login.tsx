// admin/pages/Login.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [email, setEmail] = useState("admin@videoadmin.com");
  const [password, setPassword] = useState("admin123");
  const { toast } = useToast();
  const navigate = useNavigate();

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
      const res = await axios.post("http://localhost:5050/api/admin/auth/login", {
        email,
        password,
      });

      // ✅ Store token using the correct key
      localStorage.setItem("admin-token", res.data.token);

      toast({
        title: "Login Successful",
        description: "Redirecting to dashboard...",
      });

      // ✅ Optional delay — can remove if you want instant redirect
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err.response?.data?.message || "Server error",
        variant: "destructive",
      });
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

        <Button type="submit" className="w-full">
          <LogIn className="mr-2 w-4 h-4" />
          Login
        </Button>
      </form>
    </div>
  );
}
