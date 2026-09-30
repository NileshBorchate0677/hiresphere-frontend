import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
    FiBell,
    FiCheck,
    FiClock,
    FiUsers,
    FiBriefcase,
    FiCheckCircle,
    FiArrowRight,
    FiUserCheck,
    FiTrendingUp,
    FiFileText,
    FiEye,
    FiInbox,
    FiXCircle
} from "react-icons/fi";
import {
    getMyNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    deleteNotification,
    clearAllNotifications
} from "../../services/notificationService";

const getRelativeTime = (dateStr) => {
    if (!dateStr) return "Recently";
    try {
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now - d;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHr = Math.floor(diffMin / 60);
        const diffDays = Math.floor(diffHr / 24);

        if (diffSec < 60) return "Just now";
        if (diffMin < 60) return `${diffMin}m ago`;
        if (diffHr < 24) return `${diffHr}h ago`;
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays}d ago`;
        return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    } catch {
        return "Recently";
    }
};

const RecruiterNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("ALL"); // ALL | APPLICANTS | PIPELINE | JOBS | UNREAD

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await getMyNotifications();
            const notifs = Array.isArray(data) ? data : [];
            setNotifications(notifs);
        } catch (err) {
            console.error("Fetch recruiter notifications error:", err);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsAsRead().catch(() => {});
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read: true, isRead: true }))
            );
        } catch (err) {
            console.error("Mark all read error:", err);
        }
    };

    const handleMarkSingleRead = async (id) => {
        try {
            await markNotificationAsRead(id).catch(() => {});
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true, isRead: true } : n))
            );
        } catch (err) {
            console.error("Mark single read error:", err);
        }
    };

    const handleDismiss = async (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        try {
            await deleteNotification(id).catch(() => {});
        } catch (err) {
            console.error("Delete notification error:", err);
        }
    };

    const handleClearAll = async () => {
        setNotifications([]);
        try {
            await clearAllNotifications().catch(() => {});
        } catch (err) {
            console.error("Clear all notifications error:", err);
        }
    };

    // Filter Logic
    const unreadCount = notifications.filter((n) => !(n.read || n.isRead)).length;
    const applicantCount = notifications.filter((n) => {
        const cat = (n.category || "").toUpperCase();
        const msg = (n.message || "").toLowerCase();
        return cat === "APPLICANTS" || msg.includes("applied") || msg.includes("application");
    }).length;
    const pipelineCount = notifications.filter((n) => {
        const cat = (n.category || "").toUpperCase();
        const msg = (n.message || "").toLowerCase();
        return cat === "PIPELINE" || msg.includes("shortlist") || msg.includes("accepted") || msg.includes("offer");
    }).length;
    const jobCount = notifications.filter((n) => {
        const cat = (n.category || "").toUpperCase();
        const msg = (n.message || "").toLowerCase();
        return cat === "JOBS" || msg.includes("performance") || msg.includes("views") || msg.includes("opening");
    }).length;

    const filteredNotifications = useMemo(() => {
        return notifications.filter((n) => {
            const isRead = Boolean(n.read || n.isRead);
            const msg = (n.message || "").toLowerCase();
            const cat = (n.category || "").toUpperCase();

            if (activeTab === "UNREAD") return !isRead;
            if (activeTab === "APPLICANTS") {
                return cat === "APPLICANTS" || msg.includes("applied") || msg.includes("application");
            }
            if (activeTab === "PIPELINE") {
                return cat === "PIPELINE" || msg.includes("shortlist") || msg.includes("accepted") || msg.includes("offer");
            }
            if (activeTab === "JOBS") {
                return cat === "JOBS" || msg.includes("performance") || msg.includes("views") || msg.includes("opening");
            }
            return true; // ALL
        });
    }, [notifications, activeTab]);

    return (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans animate-in fade-in duration-300">
            {/* 1. HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20">
                            <FiBell size={20} />
                        </span>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Employer Notification Hub
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                Live candidate submissions, interview milestones, and job performance telemetry
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={handleMarkAllRead}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 transition shadow-2xs"
                        >
                            <FiCheck size={14} className="text-purple-600" />
                            Mark All Read
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClearAll}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 text-xs font-bold text-rose-600 transition shadow-2xs"
                        >
                            <FiXCircle size={14} />
                            Clear All
                        </button>
                    )}
                    <Link
                        to="/recruiter/applications"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:scale-[1.02]"
                    >
                        <FiUsers size={14} />
                        View All Applicants
                    </Link>
                </div>
            </div>

            {/* 2. NAUKRI RECRUITER CATEGORY TABS */}
            <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-3 overflow-x-auto text-xs font-bold">
                <button
                    type="button"
                    onClick={() => setActiveTab("ALL")}
                    className={`px-4 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
                        activeTab === "ALL"
                            ? "bg-purple-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                    }`}
                >
                    <FiInbox size={13} />
                    All Alerts ({notifications.length})
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("APPLICANTS")}
                    className={`px-4 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
                        activeTab === "APPLICANTS"
                            ? "bg-purple-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                    }`}
                >
                    <FiUsers size={13} />
                    New Applicants ({applicantCount})
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("PIPELINE")}
                    className={`px-4 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
                        activeTab === "PIPELINE"
                            ? "bg-purple-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                    }`}
                >
                    <FiUserCheck size={13} />
                    Pipeline & Decisions ({pipelineCount})
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("JOBS")}
                    className={`px-4 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
                        activeTab === "JOBS"
                            ? "bg-purple-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                    }`}
                >
                    <FiTrendingUp size={13} />
                    Job Performance ({jobCount})
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("UNREAD")}
                    className={`px-4 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
                        activeTab === "UNREAD"
                            ? "bg-purple-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                    }`}
                >
                    <FiBell size={13} />
                    Unread ({unreadCount})
                </button>
            </div>

            {/* 3. NOTIFICATION CARDS LIST */}
            {loading ? (
                <div className="py-20 text-center text-xs font-semibold text-slate-400">
                    Loading employer alerts...
                </div>
            ) : filteredNotifications.length === 0 ? (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-14 text-center space-y-3 shadow-xs">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                        <FiBell size={22} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                        {activeTab === "UNREAD"
                            ? "No Unread Notifications"
                            : `No Alerts in "${activeTab}" Category`}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        You're up to date! Incoming candidate applications and pipeline decisions will appear here instantly.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredNotifications.map((notif) => {
                        const isRead = Boolean(notif.read || notif.isRead);
                        const relTime = getRelativeTime(notif.createdAt);
                        const initial = (notif.candidateName || notif.role || "C").charAt(0).toUpperCase();

                        return (
                            <div
                                key={notif.id}
                                className={`rounded-2xl border p-4.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                                    isRead
                                        ? "bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs"
                                        : "bg-purple-50/40 border-purple-200 hover:border-purple-300 shadow-xs"
                                }`}
                            >
                                <div className="flex items-start gap-3.5">
                                    {/* Candidate Initials Avatar */}
                                    <div
                                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-sm font-black shadow-xs ${
                                            isRead
                                                ? "bg-slate-100 text-slate-700"
                                                : "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white"
                                        }`}
                                    >
                                        {initial}
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {notif.type === "NEW_APPLICATION" && (
                                                <span className="rounded-full bg-purple-100 text-purple-700 px-2 py-0.5 text-[10px] font-bold uppercase">
                                                    New Candidate
                                                </span>
                                            )}
                                            {notif.type === "INTERVIEW_ACCEPTED" && (
                                                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold uppercase">
                                                    Offer / Accepted
                                                </span>
                                            )}
                                            {notif.type === "SHORTLISTED" && (
                                                <span className="rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.5 text-[10px] font-bold uppercase">
                                                    Shortlisted
                                                </span>
                                            )}
                                            {notif.type === "PERFORMANCE" && (
                                                <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold uppercase">
                                                    Performance
                                                </span>
                                            )}
                                            {!isRead && (
                                                <span className="w-2 h-2 rounded-full bg-purple-600 inline-block"></span>
                                            )}
                                            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                                                <FiClock size={10} />
                                                {relTime}
                                            </span>
                                        </div>

                                        <p
                                            className={`text-xs leading-relaxed ${
                                                isRead ? "text-slate-700 font-medium" : "text-slate-900 font-bold"
                                            }`}
                                        >
                                            {notif.message || notif.title}
                                        </p>

                                        {notif.role && (
                                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium pt-0.5">
                                                <span className="flex items-center gap-1 text-purple-700 font-bold">
                                                    <FiBriefcase size={11} />
                                                    {notif.role}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                    <Link
                                        to={notif.actionUrl || "/recruiter/applications"}
                                        className="inline-flex items-center gap-1 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200/80 px-3 py-1.5 text-xs font-bold text-purple-800 transition"
                                    >
                                        Review Details
                                        <FiArrowRight size={12} />
                                    </Link>

                                    {!isRead && (
                                        <button
                                            type="button"
                                            onClick={() => handleMarkSingleRead(notif.id)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition"
                                            title="Mark as Read"
                                        >
                                            <FiCheck size={14} />
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        title="Dismiss notification"
                                        onClick={() => handleDismiss(notif.id)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                    >
                                        <FiXCircle size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default RecruiterNotifications;
