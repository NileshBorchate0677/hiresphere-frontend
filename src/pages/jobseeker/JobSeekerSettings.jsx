import { useEffect, useState } from "react";
import {
    FiSettings,
    FiUser,
    FiLock,
    FiSmartphone,
    FiCheckCircle,
    FiAlertCircle,
    FiLogOut,
    FiTrash2,
    FiShield,
    FiX,
    FiClock
} from "react-icons/fi";
import {
    updateUserName,
    changePassword,
    getMySessions,
    terminateSession,
    deleteAccount
} from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const JobSeekerSettings = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

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

    // Delete account modal
    const [deletePass, setDeletePass] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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
            setNameMsg("Display name updated successfully.");
            setTimeout(() => setNameMsg(""), 3500);
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
            setPassMsg({ type: "error", text: "New password and confirmation do not match." });
            return;
        }

        setPassSaving(true);
        try {
            await changePassword(oldPassword, newPassword);
            setPassMsg({ type: "success", text: "Password changed successfully! Keep it confidential." });
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => setPassMsg({ type: "", text: "" }), 4000);
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

    const handleDeleteAccount = async () => {
        if (!deletePass) return;
        setDeleting(true);
        try {
            await deleteAccount(deletePass);
            logout();
            navigate("/");
        } catch (err) {
            console.error("Delete account error:", err);
            alert("Failed to delete account. Please verify your password.");
            setDeleting(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans animate-in fade-in duration-300">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Account & Security Settings
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Manage your credentials, authentication preferences, and active browser sessions
                </p>
            </div>

            {/* 1. Account Identity */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-5">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <FiUser className="text-indigo-600" />
                    Account Identity
                </h3>

                {nameMsg && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                        <FiCheckCircle size={16} className="text-emerald-600 shrink-0" />
                        <span>{nameMsg}</span>
                    </div>
                )}

                <form onSubmit={handleUpdateName} className="space-y-4 text-xs max-w-md">
                    <div>
                        <label className="block font-bold text-slate-700 mb-1.5">Full Name</label>
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
                            className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-slate-500 cursor-not-allowed"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={nameSaving}
                        className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 font-bold transition shadow-xs disabled:opacity-50"
                    >
                        {nameSaving ? "Saving..." : "Update Name"}
                    </button>
                </form>
            </div>

            {/* 2. Password & Security */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-5">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <FiLock className="text-indigo-600" />
                    Security & Password
                </h3>

                {passMsg.text && (
                    <div
                        className={`rounded-2xl border p-3.5 text-xs font-semibold flex items-center gap-2 ${
                            passMsg.type === "success"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                : "border-rose-200 bg-rose-50 text-rose-700"
                        }`}
                    >
                        {passMsg.type === "success" ? (
                            <FiCheckCircle size={16} className="shrink-0 text-emerald-600" />
                        ) : (
                            <FiAlertCircle size={16} className="shrink-0 text-rose-600" />
                        )}
                        <span>{passMsg.text}</span>
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
                            placeholder="Enter current password"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                        />
                    </div>

                    <div>
                        <label className="block font-bold text-slate-700 mb-1.5">New Password</label>
                        <input
                            type="password"
                            required
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
                        className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 font-bold transition shadow-xs disabled:opacity-50"
                    >
                        {passSaving ? "Updating Password..." : "Change Password"}
                    </button>
                </form>
            </div>

            {/* 3. Active Sessions */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <FiSmartphone className="text-indigo-600" />
                        Active Sessions & Devices ({sessions.length})
                    </h3>
                    <button
                        type="button"
                        onClick={loadSessions}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                    >
                        Refresh
                    </button>
                </div>

                {sessionsLoading ? (
                    <div className="py-6 text-center text-xs text-slate-400">Loading sessions...</div>
                ) : sessions.length === 0 ? (
                    <p className="text-xs text-slate-500">No other active device sessions found.</p>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {sessions.map((sess) => (
                            <div key={sess.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                                <div className="space-y-0.5">
                                    <p className="font-bold text-slate-800">
                                        {sess.deviceInfo || sess.userAgent || "Web Browser"}
                                    </p>
                                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                                        <FiClock size={10} />
                                        IP: {sess.ipAddress || "Current Device"}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleTerminateSession(sess.id)}
                                    className="rounded-xl border border-slate-200 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 px-3 py-1.5 font-bold transition text-[11px]"
                                >
                                    Revoke
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 4. Danger Zone */}
            <div className="rounded-3xl border border-rose-200/80 bg-rose-50/30 p-6 sm:p-8 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-rose-700 flex items-center gap-2">
                    <FiTrash2 className="text-rose-600" />
                    Danger Zone
                </h3>
                <p className="text-xs text-slate-600 max-w-xl">
                    Once you delete your account, all your profile details, application history, and bookmarks will be permanently removed.
                </p>
                <button
                    type="button"
                    onClick={() => setDeleteModalOpen(true)}
                    className="rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 text-xs font-bold transition shadow-xs"
                >
                    Delete Candidate Account
                </button>
            </div>

            {/* Delete Account Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900">Confirm Account Deletion</h3>
                            <button
                                type="button"
                                onClick={() => setDeleteModalOpen(false)}
                                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100"
                            >
                                <FiX size={16} />
                            </button>
                        </div>

                        <p className="text-xs text-slate-600">
                            Please enter your current account password to confirm permanent deletion of your profile.
                        </p>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={deletePass}
                            onChange={(e) => setDeletePass(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-rose-600"
                        />

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeleteModalOpen(false)}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteAccount}
                                disabled={deleting || !deletePass}
                                className="rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 text-xs font-bold disabled:opacity-50"
                            >
                                {deleting ? "Deleting..." : "Permanently Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobSeekerSettings;
