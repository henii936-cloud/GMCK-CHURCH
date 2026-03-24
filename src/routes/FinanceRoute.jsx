import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function FinanceRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid place-items-center min-h-screen bg-background text-foreground">
        <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-md border border-border text-center">
          <h2 className="mb-4 text-xl font-semibold">Verifying Access...</h2>
          <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login/finance" />;
  }

  const role = user?.role || user?.user_metadata?.role;

  if (role?.toLowerCase() !== "finance") {
    console.warn("FinanceRoute: Unauthorized role access attempt -", role);
    return <Navigate to="/login/finance" replace />;
  }

  return children;
}