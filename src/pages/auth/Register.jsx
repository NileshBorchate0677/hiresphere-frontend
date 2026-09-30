import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiAlertCircle, FiCheck, FiBriefcase } from "react-icons/fi";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import { registerUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const Register = () => {
    const navigate = useNavigate();
    const { isAuthenticated, userRole } = useAuth();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("JOB_SEEKER"); // "JOB_SEEKER" | "RECRUITER"
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (isAuthenticated) {
            const currentRole = userRole || localStorage.getItem("userRole");
            if (currentRole === "RECRUITER" || currentRole === "ROLE_RECRUITER") {
                navigate("/recruiter/dashboard", { replace: true });
            } else {
                navigate("/jobseeker/jobs", { replace: true });
            }
        }
    }, [isAuthenticated, userRole, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);

        try {
            await registerUser({
                name: fullName.trim(),
                fullName: fullName.trim(),
                email: email.trim(),
                password,
                role,
            });

            setSuccess("Account successfully created! Redirecting to login...");
            setTimeout(() => {
                navigate("/login", { state: { prefilledEmail: email.trim() } });
            }, 1200);
        } catch (err) {
            console.error("Register error:", err);
            const serverMsg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                (typeof err?.response?.data === "string" ? err.response.data : null);
            setError(
                serverMsg ||
                "Failed to create account. Email may already be registered or invalid details."
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
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create an Account</h1>
                        <p className="text-xs text-slate-500">Join HireSphere as a job seeker or hiring partner</p>
                    </div>

                    {/* ROLE SELECTOR CARDS */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <button
                            type="button"
                            onClick={() => setRole("JOB_SEEKER")}
                            className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                                role === "JOB_SEEKER"
                                    ? "border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold shadow-xs"
                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            <FiUser size={18} className={role === "JOB_SEEKER" ? "text-indigo-600" : "text-slate-400"} />
                            <span>Job Seeker</span>
                            <span className="text-[10px] text-slate-400 font-normal">I want to find a job</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setRole("RECRUITER")}
                            className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                                role === "RECRUITER"
                                    ? "border-purple-600 bg-purple-50/50 text-purple-900 font-bold shadow-xs"
                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            <FiBriefcase size={18} className={role === "RECRUITER" ? "text-purple-600" : "text-slate-400"} />
                            <span>Employer</span>
                            <span className="text-[10px] text-slate-400 font-normal">I want to hire talent</span>
                        </button>
                    </div>

                    {error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700 flex items-center gap-2">
                            <FiAlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                            <FiCheck size={16} />
                            <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                        <div>
                            <label className="block font-bold text-slate-700 mb-1.5">Full Name</label>
                            <div className="relative">
                                <FiUser size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="e.g. Nilesh Borchate"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                />
                            </div>
                        </div>

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
                            <label className="block font-bold text-slate-700 mb-1.5">Password</label>
                            <div className="relative">
                                <FiLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="At least 6 characters"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01] disabled:opacity-50"
                        >
                            {loading ? "Registering..." : `Register as ${role === "RECRUITER" ? "Employer" : "Job Seeker"}`}
                        </button>
                    </form>

                    <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
                        Already have an account?{" "}
                        <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700 transition">
                            Sign In
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Register;
