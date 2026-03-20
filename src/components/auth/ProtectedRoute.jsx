import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: 'var(--bg)', color: 'white' }}>
      <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--surface)', backdropFilter: 'var(--glass)', border: '1px solid var(--border)', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '16px' }}>Verifying Access...</h2>
        <div style={{ width: '48px', height: '48px', border: '3px solid var(--border)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const rolePath = {
      admin: "/admin",
      bible_leader: "/leader",
      finance: "/finance"
    };
    return <Navigate to={rolePath[user.role] || "/"} />;
  }

  return children;
}
