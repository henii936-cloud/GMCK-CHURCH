import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LeaderRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  // ❌ Not logged in
  if (!user) {
    return <Navigate to="/login/leader" />;
  }

  const role = user?.role || user?.user_metadata?.role;

  // ❌ Wrong role
  if (role !== "bible_leader") {
    return <Navigate to="/" />;
  }

  // ✅ Authorized
  return children;
}