import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FiBell, FiCheck, FiCheckCircle, FiClock, FiX } from "react-icons/fi";
import {
    getMyNotifications,
    getUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "../../services/notificationService";
import { useAuth } from "../../context/AuthContext";

const NotificationsDropdown = () => {
    const { isAuthenticated, userRole, user } = useAuth();
    const isRecruiter = userRole === "RECRUITER" || user?.role === "RECRUITER";
    const allNotifsUrl = isRecruiter ? "/recruiter/notifications" : "/jobseeker/notifications";
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const fetchUnread = async () => {
        if (!isAuthenticated) return;
        try {
            const count = await getUnreadCount();
            setUnreadCount(typeof count === "number" ? count : 0);
        } catch {
            // Silently fail if unauthenticated or network drop
        }
    };

    const fetchAll = async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const data = await getMyNotifications();
            setNotifications(Array.isArray(data) ? data : []);
            const unread = (data || []).filter((n) => !n.isRead && !n.read).length;
            setUnreadCount(unread);
        } catch (err) {
            console.error("Notifications fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchUnread();
            const interval = setInterval(fetchUnread, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (open) {
            fetchAll();
        }
    }, [open]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkOne = async (id, e) => {
        e.stopPropagation();
        try {
            await markNotificationAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Mark read error:", err);
        }
    };

    const handleMarkAll = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true, read: true }))
            );
            setUnreadCount(0);
        } catch (err) {
            console.error("Mark all read error:", err);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="relative p-2.5 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors focus:outline-none"
                title="Notifications"
            >
                <FiBell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-100 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between pb-3 px-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAll}
                                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 py-1">
                        {loading ? (
                            <div className="py-8 text-center text-xs text-slate-400">
                                Loading notifications...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-8 text-center text-xs text-slate-400">
                                <FiBell size={24} className="mx-auto mb-2 text-slate-300" />
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map((n) => {
                                const isUnread = !n.isRead && !n.read;
                                return (
                                    <div
                                        key={n.id}
                                        className={`p-3 rounded-xl transition flex items-start justify-between gap-3 ${
                                            isUnread ? "bg-indigo-50/40" : "hover:bg-slate-50"
                                        }`}
                                    >
                                        <div className="space-y-1 flex-1">
                                            <p className="text-xs font-bold text-slate-900 leading-tight">
                                                {n.title || "Alert"}
                                            </p>
                                            <p className="text-[11px] text-slate-600 leading-relaxed">
                                                {n.message}
                                            </p>
                                            {n.createdAt && (
                                                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                                                    <FiClock size={10} />
                                                    {new Date(n.createdAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>

                                        {isUnread && (
                                            <button
                                                type="button"
                                                onClick={(e) => handleMarkOne(n.id, e)}
                                                className="p-1 rounded text-slate-400 hover:text-indigo-600"
                                                title="Mark as read"
                                            >
                                                <FiCheck size={14} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* FOOTER LINK */}
                    <div className="pt-2 mt-1 border-t border-slate-100 text-center">
                        <Link
                            to={allNotifsUrl}
                            onClick={() => setOpen(false)}
                            className="inline-flex items-center justify-center w-full py-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50/50 rounded-lg transition"
                        >
                            View All Notifications Hub →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsDropdown;
