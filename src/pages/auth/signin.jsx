import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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
        <div className="auth-container">
            <form onSubmit={handleSignIn}>
                <h2>Sign In</h2>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {errorMsg && <p className="error">{errorMsg}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                </button>
            </form>
        </div>
    );
}