import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button, Input, Card } from "../../components/common/UI";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2, ChevronLeft, Wallet } from "lucide-react";

export default function FinanceLogin() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreateDemo, setShowCreateDemo] = useState(false);

  const theme = {
    name: "Finance",
    color: "#f59e0b",
    icon: Wallet
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const data = await login(email, password, "finance");

      console.log("Finance login response:", data);

      // 🔥 FIX: handle missing session
      if (!data?.session) {
        setError("Please verify your email before signing in.");
        return;
      }

      // ✅ SUCCESS
      navigate("/finance");

    } catch (err) {
      console.error("Finance Login Error:", err.message);
      setError(err.message || "Invalid credentials.");
      if (email.includes("@demo.com")) {
        setShowCreateDemo(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    const demoEmail = "finance@demo.com";
    const demoPass = "password123";

    setEmail(demoEmail);
    setPassword(demoPass);
    setShowCreateDemo(false);
  };

  const createDemoAccount = async () => {
    setLoading(true);
    setError("");
    try {
      await signup(email, password, "Demo Finance", "finance");
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
            Finance<span style={{ color: theme.color }}> Portal</span>
          </h1>

          <p style={{ color: 'var(--text-muted)' }}>
            Finance Department Authentication
          </p>
        </div>

        <Card style={{ padding: '48px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <Input 
              label="Finance Email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              icon={Mail} 
            />

            <Input 
              label="Password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              icon={Lock} 
            />

            {error && (
              <div style={{ 
                color: '#ef4444', 
                fontSize: '0.875rem', 
                background: 'rgba(239, 68, 68, 0.1)', 
                padding: '12px', 
                borderRadius: '8px' 
              }}>
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} style={{ height: '52px', background: theme.color }}>
              Sign In to Finance <ArrowRight size={18} style={{ marginLeft: '8px' }} />
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
                  Create Demo Finance Account
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
            Not Finance? <Link to="/login/admin" style={{ color: theme.color, fontWeight: '600', textDecoration: 'none' }}>Admin Login</Link> or <Link to="/login/leader" style={{ color: theme.color, fontWeight: '600', textDecoration: 'none' }}>Leader Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
