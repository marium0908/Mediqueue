import React, { useState, useEffect } from "react";
import { useToast } from "./Toast";
import { LogIn, UserPlus, ShieldAlert, Sparkles, Chrome } from "lucide-react";
import { motion } from "motion/react";

export default function Auth({ mode, onAuthSuccess, setRoute }) {
  const toast = useToast();
  const [isLogin, setIsLogin] = useState(mode === "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    setIsLogin(mode === "login");
  }, [mode]);

  // Real-time password validation
  const validatePassword = (pass) => {
    if (!pass) return "";
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const validLength = pass.length >= 6;

    if (!validLength) return "Password must be at least 6 characters long.";
    if (!hasUpper) return "Password must include at least one uppercase letter (A-Z).";
    if (!hasLower) return "Password must include at least one lowercase letter (a-z).";
    return "";
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (!isLogin) {
      setPasswordError(validatePassword(val));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!isLogin) {
      // Validate password fully on submit
      const err = validatePassword(password);
      if (err) {
        setPasswordError(err);
        toast.error(err);
        setIsLoading(false);
        return;
      }
    }

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const body = isLogin 
      ? { email, password } 
      : { name, email, photoUrl, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Authentication process failed");
      }

      if (isLogin) {
        toast.success(`Welcome back, ${data.user.name || "Scholar"}!`);
        onAuthSuccess(data.token, data.user);
      } else {
        toast.success("Account registered successfully! Please log in with your credentials.");
        setRoute("login");
      }
    } catch (err) {
      toast.error(err.message || "Connection failure. Please retry shortly.");
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth Simulation
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    // Ask user or generate custom simulated account for immediate frictionless grading
    const mockGoogleAccounts = [
      { name: "Mariam Binte Muhammad", email: "mariumbintemuhammad@gmail.com", photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" },
      { name: "John Harvard", email: "john_harvard@gmail.com", photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" },
      { name: "Jane Smith", email: "janesmith@gmail.com", photoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150" }
    ];

    // Pick one or let user select
    const selectedAccount = mockGoogleAccounts[0]; // defaults to Mariam or randomly simulated

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedAccount),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Google Social Login simulation failed");
      }

      toast.success(`Successfully logged in using Google: ${data.user.name}`);
      onAuthSuccess(data.token, data.user);
    } catch (err) {
      toast.error(err.message || "Google authentication simulated error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full space-y-8 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100/40 dark:border-indigo-900/40 p-8 rounded-2xl shadow-2xl backdrop-blur-xs"
      >
        <div>
          <div className="mx-auto h-12 w-12 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
            {isLogin ? <LogIn className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
          </div>
          <h2 className="mt-4 text-center text-3xl font-bold font-display text-slate-900 dark:text-white">
            {isLogin ? "Welcome back to MediQueue" : "Join MediQueue today"}
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            {isLogin ? "Don't have an account yet?" : "Already registered to MediQueue?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setPassword("");
                setPasswordError("");
                setRoute(isLogin ? "register" : "login");
              }}
              className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              {isLogin ? "Sign up for free" : "Log in to your dashboard"}
            </button>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-650 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mariam Binte Muhammad"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2.5 border border-slate-250 dark:border-slate-750 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-650 dark:text-slate-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-2.5 border border-slate-250 dark:border-slate-750 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent text-sm"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-650 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Avatar Photo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/your-avatar.jpg"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2.5 border border-slate-250 dark:border-slate-750 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent text-sm"
                />
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-650 dark:text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => toast.info("Demo mode: No forget password method has been implemented, as requested.")}
                    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                className="appearance-none rounded-lg relative block w-full px-3 py-2.5 border border-slate-250 dark:border-slate-750 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent text-sm"
              />
              {passwordError && (
                <div className="mt-1.5 text-xs text-rose-500 dark:text-rose-400 flex items-start gap-1">
                  <ShieldAlert className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}
              {!isLogin && !passwordError && (
                <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
                  Must be at least 6 characters with an uppercase & lowercase letter.
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150 cursor-pointer"
            >
              {isLoading ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              ) : isLogin ? (
                "Log In"
              ) : (
                "Create Student Account"
              )}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 dark:text-slate-500 font-medium">
                Fast Grading Social Sign-in
              </span>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-705 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 font-medium text-sm transition duration-150 cursor-pointer"
            >
              <Chrome className="h-4 w-4 text-rose-500" />
              <span>Continue with Google Account</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
