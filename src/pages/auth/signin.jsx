import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button, Card, Input } from "../../components/common/UI";
import { Mail, Lock, ArrowRight, Layers } from "lucide-react";
import { motion } from "motion/react";

export default function SignIn() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignIn = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setLoading(true);

        try {
            console.log("Attempting login with:", email);
            const data = await login(email, password);
            console.log("Login success:", data);

            if (!data.session) {
                setErrorMsg("Please verify your email before signing in.");
                return;
            }

            // Redirect based on role if available
            const role = data.user?.user_metadata?.role;
            if (role === 'admin') navigate("/admin");
            else if (role === 'leader' || role === 'bible_leader') navigate("/leader");
            else if (role === 'finance') navigate("/finance");
            else navigate("/");
        } catch (error) {
            console.error("Login error:", error.message);
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid place-items-center min-h-screen bg-surface p-6 text-primary relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full bg-primary blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 rounded-full bg-tertiary-fixed-dim blur-[100px]" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-lg relative z-10"
            >
                <Card className="p-12 md:p-16 shadow-whisper border-none bg-surface-container">
                    <div className="text-center mb-12">
                        <div className="w-24 h-24 rounded-[3rem] bg-primary grid place-items-center mx-auto mb-8 shadow-xl shadow-primary/10">
                            <Layers size={48} className="text-on-primary" />
                        </div>
                        <h1 className="display-sm text-primary mb-4">
                            Welcome <span className="text-tertiary-fixed-dim italic">Back</span>
                        </h1>
                        <p className="label-sm opacity-60 uppercase tracking-widest">Sign in to your digital sanctuary</p>
                    </div>

                    <form onSubmit={handleSignIn} className="flex flex-col gap-8">
                        <Input 
                            label="Email Address"
                            type="email"
                            placeholder="samuel@church.org"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            icon={Mail}
                        />

                        <div className="space-y-2">
                            <Input 
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                icon={Lock}
                            />
                            <div className="flex justify-end">
                                <button type="button" className="text-[11px] uppercase tracking-widest font-black text-primary/40 hover:text-primary transition-colors">
                                    Forgot Password?
                                </button>
                            </div>
                        </div>

                        {errorMsg && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-100 text-center"
                            >
                                {errorMsg}
                            </motion.div>
                        )}

                        <Button type="submit" loading={loading} className="h-16 mt-4 text-base shadow-xl shadow-primary/20 bg-primary text-on-primary border-none hover:opacity-90">
                            Sign In <ArrowRight size={20} className="ml-3" />
                        </Button>
                    </form>

                    <div className="mt-12 pt-12 border-t border-primary/5 text-center">
                        <p className="text-primary/40 text-xs font-medium">
                            Don't have an account? <Link to="/signup" className="text-primary font-black uppercase tracking-widest hover:underline ml-2">Sign Up</Link>
                        </p>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
