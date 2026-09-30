import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMail, FiLock, FiAlertCircle, FiArrowRight, FiEye, FiEyeOff, FiUser, FiBriefcase } from "react-icons/fi";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { sanitizeRedirectPath, getDefaultDashboard } from "../../utils/security";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated, userRole } = useAuth();

    const [email, setEmail] = useState(location.state?.prefilledEmail || "");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(location.state?.securityAlert || "");

    // If already authenticated, redirect immediately away from login
    useEffect(() => {
        if (isAuthenticated) {
            const role = userRole || localStorage.getItem("userRole");
            const requestedFrom = location.state?.from?.pathname || new URLSearchParams(location.search).get("redirect");
            const safeDestination = sanitizeRedirectPath(requestedFrom, role);
            navigate(safeDestination, { replace: true });
        }
    }, [isAuthenticated, userRole, location, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await loginUser({ email: email.trim(), password });
            if (data?.token || data?.accessToken) {
                login(data);

                // Check user role from response
                const role = data.role || data.user?.role;
                const requestedFrom = location.state?.from?.pathname || new URLSearchParams(location.search).get("redirect");
                const safeDestination = sanitizeRedirectPath(requestedFrom, role);
                navigate(safeDestination, { replace: true });
            } else {
                setError("Authentication failed. Please check your credentials.");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Invalid email or password. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 flex items-center justify-center p-4 py-16">
                <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl space-y-6">
                    <div className="text-center space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md shadow-indigo-600/20">
                            H
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
                        <p className="text-xs text-slate-500">Sign in to your HireSphere candidate or employer account</p>
                    </div>

                    {error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700 flex items-center gap-2">
                            <FiAlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                        <div>
                            <label className="block font-bold text-slate-700 mb-1.5">Email Address</label>
                            <div className="relative">
                                <FiMail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your.email@example.com"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="font-bold text-slate-700">Password</label>
                                <Link
                                    to="/forgot-password"
                                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition"
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className="relative">
                                <FiLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-10 py-2.5 text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                                    tabIndex={-1}
                                    title={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* 1-CLICK DEMO ACCOUNTS QUICK SIGN-IN */}
                        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-3 space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-bold text-indigo-900">
                                <span className="flex items-center gap-1">
                                    <span>⚡</span> Quick Demo Login
                                </span>
                                <span className="text-[10px] text-indigo-600 font-semibold">1-Click Auto-Fill</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEmail("nilesh.borchate.jobseeker@gmail.com");
                                        setPassword("Nilesh@12345");
                                    }}
                                    className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-[11px] font-bold text-slate-700 transition shadow-2xs text-left"
                                >
                                    <FiUser size={14} className="text-indigo-600 shrink-0" />
                                    <div className="truncate">
                                        <div className="leading-tight">Job Seeker</div>
                                        <div className="text-[9px] text-slate-400 font-normal">Nilesh Borchate</div>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setEmail("rohit.sharma.recruiter@gmail.com");
                                        setPassword("Nilesh@12345");
                                    }}
                                    className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-purple-200 hover:border-purple-400 hover:bg-purple-50/50 text-[11px] font-bold text-slate-700 transition shadow-2xs text-left"
                                >
                                    <FiBriefcase size={14} className="text-purple-600 shrink-0" />
                                    <div className="truncate">
                                        <div className="leading-tight">Recruiter</div>
                                        <div className="text-[9px] text-slate-400 font-normal">TCS NextGen</div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01] disabled:opacity-50"
                        >
                            {loading ? "Authenticating..." : "Sign In to Account"}
                        </button>
                    </form>

                    <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
                        Don't have an account?{" "}
                        <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700 transition">
                            Create Account
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Login;
