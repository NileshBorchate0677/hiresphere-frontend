import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
    FiBell,
    FiCheck,
    FiCheckCircle,
    FiClock,
    FiBriefcase,
    FiArrowRight,
    FiAward,
    FiStar,
    FiXCircle,
    FiEye,
    FiTrendingUp,
    FiFilter,
    FiExternalLink
} from "react-icons/fi";
import {
    getMyNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    deleteNotification,
    clearAllNotifications
} from "../../services/notificationService";

const JobSeekerNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    // Tabs: ALL | APPLICATIONS | RECRUITER_ACTIONS | JOB_RECOMMENDATIONS | UNREAD
    const [activeTab, setActiveTab] = useState("ALL");

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await getMyNotifications();
            const notifs = Array.isArray(data) ? data : [];
            setNotifications(notifs);
        } catch (err) {
            console.error("Fetch notifications error:", err);
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
        // optimistic update first
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

    // Classify Notification into Category
    const getNotificationCategory = (notif) => {
        if (notif.category) return notif.category;
        const type = String(notif.type || "").toUpperCase();
        if (type.startsWith("APPLICATION_") || type === "NEW_APPLICATION") {
            return "APPLICATIONS";
        }
        const text = String(notif.message || notif.title || "").toLowerCase();
        if (text.includes("shortlist") || text.includes("accept") || text.includes("hired") || text.includes("reject") || text.includes("applied") || text.includes("application")) {
            return "APPLICATIONS";
        }
        if (text.includes("viewed") || text.includes("recruiter") || text.includes("downloaded") || text.includes("resume")) {
            return "RECRUITER_ACTIONS";
        }
        if (text.includes("match") || text.includes("recommended") || text.includes("new job") || text.includes("opening")) {
            return "JOB_RECOMMENDATIONS";
        }
        return "APPLICATIONS";
    };

    const unreadCount = notifications.filter((n) => !(n.read || n.isRead)).length;

    // Filter by Active Tab
    const displayedNotifications = useMemo(() => {
        return notifications.filter((n) => {
            const isUnread = !(n.read || n.isRead);
            if (activeTab === "UNREAD") return isUnread;
            if (activeTab === "APPLICATIONS") return getNotificationCategory(n) === "APPLICATIONS";
            if (activeTab === "RECRUITER_ACTIONS") return getNotificationCategory(n) === "RECRUITER_ACTIONS";
            if (activeTab === "JOB_RECOMMENDATIONS") return getNotificationCategory(n) === "JOB_RECOMMENDATIONS";
            return true;
        });
    }, [notifications, activeTab]);

    const getNotificationStyling = (msg, customType) => {
        const text = String(msg || "").toLowerCase();
        const type = String(customType || "").toUpperCase();

        if (type === "APPLICATION_SUBMITTED" || text.includes("applied") || text.includes("submitted")) {
            return {
                icon: <FiCheckCircle size={16} className="text-blue-600" />,
                bg: "bg-blue-50 border-blue-200",
                badgeBg: "bg-blue-100 text-blue-800",
                label: "Application Submitted"
            };
        }
        if (type === "APPLICATION_SHORTLISTED" || type === "SHORTLISTED" || text.includes("shortlist")) {
            return {
                icon: <FiStar size={16} className="text-purple-600" />,
                bg: "bg-purple-50 border-purple-200",
                badgeBg: "bg-purple-100 text-purple-800",
                label: "Shortlisted"
            };
        }
        if (type === "APPLICATION_ACCEPTED" || type === "ACCEPTED" || text.includes("accept") || text.includes("offer") || text.includes("hired")) {
            return {
                icon: <FiAward size={16} className="text-emerald-600" />,
                bg: "bg-emerald-50 border-emerald-200",
                badgeBg: "bg-emerald-100 text-emerald-800",
                label: "Offer / Accepted"
            };
        }
        if (type === "APPLICATION_REJECTED" || text.includes("reject") || text.includes("not selected")) {
            return {
                icon: <FiXCircle size={16} className="text-rose-600" />,
                bg: "bg-rose-50 border-rose-200",
                badgeBg: "bg-rose-100 text-rose-800",
                label: "Application Update"
            };
        }
        if (type === "PROFILE_VIEW" || text.includes("viewed") || text.includes("recruiter")) {
            return {
                icon: <FiEye size={16} className="text-amber-600" />,
                bg: "bg-amber-50 border-amber-200",
                badgeBg: "bg-amber-100 text-amber-800",
                label: "Profile Viewed"
            };
        }
        if (type === "JOB_MATCH" || text.includes("job match") || text.includes("recommended")) {
            return {
                icon: <FiTrendingUp size={16} className="text-blue-600" />,
                bg: "bg-blue-50 border-blue-200",
                badgeBg: "bg-blue-100 text-blue-800",
                label: "Job Recommendation"
            };
        }
        return {
            icon: <FiBriefcase size={16} className="text-indigo-600" />,
            bg: "bg-indigo-50 border-indigo-200",
            badgeBg: "bg-indigo-100 text-indigo-800",
            label: "Notification"
        };
    };

    const formatRelativeTime = (isoString) => {
        if (!isoString) return "Recently";
        try {
            const diff = Date.now() - new Date(isoString).getTime();
            const mins = Math.floor(diff / (1000 * 60));
            if (mins < 1) return "Just now";
            if (mins < 60) return `${mins}m ago`;
            const hours = Math.floor(mins / 60);
            if (hours < 24) return `${hours}h ago`;
            const days = Math.floor(hours / 24);
            if (days === 1) return "Yesterday";
            if (days < 7) return `${days}d ago`;
            return new Date(isoString).toLocaleDateString();
        } catch {
            return "Recently";
        }
    };

    return (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans animate-in fade-in duration-300">
            {/* 1. NAUKRI-STYLE BANNER HEADER */}
            <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-950/10">
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-indigo-500/20 px-3 py-0.5 text-[11px] font-semibold text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                Naukri Communication Center
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                            Candidate Alerts & Notifications
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                            Real-time status tracking from active recruiters, shortlist decisions, and AI skill recommendations.
                        </p>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={handleMarkAllRead}
                            className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs font-bold text-white transition backdrop-blur-md self-start sm:self-auto"
                        >
                            <FiCheck size={14} className="text-emerald-400" />
                            Mark All Read ({unreadCount})
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClearAll}
                            className="inline-flex items-center gap-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-400/20 px-4 py-2.5 text-xs font-bold text-rose-300 transition backdrop-blur-md self-start sm:self-auto"
                        >
                            <FiXCircle size={14} />
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* 2. NAUKRI CATEGORY TABS */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200 overflow-x-auto text-xs font-bold">
                {[
                    { key: "ALL", label: "All Alerts", count: notifications.length },
                    { key: "APPLICATIONS", label: "Application Updates", count: notifications.filter(n => getNotificationCategory(n) === "APPLICATIONS").length },
                    { key: "RECRUITER_ACTIONS", label: "Recruiter Activity", count: notifications.filter(n => getNotificationCategory(n) === "RECRUITER_ACTIONS").length },
                    { key: "JOB_RECOMMENDATIONS", label: "Job Recommendations", count: notifications.filter(n => getNotificationCategory(n) === "JOB_RECOMMENDATIONS").length },
                    { key: "UNREAD", label: `Unread (${unreadCount})`, count: unreadCount, isBadge: true }
                ].map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-2 ${
                            activeTab === tab.key
                                ? "bg-white text-indigo-600 shadow-xs border border-slate-200/60"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                        }`}
                    >
                        <span>{tab.label}</span>
                        {tab.count > 0 && !tab.isBadge && (
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                                activeTab === tab.key ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-600"
                            }`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* 3. NOTIFICATION LIST */}
            {loading ? (
                <div className="py-20 text-center text-xs font-semibold text-slate-400">
                    Loading your notifications and recruiter updates...
                </div>
            ) : displayedNotifications.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                        <FiBell size={24} />
                    </div>
                    <h3 className="text-base font-black text-slate-800">
                        {activeTab === "UNREAD" ? "All Caught Up!" : "No Notifications in this Category"}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        {activeTab === "UNREAD"
                            ? "You have reviewed all your hiring alerts. Check back as recruiters review your profile."
                            : "New hiring milestones, profile reviews, and AI recommendations will appear here."}
                    </p>
                    <Link
                        to="/jobseeker/jobs"
                        className="inline-block rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition"
                    >
                        Explore 100+ Live Jobs
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {displayedNotifications.map((notif) => {
                        const isRead = notif.read || notif.isRead;
                        const messageText = notif.message || notif.title || "Application status updated";
                        const style = getNotificationStyling(messageText, notif.type);
                        const displayTitle = notif.title || style.label;
                        const timeAgo = formatRelativeTime(notif.createdAt);
                        const actionUrl = notif.actionUrl || "/jobseeker/applications";

                        return (
                            <div
                                key={notif.id}
                                className={`rounded-3xl border p-5 transition duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                                    isRead
                                        ? "bg-white border-slate-200/80 shadow-2xs hover:border-slate-300"
                                        : "bg-indigo-50/40 border-indigo-200 shadow-xs hover:border-indigo-300 ring-1 ring-indigo-500/10"
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Company Avatar / Icon */}
                                    <div
                                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-2xs font-bold ${style.bg}`}
                                    >
                                        {style.icon}
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${style.badgeBg}`}>
                                                {style.label}
                                            </span>
                                            {notif.title && (
                                                <span className="text-[11px] font-bold text-slate-700">
                                                    {notif.title}
                                                </span>
                                            )}
                                            {!isRead && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-black uppercase">
                                                    New
                                                </span>
                                            )}
                                        </div>

                                        <p className={`text-xs ${isRead ? "text-slate-700 font-medium" : "text-slate-900 font-bold"}`}>
                                            {notif.message || notif.title}
                                        </p>

                                        <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-0.5">
                                            <FiClock size={11} />
                                            {timeAgo}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                                    <Link
                                        to={actionUrl}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3.5 py-2 rounded-xl bg-indigo-50/80 hover:bg-indigo-100 transition shadow-2xs"
                                    >
                                        <span>View Details</span>
                                        <FiArrowRight size={13} />
                                    </Link>

                                    {!isRead && (
                                        <button
                                            type="button"
                                            onClick={() => handleMarkSingleRead(notif.id)}
                                            className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                                        >
                                            Mark Read
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        title="Dismiss notification"
                                        onClick={() => handleDismiss(notif.id)}
                                        className="text-xs font-bold text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition"
                                    >
                                        <FiXCircle size={15} />
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

export default JobSeekerNotifications;
