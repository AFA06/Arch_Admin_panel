import { useState } from "react";
import { Mail, ArrowLeft, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would send reset email
    console.log("Password reset request:", email);
    
    toast({
      title: "Reset Link Sent",
      description: "If an account exists, you'll receive a password reset link shortly",
    });
    
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/50 backdrop-blur-xl border-border shadow-glow">
        <CardHeader className="text-center space-y-4">
          <Link to="/login" className="absolute top-4 left-4 p-2 hover:bg-accent rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
            <Video className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">Reset Password</CardTitle>
            <p className="text-muted-foreground">
              {isSubmitted 
                ? "Check your email for reset instructions" 
                : "Enter your email to receive reset instructions"
              }
            </p>
          </div>
        </CardHeader>
        
        <CardContent>
          {!isSubmitted ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gradient-primary text-primary-foreground"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Reset Link
              </Button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-success" />
              </div>
              <p className="text-muted-foreground">
                We've sent password reset instructions to <strong>{email}</strong>
              </p>
              <Button
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="w-full"
              >
                Try Different Email
              </Button>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link 
                to="/login" 
                className="text-primary hover:text-primary-glow transition-colors font-medium"
              >
                Back to login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}