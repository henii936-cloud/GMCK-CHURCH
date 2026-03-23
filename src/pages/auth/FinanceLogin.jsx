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

  const theme = {
    name: "Finance",
    color: "text-amber-500",
    bg: "bg-amber-500",
    shadow: "shadow-amber-500/30",
    gradient: "from-amber-500/20 to-transparent",
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
    <div className={`grid place-items-center min-h-screen p-5 bg-[radial-gradient(at_0%_0%,rgba(245,158,11,0.2)_0,transparent_40%)] bg-background text-foreground`}>
      <div className="fixed top-10 left-10">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground font-semibold hover:text-foreground transition-colors">
          <ChevronLeft size={20} /> Back to Home
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[460px]"
      >
        <div className="text-center mb-10">
          <div className={`w-20 h-20 rounded-3xl ${theme.bg} grid place-items-center mx-auto mb-6 shadow-xl ${theme.shadow}`}>
            <theme.icon size={36} className="text-white" />
          </div>

          <h1 className="text-4xl font-extrabold mb-2">
            Finance<span className={theme.color}> Portal</span>
          </h1>

          <p className="text-muted-foreground">
            Finance Department Authentication
          </p>
        </div>

        <Card className="p-10 md:p-12">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
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
              <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-xl border border-destructive/20 font-semibold">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className={`h-14 ${theme.bg} hover:opacity-90 text-white border-none shadow-lg ${theme.shadow}`}>
              Sign In to Finance <ArrowRight size={18} className="ml-2" />
            </Button>
          </form>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            Not Finance? <Link to="/login/admin" className={`${theme.color} font-semibold hover:underline`}>Admin Login</Link> or <Link to="/login/leader" className={`${theme.color} font-semibold hover:underline`}>Leader Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
