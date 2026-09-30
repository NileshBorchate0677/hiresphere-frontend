import { useState, useEffect } from "react";
import {
    FiBriefcase,
    FiGlobe,
    FiMail,
    FiPhone,
    FiMapPin,
    FiUsers,
    FiCheckCircle,
    FiAlertCircle,
    FiEdit3,
    FiTrash2,
    FiExternalLink
} from "react-icons/fi";
import {
    getRecruiterProfile,
    createRecruiterProfile,
    updateRecruiterProfile,
    deleteRecruiterProfile
} from "../../services/recruiterService";

const RecruiterProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");

    const [formData, setFormData] = useState({
        companyName: "",
        companyDescription: "",
        location: "",
        industry: "Information Technology",
        companyEmail: "",
        companyPhone: "",
        website: "",
        companySize: 50,
    });

    const showToast = (text, type = "success") => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 4000);
    };

    const fetchProfile = async () => {
        setLoading(true);
        setApiError("");
        try {
            const data = await getRecruiterProfile();
            if (data && data.companyName) {
                setProfile(data);
                setFormData({
                    companyName: data.companyName || "",
                    companyDescription: data.companyDescription || "",
                    location: data.location || "",
                    industry: data.industry || "Information Technology",
                    companyEmail: data.companyEmail || "",
                    companyPhone: data.companyPhone || "",
                    website: data.website || "",
                    companySize: data.companySize || 50,
                });
            } else {
                setProfile(null);
                setIsEditing(true); // first-time setup
            }
        } catch (err) {
            console.warn("No existing recruiter profile found:", err);
            setProfile(null);
            setIsEditing(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.companyName || formData.companyName.trim().length < 2) {
            newErrors.companyName = "Company name must be at least 2 characters.";
        }
        if (!formData.companyDescription || formData.companyDescription.trim().length < 20) {
            newErrors.companyDescription = "Company description must be at least 20 characters.";
        }
        if (!formData.location || !formData.location.trim()) {
            newErrors.location = "Company location is required.";
        }
        if (!formData.industry || !formData.industry.trim()) {
            newErrors.industry = "Industry sector is required.";
        }
        if (!formData.companyEmail || !/\S+@\S+\.\S+/.test(formData.companyEmail)) {
            newErrors.companyEmail = "Valid company contact email is required.";
        }
        if (!formData.companyPhone || !/^[6-9]\d{9}$/.test(formData.companyPhone)) {
            newErrors.companyPhone = "Enter a valid 10-digit Indian phone number (starting with 6-9).";
        }
        if (!formData.website || !formData.website.trim()) {
            newErrors.website = "Company website URL is required.";
        }
        if (!formData.companySize || Number(formData.companySize) <= 0) {
            newErrors.companySize = "Company size must be greater than 0.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");

        if (!validate()) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                companyName: formData.companyName.trim(),
                companyDescription: formData.companyDescription.trim(),
                location: formData.location.trim(),
                industry: formData.industry.trim(),
                companyEmail: formData.companyEmail.trim(),
                companyPhone: formData.companyPhone.trim(),
                website: formData.website.trim(),
                companySize: Number(formData.companySize),
            };

            if (profile) {
                await updateRecruiterProfile(payload);
                showToast("Company profile updated successfully.");
            } else {
                await createRecruiterProfile(payload);
                showToast("Company profile created successfully.");
            }

            setIsEditing(false);
            fetchProfile();
        } catch (err) {
            console.error("Profile save error:", err);
            const msg =
                err.response?.data?.message ||
                err.response?.data ||
                "Failed to save profile. Please verify all fields.";
            setApiError(typeof msg === "string" ? msg : JSON.stringify(msg));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteRecruiterProfile();
            showToast("Company profile removed.");
            setProfile(null);
            setDeleteModalOpen(false);
            setIsEditing(true);
            setFormData({
                companyName: "",
                companyDescription: "",
                location: "",
                industry: "Information Technology",
                companyEmail: "",
                companyPhone: "",
                website: "",
                companySize: 50,
            });
        } catch (err) {
            console.error("Delete profile error:", err);
            showToast("Failed to delete company profile.", "error");
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
                <div className="h-8 w-48 bg-slate-200 rounded-xl" />
                <div className="h-64 bg-white rounded-3xl border border-slate-200" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* TOAST ALERT */}
                {toastMessage && (
                    <div
                        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold text-white transition-all transform animate-in slide-in-from-bottom-5 ${
                            toastMessage.type === "error" ? "bg-rose-600" : "bg-emerald-600"
                        }`}
                    >
                        {toastMessage.type === "error" ? <FiAlertCircle size={16} /> : <FiCheckCircle size={16} />}
                        <span>{toastMessage.text}</span>
                    </div>
                )}

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            Organization Profile
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Manage employer branding details displayed to candidates across job postings.
                        </p>
                    </div>

                    {profile && !isEditing && (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
                        >
                            <FiEdit3 size={14} />
                            Edit Profile
                        </button>
                    )}
                </div>

                {/* API ERROR BANNER */}
                {apiError && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800">
                        <FiAlertCircle className="text-rose-600 shrink-0" size={16} />
                        <span>{apiError}</span>
                    </div>
                )}

                {/* VIEW MODE: COMPANY BRAND CARD */}
                {profile && !isEditing ? (
                    <div className="space-y-6">
                        {/* Company Card Header */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white text-2xl font-black flex items-center justify-center shadow-md shadow-indigo-600/20">
                                        {profile.companyName ? profile.companyName.charAt(0).toUpperCase() : "C"}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-black text-slate-900">
                                                {profile.companyName}
                                            </h2>
                                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                                                Verified Employer
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {profile.industry} • {profile.location}
                                        </p>
                                    </div>
                                </div>

                                {profile.website && (
                                    <a
                                        href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold hover:text-indigo-600 hover:bg-slate-100 transition shadow-xs"
                                    >
                                        <FiGlobe size={14} />
                                        Visit Website
                                        <FiExternalLink size={12} />
                                    </a>
                                )}
                            </div>

                            {/* About the Company */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    About the Company
                                </h3>
                                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                                    {profile.companyDescription}
                                </p>
                            </div>

                            {/* Key Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                        <FiUsers size={12} />
                                        Company Size
                                    </span>
                                    <p className="text-xs font-bold text-slate-800">
                                        {profile.companySize}+ Employees
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                        <FiMapPin size={12} />
                                        Headquarters
                                    </span>
                                    <p className="text-xs font-bold text-slate-800">
                                        {profile.location}
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                        <FiMail size={12} />
                                        Official Email
                                    </span>
                                    <p className="text-xs font-bold text-slate-800 truncate">
                                        {profile.companyEmail}
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                        <FiPhone size={12} />
                                        Phone Contact
                                    </span>
                                    <p className="text-xs font-bold text-slate-800">
                                        {profile.companyPhone}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* DANGER ZONE */}
                        <div className="rounded-3xl border border-rose-100 bg-rose-50/30 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-bold text-rose-900">
                                    Remove Company Profile
                                </h3>
                                <p className="text-xs text-rose-600 mt-0.5">
                                    Deletes your organization branding and contact details from the platform.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDeleteModalOpen(true)}
                                className="px-4 py-2 rounded-xl border border-rose-200 bg-white text-rose-600 text-xs font-bold hover:bg-rose-50 transition"
                            >
                                Delete Profile
                            </button>
                        </div>
                    </div>
                ) : (
                    /* EDIT / SETUP FORM */
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                            <div className="border-b border-slate-100 pb-4">
                                <h2 className="text-base font-extrabold text-slate-900">
                                    {profile ? "Edit Organization Information" : "Setup Organization Profile"}
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Provide authentic company information for verification and job postings.
                                </p>
                            </div>

                            {/* Company Name & Industry */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                        Company Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        placeholder="e.g. Acme Technologies Pvt Ltd"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                                            errors.companyName ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                                        }`}
                                    />
                                    {errors.companyName && (
                                        <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.companyName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                        Industry / Sector <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="industry"
                                        placeholder="e.g. Software & Cloud Services, FinTech, E-Commerce"
                                        value={formData.industry}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                                            errors.industry ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                                        }`}
                                    />
                                    {errors.industry && (
                                        <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.industry}</p>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Company Story & Culture Description <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    name="companyDescription"
                                    rows={5}
                                    placeholder="Tell candidates about your company's mission, team culture, growth story, and work environment..."
                                    value={formData.companyDescription}
                                    onChange={handleChange}
                                    className={`w-full p-4 rounded-2xl bg-slate-50 border text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed ${
                                        errors.companyDescription ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                                    }`}
                                />
                                {errors.companyDescription && (
                                    <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.companyDescription}</p>
                                )}
                            </div>

                            {/* Location & Website */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                        Headquarters Location <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        placeholder="e.g. Pune, Maharashtra, India"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                                            errors.location ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                                        }`}
                                    />
                                    {errors.location && (
                                        <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.location}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                        Company Website URL <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="website"
                                        placeholder="e.g. https://www.acme.com"
                                        value={formData.website}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                                            errors.website ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                                        }`}
                                    />
                                    {errors.website && (
                                        <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.website}</p>
                                    )}
                                </div>
                            </div>

                            {/* Email, Phone & Size */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                        Official Contact Email <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="companyEmail"
                                        placeholder="e.g. careers@acme.com"
                                        value={formData.companyEmail}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                                            errors.companyEmail ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                                        }`}
                                    />
                                    {errors.companyEmail && (
                                        <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.companyEmail}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                        Company Phone (10 digits) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="companyPhone"
                                        placeholder="e.g. 9876543210"
                                        value={formData.companyPhone}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                                            errors.companyPhone ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                                        }`}
                                    />
                                    {errors.companyPhone && (
                                        <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.companyPhone}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                        Employee Headcount <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        name="companySize"
                                        value={formData.companySize}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                                            errors.companySize ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                                        }`}
                                    />
                                    {errors.companySize && (
                                        <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.companySize}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="flex items-center justify-end gap-3">
                            {profile && (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] disabled:opacity-50"
                            >
                                <FiCheckCircle size={15} />
                                {submitting ? "Saving Profile..." : "Save Organization Profile"}
                            </button>
                        </div>
                    </form>
                )}

                {/* DELETE CONFIRMATION MODAL */}
                {deleteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
                        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                                <FiTrash2 size={24} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">Delete Organization Profile?</h3>
                            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                This will remove your company branding from HireSphere. Your posted job openings will remain but without verified employer details.
                            </p>
                            <div className="mt-6 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setDeleteModalOpen(false)}
                                    disabled={deleting}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="px-4 py-2 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 transition"
                                >
                                    {deleting ? "Deleting..." : "Confirm Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
};

export default RecruiterProfile;
