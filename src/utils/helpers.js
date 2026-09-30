// ================================
// FORMAT DATE
// ================================

export const formatDate = (date) => {
    if (!date) {
        return "";
    }

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};


// ================================
// FORMAT DATE & TIME
// ================================

export const formatDateTime = (date) => {
    if (!date) {
        return "";
    }

    return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};


// ================================
// CAPITALIZE FIRST LETTER
// ================================

export const capitalize = (value) => {
    if (!value) {
        return "";
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
};


// ================================
// FORMAT JOB TYPE
// ================================

export const formatJobType = (jobType) => {
    if (!jobType) {
        return "";
    }

    return jobType
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
};


// ================================
// FORMAT APPLICATION STATUS
// ================================

export const formatApplicationStatus = (status) => {
    if (!status) {
        return "";
    }

    return status
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
};


// ================================
// VALIDATE EMAIL
// ================================

export const isValidEmail = (email) => {
    if (!email) {
        return false;
    }

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);
};


// ================================
// VALIDATE PASSWORD
// ================================

export const isValidPassword = (password) => {
    return Boolean(password && password.length >= 8);
};


// ================================
// GET API ERROR MESSAGE
// ================================

export const getErrorMessage = (error) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Something went wrong. Please try again."
    );
};


// ================================
// CHECK EMPTY VALUE
// ================================

export const isEmpty = (value) => {
    return (
        value === null ||
        value === undefined ||
        value === ""
    );
};


// ================================
// FORMAT SALARY
// ================================

export const formatSalary = (minSalary, maxSalary) => {
    if (!minSalary && !maxSalary) {
        return "Not disclosed";
    }

    if (minSalary && maxSalary) {
        return `₹${minSalary} - ₹${maxSalary}`;
    }

    if (minSalary) {
        return `₹${minSalary}+`;
    }

    return `Up to ₹${maxSalary}`;
};


// ================================
// FORMAT SALARY IN LPA
// ================================

export const formatSalaryLPA = (minSalary, maxSalary) => {
    if (!minSalary && !maxSalary) {
        return "Competitive";
    }
    const minLPA = minSalary ? (minSalary / 100000).toFixed(1) : null;
    const maxLPA = maxSalary ? (maxSalary / 100000).toFixed(1) : null;

    if (minLPA && maxLPA) {
        return `₹${minLPA} - ₹${maxLPA} LPA`;
    }
    if (minLPA) {
        return `From ₹${minLPA} LPA`;
    }
    return `Up to ₹${maxLPA} LPA`;
};


// ================================
// PARSE SAFE DATE
// ================================

export const parseSafeDate = (val) => {
    if (!val) return null;
    if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
    if (Array.isArray(val) && val.length >= 3) {
        return new Date(val[0], val[1] - 1, val[2], val[3] || 0, val[4] || 0, val[5] || 0);
    }
    if (typeof val === "string") {
        const normalized = val.replace(/(\.\d{3})\d+/, "$1").replace(" ", "T");
        const parsed = new Date(normalized);
        if (!isNaN(parsed.getTime())) return parsed;
        const direct = new Date(val);
        if (!isNaN(direct.getTime())) return direct;
    }
    return null;
};


// ================================
// CALCULATE JOB FRESHNESS
// ================================

export const getJobFreshness = (createdAt) => {
    const created = parseSafeDate(createdAt);
    if (!created) {
        return {
            label: "Recently posted",
            timeAgo: "Recently",
            diffHours: 0,
            diffDays: 0,
            isNew: false,
            badgeClass: "bg-slate-100 text-slate-700 border-slate-200"
        };
    }

    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - created.getTime());
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const intHours = Math.floor(diffHours);
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) {
        return {
            label: "⚡ Just now",
            timeAgo: "Just now",
            diffHours: intHours,
            diffDays,
            isNew: true,
            badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200"
        };
    }
    if (diffMins < 60) {
        return {
            label: `⚡ ${diffMins}m ago`,
            timeAgo: `${diffMins}m ago`,
            diffHours: intHours,
            diffDays,
            isNew: true,
            badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200"
        };
    }
    if (intHours < 24) {
        return {
            label: `⚡ ${intHours}h ago`,
            timeAgo: `${intHours} hours ago`,
            diffHours: intHours,
            diffDays,
            isNew: true,
            badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200"
        };
    }
    if (diffDays === 1) {
        return {
            label: "🕒 1 day ago",
            timeAgo: "1 day ago",
            diffHours: intHours,
            diffDays,
            isNew: true,
            badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200"
        };
    }
    if (diffDays <= 7) {
        return {
            label: `🕒 ${diffDays} days ago`,
            timeAgo: `${diffDays} days ago`,
            diffHours: intHours,
            diffDays,
            isNew: false,
            badgeClass: "bg-blue-50 text-blue-700 border-blue-200"
        };
    }
    if (diffDays <= 30) {
        const weeks = Math.max(1, Math.floor(diffDays / 7));
        return {
            label: `📅 ${weeks} ${weeks === 1 ? "week" : "weeks"} ago`,
            timeAgo: `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`,
            diffHours: intHours,
            diffDays,
            isNew: false,
            badgeClass: "bg-slate-100 text-slate-700 border-slate-200"
        };
    }

    const months = Math.floor(diffDays / 30);
    return {
        label: `📅 ${months > 0 ? `${months}mo ago` : created.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`,
        timeAgo: created.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
        diffHours: intHours,
        diffDays,
        isNew: false,
        badgeClass: "bg-slate-100 text-slate-600 border-slate-200"
    };
};