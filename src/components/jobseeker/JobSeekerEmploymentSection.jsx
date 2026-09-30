import { useState, useEffect, useMemo } from "react";
import {
    FiBriefcase,
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiCheckCircle,
    FiAlertCircle,
    FiX,
    FiCalendar,
    FiMapPin,
    FiDollarSign,
    FiClock,
    FiZap,
    FiCheck,
    FiSearch
} from "react-icons/fi";
import {
    getJobSeekerExperiences,
    addJobSeekerExperience,
    updateJobSeekerExperience,
    deleteJobSeekerExperience
} from "../../services/jobSeekerService";
import {
    TOP_IT_COMPANIES_INDIA,
    IT_DESIGNATIONS,
    ALL_INDIA_IT_CITIES,
    IT_DEPARTMENTS,
    EMPLOYMENT_TYPES,
    NOTICE_PERIOD_OPTIONS,
    ALL_IT_SKILLS
} from "../../utils/naukriTaxonomy";

const EMPLOYMENT_BADGE_STYLES = {
    FULL_TIME: "bg-indigo-50 text-indigo-700 border-indigo-200",
    INTERNSHIP: "bg-sky-50 text-sky-700 border-sky-200",
    CONTRACT: "bg-amber-50 text-amber-800 border-amber-200",
    FREELANCE: "bg-purple-50 text-purple-700 border-purple-200"
};

const EMPLOYMENT_LABELS = {
    FULL_TIME: "Full-Time",
    INTERNSHIP: "Internship / Trainee",
    CONTRACT: "Contractual",
    FREELANCE: "Freelance"
};

const formatDateLabel = (dateStr) => {
    if (!dateStr) return "";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    } catch {
        return dateStr;
    }
};

const calculateDurationLabel = (startStr, endStr, isCurrent) => {
    if (!startStr) return "";
    const start = new Date(startStr);
    const end = isCurrent || !endStr ? new Date() : new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "";

    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (months < 1) months = 1;
    const yrs = Math.floor(months / 12);
    const remMos = months % 12;
    const parts = [];
    if (yrs > 0) parts.push(`${yrs} yr${yrs > 1 ? "s" : ""}`);
    if (remMos > 0) parts.push(`${remMos} mo${remMos > 1 ? "s" : ""}`);
    return parts.join(" ");
};

const JobSeekerEmploymentSection = ({ onEmploymentChange }) => {
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");
    const [feedback, setFeedback] = useState("");

    const [form, setForm] = useState({
        employmentType: "FULL_TIME",
        isCurrentJob: true,
        companyName: "",
        designation: "",
        department: "Engineering - Software & QA",
        location: "Pune",
        startDate: "2024-01-01",
        endDate: "",
        currentCtc: "",
        noticePeriod: "Immediate / Serving Notice",
        techStackList: [],
        responsibilities: ""
    });

    // Searchable dropdown states inside modal
    const [companyQuery, setCompanyQuery] = useState("");
    const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
    const [roleQuery, setRoleQuery] = useState("");
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [skillInput, setSkillInput] = useState("");
    const [showSkillDropdown, setShowSkillDropdown] = useState(false);

    const fetchExperiences = async () => {
        setLoading(true);
        try {
            const data = await getJobSeekerExperiences();
            const list = Array.isArray(data) ? data : [];
            const sorted = [...list].sort((a, b) => {
                if (a.isCurrentJob && !b.isCurrentJob) return -1;
                if (!a.isCurrentJob && b.isCurrentJob) return 1;
                return (b.startDate || "").localeCompare(a.startDate || "");
            });
            setExperiences(sorted);
            if (onEmploymentChange) onEmploymentChange(sorted);
        } catch (err) {
            console.warn("Could not load employment records:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExperiences();
    }, []);

    const filteredCompanies = useMemo(() => {
        const q = (companyQuery || form.companyName || "").toLowerCase().trim();
        if (!q) return TOP_IT_COMPANIES_INDIA.slice(0, 15);
        return TOP_IT_COMPANIES_INDIA.filter((c) => c.toLowerCase().includes(q)).slice(0, 15);
    }, [companyQuery, form.companyName]);

    const filteredDesignations = useMemo(() => {
        const q = (roleQuery || form.designation || "").toLowerCase().trim();
        if (!q) return IT_DESIGNATIONS.slice(0, 15);
        return IT_DESIGNATIONS.filter((d) => d.toLowerCase().includes(q)).slice(0, 15);
    }, [roleQuery, form.designation]);

    const filteredSkills = useMemo(() => {
        const q = skillInput.toLowerCase().trim();
        if (!q) return ALL_IT_SKILLS.filter((s) => !form.techStackList.includes(s)).slice(0, 12);
        return ALL_IT_SKILLS.filter(
            (s) => s.toLowerCase().includes(q) && !form.techStackList.includes(s)
        ).slice(0, 12);
    }, [skillInput, form.techStackList]);

    const openAddModal = (presetType = "FULL_TIME", presetCurrent = false) => {
        setEditingItem(null);
        setError("");
        setForm({
            employmentType: presetType,
            isCurrentJob: presetCurrent,
            companyName: "",
            designation: presetType === "INTERNSHIP" ? "Software Engineering Intern" : "",
            department: "Engineering - Software & QA",
            location: "Pune",
            startDate: "2024-06-01",
            endDate: presetCurrent ? "" : "2025-06-01",
            currentCtc: "",
            noticePeriod: "30 Days (1 Month)",
            techStackList: [],
            responsibilities: ""
        });
        setCompanyQuery("");
        setRoleQuery("");
        setSkillInput("");
        setModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setError("");
        const parsedSkills = item.techStack
            ? item.techStack.split(",").map((s) => s.trim()).filter(Boolean)
            : [];
        setForm({
            employmentType: item.employmentType || "FULL_TIME",
            isCurrentJob: Boolean(item.isCurrentJob),
            companyName: item.companyName || "",
            designation: item.designation || "",
            department: item.department || "Engineering - Software & QA",
            location: item.location || "Pune",
            startDate: item.startDate || "2023-07-01",
            endDate: item.endDate || "",
            currentCtc: item.currentCtc !== null && item.currentCtc !== undefined ? String(item.currentCtc) : "",
            noticePeriod: item.noticePeriod || "30 Days (1 Month)",
            techStackList: parsedSkills,
            responsibilities: item.responsibilities || ""
        });
        setCompanyQuery(item.companyName || "");
        setRoleQuery(item.designation || "");
        setSkillInput("");
        setModalOpen(true);
    };

    const addRoleSkill = (skill) => {
        const cleaned = skill.trim();
        if (!cleaned) return;
        if (!form.techStackList.some((s) => s.toLowerCase() === cleaned.toLowerCase())) {
            setForm((prev) => ({
                ...prev,
                techStackList: [...prev.techStackList, cleaned]
            }));
        }
        setSkillInput("");
        setShowSkillDropdown(false);
    };

    const removeRoleSkill = (skillToRemove) => {
        setForm((prev) => ({
            ...prev,
            techStackList: prev.techStackList.filter((s) => s !== skillToRemove)
        }));
    };

    const generateAiRoleResponsibilities = () => {
        const role = form.designation || "Software Engineer";
        const company = form.companyName || "the organization";
        const skills =
            form.techStackList.length > 0
                ? form.techStackList.slice(0, 5).join(", ")
                : "Java, Spring Boot, React.js, REST APIs, and SQL";

        const aiText = `• Engineered and maintained scalable production modules as ${role} at ${company} utilizing ${skills}.\n• Collaborated with cross-functional agile teams to design high-availability microservices, reducing API response latency by 25%.\n• Performed code reviews, automated unit/integration testing, and CI/CD deployment pipelines to ensure zero-downtime releases.`;
        setForm((prev) => ({ ...prev, responsibilities: aiText }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.companyName.trim()) {
            setError("Please select or enter Company Name.");
            return;
        }
        if (!form.designation.trim()) {
            setError("Please select or enter Designation / Job Title.");
            return;
        }
        if (!form.startDate) {
            setError("Please specify Joining / Start Date.");
            return;
        }

        const ctcNum = form.currentCtc ? parseFloat(String(form.currentCtc).replace(/[^0-9.]/g, "")) : null;

        const payload = {
            companyName: form.companyName.trim(),
            designation: form.designation.trim(),
            location: form.location.trim() || "Pune",
            employmentType: form.employmentType,
            department: form.department,
            isCurrentJob: Boolean(form.isCurrentJob),
            startDate: form.startDate,
            endDate: form.isCurrentJob ? null : (form.endDate || null),
            currentCtc: !isNaN(ctcNum) ? ctcNum : null,
            noticePeriod: form.isCurrentJob ? form.noticePeriod : null,
            techStack: form.techStackList.join(", "),
            responsibilities: form.responsibilities.trim()
        };

        setSaving(true);
        try {
            if (editingItem && editingItem.id) {
                await updateJobSeekerExperience(editingItem.id, payload);
                setFeedback(`Updated employment at ${payload.companyName}`);
            } else {
                await addJobSeekerExperience(payload);
                setFeedback(`Added ${payload.companyName} to your employment history`);
            }
            setModalOpen(false);
            await fetchExperiences();
            setTimeout(() => setFeedback(""), 3500);
        } catch (err) {
            console.error("Save employment error:", err);
            const msg =
                err.response?.data?.message ||
                "Please save your Basic Profile once before adding Employment history.";
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        const id = item.id;
        if (!id) return;
        setDeletingId(id);
        try {
            await deleteJobSeekerExperience(id);
            setFeedback(`Removed ${item.companyName} from employment history`);
            await fetchExperiences();
            setTimeout(() => setFeedback(""), 3000);
        } catch (err) {
            console.error("Delete employment error:", err);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-5">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                            <FiBriefcase size={18} />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                Employment & Work Experience
                                <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-extrabold text-indigo-700 uppercase">
                                    Multi-Company Timeline
                                </span>
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Add your current organization, previous IT companies, and internships so recruiters can filter your profile by company & role.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => openAddModal("FULL_TIME", experiences.length === 0)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-black text-white shadow-sm shadow-indigo-600/20 transition cursor-pointer shrink-0"
                >
                    <FiPlus size={15} />
                    Add Employment
                </button>
            </div>

            {/* FEEDBACK BANNER */}
            {feedback && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-xs font-bold text-emerald-800 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <FiCheckCircle className="text-emerald-600 shrink-0" size={15} />
                        {feedback}
                    </span>
                    <button type="button" onClick={() => setFeedback("")} className="text-emerald-700">
                        <FiX size={14} />
                    </button>
                </div>
            )}

            {/* QUICK ADD PROMPTS */}
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                    Quick Add:
                </span>
                <button
                    type="button"
                    onClick={() => openAddModal("FULL_TIME", true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-400 px-3 py-1.5 text-xs font-bold text-indigo-700 transition cursor-pointer"
                >
                    <FiPlus size={12} />
                    Current Company
                </button>
                <button
                    type="button"
                    onClick={() => openAddModal("FULL_TIME", false)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 hover:bg-indigo-50 hover:border-indigo-300 px-3 py-1.5 text-xs font-bold text-slate-700 transition cursor-pointer"
                >
                    <FiPlus size={12} className="text-indigo-600" />
                    Previous Company
                </button>
                <button
                    type="button"
                    onClick={() => openAddModal("INTERNSHIP", false)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-sky-200 bg-sky-50/50 hover:bg-sky-50 hover:border-sky-400 px-3 py-1.5 text-xs font-bold text-sky-700 transition cursor-pointer"
                >
                    <FiPlus size={12} />
                    Internship / Industrial Training
                </button>
            </div>

            {/* EMPLOYMENT CARDS LIST */}
            {loading ? (
                <div className="grid grid-cols-1 gap-3">
                    {[1, 2].map((n) => (
                        <div key={n} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
                    ))}
                </div>
            ) : experiences.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-7 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                        <FiBriefcase size={22} />
                    </div>
                    <h4 className="text-sm font-black text-slate-800">
                        No Employment or Internship Added Yet
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                        Experienced candidates can add their current and past IT companies. Freshers can add academic or industrial internships to boost recruiter search visibility by 3x.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2.5 mt-4">
                        <button
                            type="button"
                            onClick={() => openAddModal("FULL_TIME", true)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                        >
                            <FiPlus size={13} /> Add Full-Time Job
                        </button>
                        <button
                            type="button"
                            onClick={() => openAddModal("INTERNSHIP", false)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition cursor-pointer"
                        >
                            <FiPlus size={13} /> Add Internship
                        </button>
                    </div>
                </div>
            ) : (
                <div className="relative space-y-3.5 before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200/80">
                    {experiences.map((exp) => {
                        const badgeStyle =
                            EMPLOYMENT_BADGE_STYLES[exp.employmentType] ||
                            EMPLOYMENT_BADGE_STYLES.FULL_TIME;
                        const typeLabel =
                            EMPLOYMENT_LABELS[exp.employmentType] || "Full-Time";
                        const duration = calculateDurationLabel(
                            exp.startDate,
                            exp.endDate,
                            exp.isCurrentJob
                        );
                        const skillsArr = exp.techStack
                            ? exp.techStack.split(",").map((s) => s.trim()).filter(Boolean)
                            : [];

                        return (
                            <div
                                key={exp.id}
                                className="relative pl-11 group"
                            >
                                {/* Timeline Node */}
                                <div
                                    className={`absolute left-3 top-5 w-4 h-4 rounded-full border-2 shadow-xs z-10 transition ${
                                        exp.isCurrentJob
                                            ? "bg-emerald-500 border-white ring-4 ring-emerald-100"
                                            : "bg-white border-indigo-600 group-hover:bg-indigo-600"
                                    }`}
                                />

                                <div className="rounded-2xl border border-slate-200/90 bg-slate-50/40 hover:bg-white hover:border-indigo-200 hover:shadow-md p-4 sm:p-5 transition-all">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                        <div className="space-y-1.5">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${badgeStyle}`}
                                                >
                                                    {typeLabel}
                                                </span>
                                                {exp.isCurrentJob && (
                                                    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-black text-emerald-700 uppercase">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        Current Organization
                                                    </span>
                                                )}
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500">
                                                    <FiCalendar size={12} className="text-slate-400" />
                                                    {formatDateLabel(exp.startDate)} —{" "}
                                                    {exp.isCurrentJob ? "Present" : formatDateLabel(exp.endDate) || "Completed"}
                                                    {duration && (
                                                        <span className="text-indigo-600 font-black ml-1">
                                                            ({duration})
                                                        </span>
                                                    )}
                                                </span>
                                            </div>

                                            <h4 className="text-sm sm:text-base font-black text-slate-900">
                                                {exp.designation}
                                            </h4>

                                            <p className="text-xs sm:text-sm font-bold text-slate-700 flex flex-wrap items-center gap-x-3 gap-y-1">
                                                <span>{exp.companyName}</span>
                                                {exp.location && (
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                                                        <FiMapPin size={12} className="text-slate-400" />
                                                        {exp.location}
                                                    </span>
                                                )}
                                                {exp.department && (
                                                    <span className="text-xs font-medium text-slate-400">
                                                        • {exp.department}
                                                    </span>
                                                )}
                                            </p>

                                            {/* CTC & Notice Period pills for Current Job */}
                                            {(exp.currentCtc || exp.noticePeriod) && (
                                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                                    {exp.currentCtc && (
                                                        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                                                            <FiDollarSign size={11} className="text-emerald-600" />
                                                            CTC: ₹ {exp.currentCtc} LPA
                                                        </span>
                                                    )}
                                                    {exp.noticePeriod && (
                                                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                                                            <FiClock size={11} />
                                                            Notice: {exp.noticePeriod}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Key Skills Used */}
                                            {skillsArr.length > 0 && (
                                                <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                                                    <span className="text-[10px] font-extrabold uppercase text-slate-400 mr-1">
                                                        Key Skills:
                                                    </span>
                                                    {skillsArr.map((skill) => (
                                                        <span
                                                            key={skill}
                                                            className="rounded-lg bg-indigo-50/80 border border-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Job Profile / Responsibilities */}
                                            {exp.responsibilities && (
                                                <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed pt-1.5">
                                                    {exp.responsibilities}
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(exp)}
                                                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition cursor-pointer"
                                            >
                                                <FiEdit2 size={12} />
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                disabled={deletingId === exp.id}
                                                onClick={() => handleDelete(exp)}
                                                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-2.5 py-1.5 text-xs font-bold text-slate-500 transition cursor-pointer disabled:opacity-50"
                                                title="Delete Employment"
                                            >
                                                <FiTrash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ADD / EDIT MODAL */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl space-y-5 my-8 max-h-[92vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">
                                    {editingItem ? "Edit Employment Details" : "Add Employment / Work Experience"}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Select from standardized Indian IT companies, roles, and skills for accurate Recruiter Search matching.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
                            >
                                <FiX size={16} />
                            </button>
                        </div>

                        {error && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-bold text-red-700 flex items-center gap-2">
                                <FiAlertCircle size={16} className="shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* 1. Employment Type & Current Employment Toggle */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Employment Type *
                                    </label>
                                    <select
                                        value={form.employmentType}
                                        onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    >
                                        {EMPLOYMENT_TYPES.map((t) => (
                                            <option key={t.value} value={t.value}>
                                                {t.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Is this your Current Employment? *
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, isCurrentJob: true })}
                                            className={`rounded-xl py-2.5 text-xs font-black transition cursor-pointer ${
                                                form.isCurrentJob
                                                    ? "bg-indigo-600 text-white shadow-xs"
                                                    : "text-slate-600 hover:text-slate-900"
                                            }`}
                                        >
                                            Yes, Working Here
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, isCurrentJob: false })}
                                            className={`rounded-xl py-2.5 text-xs font-black transition cursor-pointer ${
                                                !form.isCurrentJob
                                                    ? "bg-slate-800 text-white shadow-xs"
                                                    : "text-slate-600 hover:text-slate-900"
                                            }`}
                                        >
                                            No, Previous Job
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Company Name with Standardized All-India IT Company Autocomplete */}
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Company / Organization Name *{" "}
                                    <span className="text-[11px] font-normal text-slate-400">
                                        (Search 100+ IT Companies or type your own)
                                    </span>
                                </label>
                                <div className="relative">
                                    <FiSearch className="absolute left-3.5 top-3.5 text-slate-400" size={14} />
                                    <input
                                        type="text"
                                        value={form.companyName}
                                        onFocus={() => setShowCompanyDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowCompanyDropdown(false), 180)}
                                        onChange={(e) => {
                                            setForm({ ...form, companyName: e.target.value });
                                            setCompanyQuery(e.target.value);
                                            setShowCompanyDropdown(true);
                                        }}
                                        placeholder="e.g. Tata Consultancy Services (TCS), Persistent Systems, Infosys..."
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-9 pr-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    />
                                </div>
                                {showCompanyDropdown && filteredCompanies.length > 0 && (
                                    <div className="absolute z-30 mt-1 w-full max-h-48 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl p-1.5">
                                        {filteredCompanies.map((comp) => (
                                            <button
                                                key={comp}
                                                type="button"
                                                onMouseDown={() => {
                                                    setForm({ ...form, companyName: comp });
                                                    setCompanyQuery(comp);
                                                    setShowCompanyDropdown(false);
                                                }}
                                                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center justify-between transition cursor-pointer"
                                            >
                                                <span>{comp}</span>
                                                <span className="text-[10px] font-bold text-indigo-500">Select</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 3. Designation & Department */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="relative">
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Current / Job Designation *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.designation}
                                        onFocus={() => setShowRoleDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowRoleDropdown(false), 180)}
                                        onChange={(e) => {
                                            setForm({ ...form, designation: e.target.value });
                                            setRoleQuery(e.target.value);
                                            setShowRoleDropdown(true);
                                        }}
                                        placeholder="e.g. Software Engineer, Full Stack Developer..."
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    />
                                    {showRoleDropdown && filteredDesignations.length > 0 && (
                                        <div className="absolute z-30 mt-1 w-full max-h-48 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl p-1.5">
                                            {filteredDesignations.map((role) => (
                                                <button
                                                    key={role}
                                                    type="button"
                                                    onMouseDown={() => {
                                                        setForm({ ...form, designation: role });
                                                        setRoleQuery(role);
                                                        setShowRoleDropdown(false);
                                                    }}
                                                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition cursor-pointer"
                                                >
                                                    {role}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Department / Functional Area
                                    </label>
                                    <select
                                        value={form.department}
                                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    >
                                        {IT_DEPARTMENTS.map((dept) => (
                                            <option key={dept} value={dept}>
                                                {dept}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* 4. Work Location (All-India IT Cities) & Dates */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Job Location (India IT Hub)
                                    </label>
                                    <input
                                        type="text"
                                        list="employment-it-cities"
                                        value={form.location}
                                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                                        placeholder="Select or type city..."
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    />
                                    <datalist id="employment-it-cities">
                                        {ALL_INDIA_IT_CITIES.map((city) => (
                                            <option key={city} value={city} />
                                        ))}
                                    </datalist>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Joining Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={form.startDate}
                                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        {form.isCurrentJob ? "Working Till" : "Worked Till (End Date)"}
                                    </label>
                                    {form.isCurrentJob ? (
                                        <div className="w-full rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs font-black text-emerald-700 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                            Present (Currently Working)
                                        </div>
                                    ) : (
                                        <input
                                            type="date"
                                            value={form.endDate}
                                            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* 5. Current CTC & Notice Period (If Current Job) */}
                            {form.isCurrentJob && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 p-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Current Annual Salary / CTC (in LPA)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            value={form.currentCtc}
                                            onChange={(e) => setForm({ ...form, currentCtc: e.target.value })}
                                            placeholder="e.g. 6.5"
                                            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-600 transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Notice Period / Availability
                                        </label>
                                        <select
                                            value={form.noticePeriod}
                                            onChange={(e) => setForm({ ...form, noticePeriod: e.target.value })}
                                            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-600 transition"
                                        >
                                            {NOTICE_PERIOD_OPTIONS.map((np) => (
                                                <option key={np} value={np}>
                                                    {np}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* 6. Key Skills Used in this Role */}
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Key IT Skills Used in this Role
                                </label>
                                {form.techStackList.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        {form.techStackList.map((skill) => (
                                            <span
                                                key={skill}
                                                className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 text-white px-2.5 py-1 text-xs font-bold"
                                            >
                                                {skill}
                                                <button
                                                    type="button"
                                                    onClick={() => removeRoleSkill(skill)}
                                                    className="hover:text-indigo-200 cursor-pointer"
                                                >
                                                    <FiX size={12} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <input
                                    type="text"
                                    value={skillInput}
                                    onFocus={() => setShowSkillDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowSkillDropdown(false), 180)}
                                    onChange={(e) => {
                                        setSkillInput(e.target.value);
                                        setShowSkillDropdown(true);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addRoleSkill(skillInput);
                                        }
                                    }}
                                    placeholder="Search IT skills used (e.g. Java, Spring Boot, React.js, AWS) & press Enter..."
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                />
                                {showSkillDropdown && filteredSkills.length > 0 && (
                                    <div className="absolute z-30 mt-1 w-full max-h-40 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl p-2 flex flex-wrap gap-1.5">
                                        {filteredSkills.map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onMouseDown={() => addRoleSkill(s)}
                                                className="rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white px-2.5 py-1 text-xs font-bold text-slate-700 transition cursor-pointer"
                                            >
                                                + {s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 7. Job Profile / Responsibilities with AI Writer */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-bold text-slate-700">
                                        Job Profile & Key Achievements
                                    </label>
                                    <button
                                        type="button"
                                        onClick={generateAiRoleResponsibilities}
                                        className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 text-[11px] font-bold text-indigo-700 transition cursor-pointer"
                                    >
                                        <FiZap size={11} />
                                        AI Write Impact Bullets
                                    </button>
                                </div>
                                <textarea
                                    rows={3}
                                    value={form.responsibilities}
                                    onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
                                    placeholder="Describe your key responsibilities, architecture built, and measurable impact..."
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-5 py-2.5 text-xs font-bold text-slate-600 transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-6 py-2.5 text-xs font-black text-white shadow-lg shadow-indigo-600/25 transition cursor-pointer"
                            >
                                <FiCheck size={14} />
                                {saving ? "Saving..." : editingItem ? "Update Employment" : "Save Employment"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobSeekerEmploymentSection;
