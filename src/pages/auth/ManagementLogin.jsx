import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button, Input, Card } from "../../components/common/UI";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import { Mail, Lock, ArrowRight, ChevronLeft, Briefcase } from "lucide-react";

export default function ManagementLogin() {
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
      };
      navigate(routes[userRole] || "/");
    } catch (err) {
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
          <div className="w-24 h-24 rounded-[3rem] bg-primary grid place-items-center mx-auto mb-8 shadow-xl shadow-primary/10">
            <Briefcase size={48} className="text-on-primary" />
          </div>
          <h1 className="display-sm text-primary mb-4">
            Management<span className="text-tertiary-fixed-dim italic"> Portal</span>
          </h1>
          <p className="label-sm opacity-60 uppercase tracking-widest">
            Executive Operations & Finance Control
          </p>
        </div>

        <Card className="p-12 md:p-16 shadow-whisper border-none bg-surface-container">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <Input
              label="Management Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={Mail}
              placeholder="management@gmkc-church.org"
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
            <Button type="submit" loading={loading} className="h-16 bg-primary hover:opacity-90 text-on-primary border-none shadow-xl shadow-primary/10">
              Sign In to Management <ArrowRight size={20} className="ml-3" />
            </Button>
          </form>
        </Card>

        <div className="mt-12 text-center">
          <p className="text-primary/40 text-xs font-medium uppercase tracking-widest mb-4 opacity-50">Select Another Portal</p>
          <div className="flex flex-wrap justify-center gap-4 text-[10px] font-black uppercase tracking-[0.2em]">
            <Link to="/login/admin" className="text-primary hover:text-tertiary-fixed-dim transition-colors">Admin</Link>
            <Link to="/login/leader" className="text-primary hover:text-tertiary-fixed-dim transition-colors">Leader</Link>
            <Link to="/login/finance" className="text-primary hover:text-tertiary-fixed-dim transition-colors">Finance</Link>
            <Link to="/login/youth" className="text-primary hover:text-tertiary-fixed-dim transition-colors">Youth</Link>
            <Link to="/login/shepherd" className="text-primary hover:text-tertiary-fixed-dim transition-colors">Shepherd</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
