import { useState } from "react";
import { Eye, EyeOff, LogIn, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!credentials.email || !credentials.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    // In a real app, this would authenticate with backend
    console.log("Login attempt:", credentials);
    
    toast({
      title: "Login Successful",
      description: "Welcome to VideoAdmin Dashboard",
    });
    
    // For demo purposes, redirect to dashboard
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/50 backdrop-blur-xl border-border shadow-glow">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
            <Video className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">Admin Login</CardTitle>
            <p className="text-muted-foreground">Access your VideoAdmin dashboard</p>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@videoadmin.com"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({
                    ...prev,
                    password: e.target.value
                  }))}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary hover:text-primary-glow transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-primary text-primary-foreground"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login to Dashboard
            </Button>
          </form>
          
          <div className="mt-6 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link 
                to="/signup" 
                className="text-primary hover:text-primary-glow transition-colors font-medium"
              >
                Please register
              </Link>
            </p>
            
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Demo credentials: admin@videoadmin.com / admin123
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}