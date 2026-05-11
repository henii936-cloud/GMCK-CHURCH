import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import { UserCircle, Mail, Lock, Loader2, ChevronLeft, ArrowRight } from "lucide-react";
import { Button, Input, Card } from "../../components/common/UI";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const data = await login(email, password);

      if (!data?.session) {
        setError("Please verify your email before signing in.");
        return;
      }

      const userRole = data.profile?.role || data.user?.user_metadata?.role;
      const routes = {
        admin: "/admin",
        bible_leader: "/leader",
        finance: "/finance",
        management: "/management",
        youth_ministry: "/youth",
        shepherd: "/shepherd",
        kids_ministry: "/kids"
      };
      navigate(routes[userRole] || "/");
    } catch (err) {
      console.error("Login Error:", err.message);
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid place-items-center min-h-screen p-6 bg-surface text-primary relative overflow-hidden">
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
          <div className="w-28 h-28 rounded-[3.5rem] bg-surface-container-high overflow-hidden mx-auto mb-10 shadow-2xl shadow-primary/5 border border-outline-variant/10">
            <img 
              src="/src/assets/admin-icon.png" 
              alt="Church Logo" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div class="w-full h-full bg-primary grid place-items-center"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-on-primary"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>';
              }}
            />
          </div>

          <h1 className="display-sm text-primary mb-4">
            Unified<span className="text-tertiary-fixed-dim italic"> Login</span>
          </h1>

          <p className="label-sm opacity-60 uppercase tracking-widest">
            Church Management Portal
          </p>
        </div>

        <Card className="p-12 md:p-16 shadow-whisper border-none bg-surface-container">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <Input 
              label="Email Address" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              icon={Mail} 
              placeholder="user@gmkc-church.org"
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

            <Button type="submit" loading={loading} className="h-16 bg-primary hover:opacity-90 text-on-primary border-none shadow-xl shadow-primary/10 w-full justify-center">
              Sign In <ArrowRight size={20} className="ml-3" />
            </Button>
          </form>
        </Card>

        <div className="mt-12 text-center">
          <p className="text-primary/40 text-xs font-medium uppercase tracking-widest mb-4">Don't have an account?</p>
          <Link to="/signup" className="text-primary font-black uppercase tracking-[0.2em] text-[10px] hover:text-tertiary-fixed-dim transition-colors">Apply for a Role</Link>
        </div>
      </motion.div>
    </div>
  );
}
