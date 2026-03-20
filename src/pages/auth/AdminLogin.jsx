import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Mail, Lock, Loader2, ChevronLeft, ArrowRight } from "lucide-react";
import { Button, Input, Card } from "../../components/common/UI";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreateDemo, setShowCreateDemo] = useState(false);

  const theme = {
    name: "Administrator",
    color: "#6366f1", // Indigo for Admin
    icon: ShieldCheck
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const data = await login(email, password, "admin");

      if (!data?.session) {
        setError("Please verify your email before signing in.");
        return;
      }

      navigate("/admin");
    } catch (err) {
      console.error("Admin Login Error:", err.message);
      setError(err.message || "Invalid credentials.");
      if (email.includes("@demo.com")) {
        setShowCreateDemo(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail("admin@demo.com");
    setPassword("password123");
    setShowCreateDemo(false);
  };

  const createDemoAccount = async () => {
    setLoading(true);
    setError("");
    try {
      await signup(email, password, "Demo Admin", "admin");
      setError("Demo account created! You can now sign in.");
      setShowCreateDemo(false);
    } catch (err) {
      setError(err.message || "Failed to create demo account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'grid', 
      placeItems: 'center', 
      minHeight: '100vh', 
      padding: '20px',
      background: `radial-gradient(at 0% 0%, ${theme.color}33 0, transparent 40%)`
    }}>
      <div style={{ position: 'fixed', top: '40px', left: '40px' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontWeight: '600' }}>
          <ChevronLeft size={20} /> Back to Home
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: '460px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ 
            width: 72, height: 72, borderRadius: 24, 
            background: theme.color, 
            display: 'grid', placeItems: 'center', 
            margin: '0 auto 20px', 
            boxShadow: `0 12px 30px ${theme.color}44` 
          }}>
            <theme.icon size={36} color="white" />
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>
            Admin<span style={{ color: theme.color }}> Portal</span>
          </h1>

          <p style={{ color: 'var(--text-muted)' }}>
            Church Management System Control Center
          </p>
        </div>

        <Card style={{ padding: '48px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <Input 
              label="Admin Email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              icon={Mail} 
              placeholder="admin@gmkc-church.org"
            />

            <Input 
              label="Password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              icon={Lock} 
              placeholder="••••••••"
            />

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{ 
                  color: '#ef4444', 
                  fontSize: '0.875rem', 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  padding: '12px', 
                  borderRadius: '8px',
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}
              >
                {error}
              </motion.div>
            )}

            <Button type="submit" loading={loading} style={{ height: '52px', background: theme.color }}>
              Sign In to Dashboard <ArrowRight size={18} style={{ marginLeft: '8px' }} />
            </Button>

            {showCreateDemo && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center' }}
              >
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Account not found. Would you like to create it?
                </p>
                <Button 
                  onClick={createDemoAccount} 
                  variant="secondary" 
                  style={{ width: '100%', borderColor: theme.color, color: theme.color }}
                >
                  Create Demo Admin Account
                </Button>
              </motion.div>
            )}

            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <button 
                type="button" 
                onClick={handleDemoLogin}
                style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'underline' }}
              >
                Use Demo Credentials
              </button>
            </div>
          </form>
        </Card>

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Not an Admin? <Link to="/login/leader" style={{ color: theme.color, fontWeight: '600', textDecoration: 'none' }}>Leader Login</Link> or <Link to="/login/finance" style={{ color: theme.color, fontWeight: '600', textDecoration: 'none' }}>Finance Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
