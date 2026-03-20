import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LeaderRoute({ children }) {
  const { user } = useAuth();

  // ❌ Not logged in
  if (!user) {
    return <Navigate to="/leader-login" />;
  }

  const role = user?.user_metadata?.role;

  // ❌ Wrong role
  if (role !== "leader") {
    return <Navigate to="/" />;
  }

  // ✅ Authorized
  return children;
}