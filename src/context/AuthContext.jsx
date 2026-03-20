import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get session on load
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // 🔐 UNIVERSAL LOGIN FUNCTION
  const login = async (email, password, role) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message === "Invalid login credentials") {
          throw new Error("Invalid email or password. If you haven't registered yet, please use the 'Create Demo Account' button below.");
        }
        throw error;
      }

      let user = data.user;

      // 🔍 Check if user exists
      if (!user) {
        throw new Error("User not found");
      }

      // 🔍 Get role from metadata
      let userRole = user.user_metadata?.role;

      // ❗ If role required but not set, and it's a demo account, auto-assign it
      if (role && !userRole && email.includes("@demo.com")) {
        console.log(`Auto-assigning role ${role} to demo account ${email}`);
        const { data: updatedData, error: updateError } = await supabase.auth.updateUser({
          data: { role }
        });
        if (updateError) throw updateError;
        userRole = role;
        user = updatedData.user;
      }

      // ❗ If role still required but not set
      if (role && !userRole) {
        throw new Error("User role not assigned to this account. Please contact an administrator.");
      }

      // 🔒 ROLE VALIDATION (for all roles)
      if (role && userRole !== role) {
        throw new Error(`Access denied: This account is registered as a ${userRole}, not a ${role}.`);
      }

      return data;
    } catch (err) {
      throw err;
    }
  };

  const signup = async (email, password, name, role) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role
        }
      }
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, login, signup, logout, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);









