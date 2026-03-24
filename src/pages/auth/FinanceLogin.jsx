import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button, Input, Card } from "../../components/common/UI";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import { Mail, Lock, ArrowRight, Loader2, ChevronLeft, Wallet } from "lucide-react";

export default function FinanceLogin() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const theme = {
    name: "Finance",
    color: "text-primary",
    bg: "bg-primary",
    shadow: "shadow-primary/10",
    gradient: "from-primary/10 to-transparent",
    icon: Wallet
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const data = await login(email, password);

      console.log("Finance login response:", data);

      // 🔥 FIX: handle missing session
      if (!data?.session) {
        setError("Please verify your email before signing in.");
        return;
      }

      // ✅ SUCCESS
      const userRole = data.profile?.role || data.user?.user_metadata?.role;
      if (userRole === "admin") {
        navigate("/admin");
      } else if (userRole === "bible_leader") {
        navigate("/leader");
      } else if (userRole === "finance") {
        navigate("/finance");
      } else {
        navigate("/");
      }

    } catch (err) {
      console.error("Finance Login Error:", err.message);
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`grid place-items-center min-h-screen p-6 bg-surface text-primary relative overflow-hidden`}>
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full bg-primary blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 rounded-full bg-tertiary-fixed-dim blur-[100px]" />
      </div>

      <div className="fixed top-12 left-12 z-10">
        <Link to="/" className="flex items-center gap-3 text-primary/40 font-black uppercase tracking-[0.2em] text-[11px] hover:text-primary transition-colors">
          <ChevronLeft size={16} /> Home Sanctuary
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-16">
          <div className={`w-24 h-24 rounded-[3rem] ${theme.bg} grid place-items-center mx-auto mb-8 shadow-xl ${theme.shadow}`}>
            <theme.icon size={48} className="text-on-primary" />
          </div>

          <h1 className="display-sm text-primary mb-4">
            Finance<span className="text-tertiary-fixed-dim italic"> Portal</span>
          </h1>

          <p className="label-sm opacity-60 uppercase tracking-widest">
            Finance Department Authentication
          </p>
        </div>

        <Card className="p-12 md:p-16 shadow-whisper border-none bg-surface-container">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            
            <Input 
              label="Finance Email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              icon={Mail} 
              placeholder="finance@gmkc-church.org"
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-100 text-center"
              >
                {error}
              </motion.div>
            )}

            <Button type="submit" loading={loading} className={`h-16 ${theme.bg} hover:opacity-90 text-on-primary border-none shadow-xl ${theme.shadow}`}>
              Sign In to Finance <ArrowRight size={20} className="ml-3" />
            </Button>
          </form>
        </Card>

        <div className="mt-12 text-center">
          <p className="text-primary/40 text-xs font-medium">
            Not Finance? <Link to="/login/admin" className="text-primary font-black uppercase tracking-widest hover:underline ml-2">Admin Login</Link> or <Link to="/login/leader" className="text-primary font-black uppercase tracking-widest hover:underline ml-2">Leader Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
