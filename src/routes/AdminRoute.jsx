import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/admin-login" />;

  const role = user?.user_metadata?.role;

  if (role !== "admin") {
    return <Navigate to="/" />;
  }

  return children;
}