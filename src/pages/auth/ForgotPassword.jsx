import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { FiMail, FiArrowLeft, FiCheck, FiLock, FiKey, FiAlertCircle, FiCheckCircle, FiEye, FiEyeOff, FiZap } from "react-icons/fi";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import { forgotPassword, resetPassword } from "../../services/authService";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialToken = searchParams.get("token") || "";

    // Steps: 1 = Request OTP, 2 = Enter OTP & New Password, 3 = Completed
    const [step, setStep] = useState(initialToken ? 2 : 1);
    const [email, setEmail] = useState("");
    const [token, setToken] = useState(initialToken);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [infoMessage, setInfoMessage] = useState("");
    const [generatedOtp, setGeneratedOtp] = useState("");

    useEffect(() => {
        if (initialToken) {
            setToken(initialToken);
            setGeneratedOtp(initialToken);
            setStep(2);
        }
    }, [initialToken]);

    const handleRequestToken = async (e) => {
        e.preventDefault();
        setError("");
        setInfoMessage("");
        setLoading(true);

        try {
            const data = await forgotPassword(email.trim());
            setInfoMessage(data.message || "A 6-digit verification code has been dispatched.");
            if (data.resetToken) {
                setGeneratedOtp(data.resetToken);
                setToken(data.resetToken);
            }
            setStep(2);
        } catch (err) {
            console.error("Forgot password request error:", err);
            const msg = err.response?.data?.message || err.response?.data || "Failed to process password reset request.";
            setError(typeof msg === "string" ? msg : JSON.stringify(msg));
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");

        if (!token.trim()) {
            setError("6-digit verification OTP code is required.");
            return;
        }

        if (newPassword.length < 6) {
            setError("New password must be at least 6 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await resetPassword(token.trim(), newPassword);
            setStep(3);
        } catch (err) {
            console.error("Reset password error:", err);
            const msg = err.response?.data?.message || err.response?.data || "Failed to reset password. Please check your verification code.";
            setError(typeof msg === "string" ? msg : JSON.stringify(msg));
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
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                            {step === 3 ? <FiCheckCircle size={26} className="text-emerald-600" /> : <FiKey size={24} />}
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            {step === 1 && "Forgot Your Password?"}
                            {step === 2 && "Enter Verification Code"}
                            {step === 3 && "Password Successfully Reset!"}
                        </h1>
                        <p className="text-xs text-slate-500">
                            {step === 1 && "Enter your registered email address to receive your 6-digit recovery code."}
                            {step === 2 && "Enter the 6-digit verification OTP and choose a strong new password."}
                            {step === 3 && "Your credentials have been updated securely. You can now sign in."}
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                            <FiAlertCircle size={16} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* STEP 1: ENTER REGISTERED EMAIL */}
                    {step === 1 && (
                        <form onSubmit={handleRequestToken} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                                    Registered Email Address
                                </label>
                                <div className="relative">
                                    <FiMail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="e.g. nilesh.borchate.jobseeker@gmail.com"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-xs font-bold text-white transition shadow-md shadow-indigo-600/20 disabled:opacity-50"
                            >
                                {loading ? "Generating 6-Digit OTP..." : "Send Verification Code"}
                            </button>

                            <div className="pt-2 text-center space-y-2">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="text-xs font-semibold text-indigo-600 hover:underline"
                                >
                                    Already have a 6-digit OTP code? Click here
                                </button>
                                <p className="text-[11px] text-slate-400">
                                    Don't have an account yet?{" "}
                                    <Link to="/register" className="font-bold text-indigo-600 hover:underline">
                                        Sign up here
                                    </Link>
                                </p>
                            </div>
                        </form>
                    )}

                    {/* STEP 2: ENTER OTP & NEW PASSWORD */}
                    {step === 2 && (
                        <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
                            {/* DEMO / LOCAL TESTING CALLOUT */}
                            {generatedOtp && (
                                <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-indigo-900 space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                                            <FiZap size={13} className="text-amber-500 fill-amber-500" />
                                            Instant Verification Code
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setToken(generatedOtp)}
                                            className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition shadow-2xs"
                                        >
                                            Auto-Fill OTP
                                        </button>
                                    </div>
                                    <p className="text-xs">
                                        Your 6-digit OTP is:{" "}
                                        <span className="font-mono font-black text-sm bg-white px-2 py-0.5 rounded border border-indigo-200 text-indigo-800 tracking-widest">
                                            {generatedOtp}
                                        </span>
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                                    6-Digit Verification OTP
                                </label>
                                <div className="relative">
                                    <FiKey size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        maxLength={10}
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                        placeholder="Enter 6-digit code (e.g. 482910)"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 font-mono text-base font-bold text-slate-900 tracking-wider outline-none focus:bg-white focus:border-indigo-600 transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                                        New Password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-[11px] text-slate-400 hover:text-indigo-600 font-semibold flex items-center gap-1"
                                    >
                                        {showPassword ? <FiEyeOff size={12} /> : <FiEye size={12} />}
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                                <div className="relative">
                                    <FiLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new strong password"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <FiLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter new password"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-xs font-bold text-white transition shadow-md shadow-indigo-600/20 disabled:opacity-50"
                            >
                                {loading ? "Updating Security Credentials..." : "Confirm & Set New Password"}
                            </button>

                            <div className="text-center pt-2">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-xs font-semibold text-slate-500 hover:text-indigo-600"
                                >
                                    ← Need to change email or request a new code?
                                </button>
                            </div>
                        </form>
                    )}

                    {/* STEP 3: SUCCESS STATE */}
                    {step === 3 && (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 text-center text-xs space-y-4">
                            <FiCheck size={36} className="mx-auto text-emerald-600 p-2 bg-emerald-100 rounded-full" />
                            <div className="space-y-1">
                                <h3 className="text-sm font-extrabold text-emerald-950">
                                    Password Successfully Changed!
                                </h3>
                                <p className="text-slate-600">
                                    Your account password has been updated securely. All previous active sessions have been invalidated for security.
                                </p>
                            </div>

                            <Link
                                to="/login"
                                className="inline-block w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-bold text-white transition shadow-md shadow-emerald-600/20"
                            >
                                Sign In With New Password
                            </Link>
                        </div>
                    )}

                    <div className="pt-4 border-t border-slate-100 text-center">
                        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition">
                            <FiArrowLeft size={14} />
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ForgotPassword;
