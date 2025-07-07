import { LoginForm } from "@/components/login-form";
import useAuthStore from "@/Store/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login, isLoading, error, clearError, isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);

    // No need to navigate here, let useEffect handle it
  };

  // Redirect on successful login
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  // Clear error when component unmounts or user starts typing
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  return (
    <div className="flex min-h-svh w-full bg-black items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <LoginForm onLogin={handleLogin} isLoading={isLoading} />

        {/* Demo credentials info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Demo credentials:</p>
          <p>Email: demo@example.com</p>
          <p>Password: password</p>
        </div>
      </div>
    </div>
  );
}
