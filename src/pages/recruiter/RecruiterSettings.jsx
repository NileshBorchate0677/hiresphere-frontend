import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FiUser,
    FiLock,
    FiSmartphone,
    FiCheckCircle,
    FiAlertCircle,
    FiLogOut,
    FiShield
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import {
    updateUserName,
    changePassword,
    getMySessions,
    terminateSession
} from "../../services/userService";
import { getAiSettings, saveAiSettings } from "../../utils/aiHelper";
import useAuth from "../../hooks/useAuth";

const RecruiterSettings = () => {
    const { user, logout } = useAuth();

    // AI Engine Settings
    const [aiConfig, setAiConfig] = useState(getAiSettings());
    const [aiSaved, setAiSaved] = useState(false);

    // Name update
    const [name, setName] = useState(user?.fullName || user?.name || "");
    const [nameSaving, setNameSaving] = useState(false);
    const [nameMsg, setNameMsg] = useState("");

    // Password change
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passSaving, setPassSaving] = useState(false);
    const [passMsg, setPassMsg] = useState({ type: "", text: "" });

    // Active Sessions
    const [sessions, setSessions] = useState([]);
    const [sessionsLoading, setSessionsLoading] = useState(true);

    useEffect(() => {
        if (user?.fullName || user?.name) {
            setName(user.fullName || user.name);
        }
    }, [user]);

    const loadSessions = async () => {
        try {
            setSessionsLoading(true);
            const data = await getMySessions();
            setSessions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load sessions:", err);
        } finally {
            setSessionsLoading(false);
        }
    };

    useEffect(() => {
        loadSessions();
    }, []);

    const handleUpdateName = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setNameSaving(true);
        setNameMsg("");
        try {
            await updateUserName(name.trim());
            setNameMsg("Recruiter display name updated successfully.");
            setTimeout(() => setNameMsg(""), 3000);
        } catch (err) {
            console.error("Name update error:", err);
            setNameMsg("Failed to update name.");
        } finally {
            setNameSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPassMsg({ type: "", text: "" });

        if (newPassword.length < 6) {
            setPassMsg({ type: "error", text: "New password must be at least 6 characters long." });
            return;
        }

        if (newPassword !== confirmPassword) {
            setPassMsg({ type: "error", text: "New passwords do not match." });
            return;
        }

        setPassSaving(true);
        try {
            await changePassword(oldPassword, newPassword);
            setPassMsg({ type: "success", text: "Password changed successfully! Keep it secure." });
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            console.error("Change pass error:", err);
            setPassMsg({
                type: "error",
                text: err?.response?.data?.message || "Failed to update password. Please check your existing password."
            });
        } finally {
            setPassSaving(false);
        }
    };

    const handleTerminateSession = async (sessionId) => {
        try {
            await terminateSession(sessionId);
            setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        } catch (err) {
            console.error("Terminate session error:", err);
            alert("Could not terminate session.");
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Recruiter Workspace Settings</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                    Manage your hiring team credentials, security, AI recruitment engine, and active login sessions
                </p>
            </div>

                {/* 1. IDENTITY */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                        <FiUser className="text-indigo-600" />
                        Employer Identity
                    </h3>

                    {nameMsg && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
                            {nameMsg}
                        </div>
                    )}

                    <form onSubmit={handleUpdateName} className="space-y-4 text-xs max-w-md">
                        <div>
                            <label className="block font-bold text-slate-700 mb-1.5">Recruiter Full Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 mb-1.5">Registered Email (Read Only)</label>
                            <input
                                type="email"
                                disabled
                                value={user?.email || ""}
                                className="w-full rounded-xl border border-slate-200 bg-slate-100/70 px-3.5 py-2.5 text-slate-500 cursor-not-allowed"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={nameSaving}
                            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2 text-xs font-bold text-white transition shadow-xs disabled:opacity-50"
                        >
                            {nameSaving ? "Saving..." : "Update Name"}
                        </button>
                    </form>
                </div>

                {/* 2. CHANGE PASSWORD */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                        <FiLock className="text-indigo-600" />
                        Change Password
                    </h3>

                    {passMsg.text && (
                        <div
                            className={`rounded-xl border p-3 text-xs font-semibold ${
                                passMsg.type === "success"
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                    : "border-red-200 bg-red-50 text-red-700"
                            }`}
                        >
                            {passMsg.text}
                        </div>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-4 text-xs max-w-md">
                        <div>
                            <label className="block font-bold text-slate-700 mb-1.5">Current Password</label>
                            <input
                                type="password"
                                required
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 mb-1.5">New Password</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="At least 6 characters"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 mb-1.5">Confirm New Password</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter new password"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={passSaving}
                            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2 text-xs font-bold text-white transition shadow-xs disabled:opacity-50"
                        >
                            {passSaving ? "Updating Password..." : "Update Password"}
                        </button>
                    </form>
                </div>

                {/* 3. ACTIVE LOGGED IN SESSIONS */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                        <FiSmartphone className="text-indigo-600" />
                        Active Logged In Sessions
                    </h3>

                    {sessionsLoading ? (
                        <div className="py-6 text-center text-xs text-slate-400">Loading active sessions...</div>
                    ) : sessions.length === 0 ? (
                        <p className="text-xs text-slate-500">Only this current workstation is logged in.</p>
                    ) : (
                        <div className="divide-y divide-slate-100 text-xs">
                            {sessions.map((sess) => (
                                <div key={sess.id} className="py-3 flex items-center justify-between gap-4">
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-slate-800">{sess.deviceInfo || "Browser Device"}</p>
                                        <p className="text-slate-400 text-[11px]">
                                            IP: {sess.ipAddress || "Localhost"} • Logged in: {new Date(sess.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleTerminateSession(sess.id)}
                                        className="rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 font-bold text-[11px] transition"
                                    >
                                        Terminate
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 4. AI RECRUITMENT ENGINE CONFIGURATION */}
                <div className="rounded-3xl border border-purple-200/80 bg-gradient-to-br from-purple-50/40 to-white p-6 sm:p-8 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <HiSparkles className="text-purple-600" />
                            Recruitment AI & LLM Engine Settings
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black uppercase">
                            {aiConfig.mode === "gemini" ? "Google Gemini LLM" : "HireSphere Fast AI"}
                        </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                        HireSphere uses AI for automated Job Description drafting, candidate-job match fit scoring, and 1-click technical interview invitation emails.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div
                            onClick={() => {
                                const updated = { ...aiConfig, mode: "local" };
                                setAiConfig(updated);
                                saveAiSettings(updated);
                                setAiSaved(true);
                                setTimeout(() => setAiSaved(false), 3000);
                            }}
                            className={`p-4 rounded-2xl border cursor-pointer transition ${
                                aiConfig.mode === "local"
                                    ? "border-purple-600 bg-purple-50/60 shadow-xs"
                                    : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900">⚡ Fast Local AI (Default)</span>
                                {aiConfig.mode === "local" && <FiCheckCircle className="text-purple-600" />}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">
                                100% free, runs instantly in browser, zero API keys required, ideal for day-to-day candidate screening.
                            </p>
                        </div>

                        <div
                            onClick={() => {
                                const updated = { ...aiConfig, mode: "gemini" };
                                setAiConfig(updated);
                                saveAiSettings(updated);
                                setAiSaved(true);
                                setTimeout(() => setAiSaved(false), 3000);
                            }}
                            className={`p-4 rounded-2xl border cursor-pointer transition ${
                                aiConfig.mode === "gemini"
                                    ? "border-purple-600 bg-purple-50/60 shadow-xs"
                                    : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900">✨ Google Gemini 1.5 Flash</span>
                                {aiConfig.mode === "gemini" && <FiCheckCircle className="text-purple-600" />}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">
                                Connects to Google Generative AI for deep contextual analysis & generative interview question sets.
                            </p>
                        </div>
                    </div>

                    {aiConfig.mode === "gemini" && (
                        <div className="space-y-1.5 pt-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                                Gemini API Key (Optional Override)
                            </label>
                            <input
                                type="password"
                                value={aiConfig.geminiApiKey || ""}
                                onChange={(e) => {
                                    const updated = { ...aiConfig, geminiApiKey: e.target.value };
                                    setAiConfig(updated);
                                    saveAiSettings(updated);
                                    setAiSaved(true);
                                    setTimeout(() => setAiSaved(false), 3000);
                                }}
                                placeholder="AIzaSy..."
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            />
                        </div>
                    )}

                    {aiSaved && (
                        <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <FiCheckCircle /> AI engine preferences saved!
                        </p>
                    )}
                </div>

                {/* 5. SIGN OUT */}
                <div className="rounded-3xl border border-red-200 bg-red-50/30 p-6 flex items-center justify-between text-xs">
                    <div>
                        <p className="font-bold text-red-900">Sign Out of Recruiter Workspace</p>
                        <p className="text-slate-500 text-[11px] mt-0.5">Terminate active employer session on this device.</p>
                    </div>
                    <button
                        type="button"
                        onClick={logout}
                        className="rounded-xl border border-red-300 bg-white hover:bg-red-50 text-red-600 px-4 py-2 font-bold shadow-xs transition"
                    >
                        Sign Out
                    </button>
                </div>
        </div>
    );
};

export default RecruiterSettings;
