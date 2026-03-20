import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function FinanceRoute({ children }) {
  const { user } = useAuth();

  // ❌ Not logged in
  if (!user) {
    return <Navigate to="/finance-login" />;
  }

  const role = user?.user_metadata?.role;

  // ❌ Wrong role
  if (role !== "finance") {
    return <Navigate to="/" />;
  }

  // ✅ Authorized
  return children;
}