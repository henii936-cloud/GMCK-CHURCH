import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button, Card, Input } from "../../components/common/UI";
import { Mail, Lock, ArrowRight, Layers } from "lucide-react";
import { motion } from "framer-motion";

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
        <div className="grid place-items-center min-h-screen bg-background p-5 text-foreground">
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Card className="p-8 md:p-10">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 rounded-2xl bg-primary grid place-items-center mx-auto mb-6 shadow-lg shadow-primary/20">
                            <Layers size={32} className="text-primary-foreground" />
                        </div>
                        <h2 className="text-3xl font-extrabold mb-2">Welcome Back</h2>
                        <p className="text-muted-foreground">Sign in to your GMKC account</p>
                    </div>

                    <form onSubmit={handleSignIn} className="flex flex-col gap-6">
                        <Input 
                            label="Email Address"
                            type="email"
                            placeholder="samuel@church.org"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            icon={Mail}
                        />

                        <Input 
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            icon={Lock}
                        />

                        {errorMsg && (
                            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold border border-destructive/20">
                                {errorMsg}
                            </div>
                        )}

                        <Button type="submit" loading={loading} className="h-14 mt-2 text-base">
                            Sign In <ArrowRight size={20} className="ml-2" />
                        </Button>
                    </form>

                    <p className="text-center mt-8 text-muted-foreground text-sm">
                        Don't have an account? <Link to="/signup" className="text-primary font-bold hover:underline">Sign Up</Link>
                    </p>
                </Card>
            </motion.div>
        </div>
    );
}