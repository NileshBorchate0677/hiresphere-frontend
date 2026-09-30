import { useState, useEffect } from "react";
import {
    FiBookOpen,
    FiAward,
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiCheckCircle,
    FiAlertCircle,
    FiX,
    FiCalendar,
    FiCheck
} from "react-icons/fi";
import {
    getJobSeekerEducation,
    addJobSeekerEducation,
    updateJobSeekerEducation,
    deleteJobSeekerEducation
} from "../../services/jobSeekerService";
import { INDIAN_COLLEGES_AND_UNIVERSITIES } from "../../utils/naukriTaxonomy";

const EDUCATION_LEVEL_ORDER = {
    POST_GRADUATION: 1,
    GRADUATION: 2,
    DIPLOMA: 3,
    TWELFTH: 4,
    TENTH: 5,
    OTHER: 6
};

const EDUCATION_LEVEL_CONFIG = {
    TENTH: {
        label: "Class 10th (SSC)",
        badge: "bg-amber-50 text-amber-800 border-amber-200",
        defaultDegree: "10th Standard (SSC)",
        boardHint: "e.g. Maharashtra State Board (MSBSHSE), CBSE, ICSE",
        schoolHint: "e.g. Saraswati High School"
    },
    TWELFTH: {
        label: "Class 12th (HSC)",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        defaultDegree: "12th Standard (HSC - Science)",
        boardHint: "e.g. Maharashtra State Board (MSBSHSE), CBSE",
        schoolHint: "e.g. Fergusson Junior College"
    },
    DIPLOMA: {
        label: "Diploma / Polytechnic",
        badge: "bg-sky-50 text-sky-700 border-sky-200",
        defaultDegree: "Diploma in Computer Engineering",
        boardHint: "e.g. MSBTE Mumbai / Autonomous Board",
        schoolHint: "e.g. Government Polytechnic"
    },
    GRADUATION: {
        label: "Graduation / Bachelor's",
        badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
        defaultDegree: "B.Tech Computer Science & Engineering",
        boardHint: "e.g. Savitribai Phule Pune University (SPPU), Mumbai University",
        schoolHint: "e.g. Pune Institute of Computer Technology (PICT)"
    },
    POST_GRADUATION: {
        label: "Post Graduation / Master's",
        badge: "bg-purple-50 text-purple-700 border-purple-200",
        defaultDegree: "M.Tech / MCA (Computer Applications)",
        boardHint: "e.g. Savitribai Phule Pune University (SPPU), IIT, NIT",
        schoolHint: "e.g. Department of Computer Science, SPPU"
    },
    OTHER: {
        label: "Doctorate / Other",
        badge: "bg-slate-100 text-slate-700 border-slate-200",
        defaultDegree: "Ph.D / Special Certification",
        boardHint: "e.g. University / Accreditation Board",
        schoolHint: "e.g. Research Institution"
    }
};

const SUGGESTED_DEGREES = {
    TENTH: ["10th Standard (SSC)", "10th Standard (CBSE)", "10th Standard (ICSE)"],
    TWELFTH: ["12th Standard (HSC - Science)", "12th Standard (HSC - Commerce)", "12th Standard (HSC - Arts)"],
    DIPLOMA: ["Diploma in Computer Engineering", "Diploma in Information Technology", "Diploma in Mechanical Engineering"],
    GRADUATION: ["B.Tech Computer Science & Engg", "B.E. Information Technology", "BCA (Computer Applications)", "B.Sc Computer Science"],
    POST_GRADUATION: ["MCA (Master of Computer Applications)", "M.Tech Computer Science", "M.Sc Computer Science", "MBA (Information Technology)"],
    OTHER: ["Ph.D in Computer Science", "Post-Doctoral Fellowship"]
};

const JobSeekerEducationSection = ({ onEducationChange }) => {
    const [educations, setEducations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        educationLevel: "GRADUATION",
        degree: "",
        institution: "",
        university: "",
        passingYear: new Date().getFullYear(),
        score: "",
        scoreType: "PERCENTAGE"
    });

    const fetchEducationList = async () => {
        setLoading(true);
        try {
            const data = await getJobSeekerEducation();
            const list = Array.isArray(data) ? data : [];
            // Sort chronologically: highest level down to 10th
            list.sort((a, b) => {
                const orderA = EDUCATION_LEVEL_ORDER[a.educationLevel] || 99;
                const orderB = EDUCATION_LEVEL_ORDER[b.educationLevel] || 99;
                if (orderA !== orderB) return orderA - orderB;
                return (b.passingYear || 0) - (a.passingYear || 0);
            });
            setEducations(list);
            if (onEducationChange) {
                onEducationChange(list);
            }
        } catch (err) {
            console.warn("Could not fetch candidate education list:", err);
            setEducations([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEducationList();
    }, []);

    const openAddModal = (preselectedLevel = "GRADUATION") => {
        const config = EDUCATION_LEVEL_CONFIG[preselectedLevel] || EDUCATION_LEVEL_CONFIG.GRADUATION;
        setEditingItem(null);
        setFormData({
            educationLevel: preselectedLevel,
            degree: config.defaultDegree || "",
            institution: "",
            university: "",
            passingYear: new Date().getFullYear(),
            score: "",
            scoreType: "PERCENTAGE"
        });
        setErrorMsg("");
        setModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormData({
            educationLevel: item.educationLevel || "GRADUATION",
            degree: item.degree || "",
            institution: item.institution || "",
            university: item.university || "",
            passingYear: item.passingYear || new Date().getFullYear(),
            score: item.score !== undefined ? String(item.score) : "",
            scoreType: item.scoreType || "PERCENTAGE"
        });
        setErrorMsg("");
        setModalOpen(true);
    };

    const handleLevelSelect = (lvl) => {
        const config = EDUCATION_LEVEL_CONFIG[lvl] || {};
        setFormData((prev) => ({
            ...prev,
            educationLevel: lvl,
            degree: config.defaultDegree || prev.degree
        }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        if (!formData.degree.trim()) {
            setErrorMsg("Degree / Course name is required.");
            return;
        }

        if (!formData.institution.trim()) {
            setErrorMsg("School / College / Institute name is required.");
            return;
        }

        const scoreNum = parseFloat(formData.score);
        if (isNaN(scoreNum) || scoreNum < 0) {
            setErrorMsg("Please enter a valid marks or CGPA score.");
            return;
        }

        if (formData.scoreType === "PERCENTAGE" && scoreNum > 100) {
            setErrorMsg("Percentage score cannot exceed 100%.");
            return;
        }

        if (formData.scoreType === "CGPA" && scoreNum > 10.0) {
            setErrorMsg("CGPA cannot exceed 10.0 scale.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                educationLevel: formData.educationLevel,
                degree: formData.degree.trim(),
                institution: formData.institution.trim(),
                university: formData.university.trim() || formData.institution.trim(),
                passingYear: parseInt(formData.passingYear, 10),
                score: scoreNum,
                scoreType: formData.scoreType
            };

            if (editingItem) {
                await updateJobSeekerEducation(editingItem.educationId, payload);
                setSuccessMsg("Education details updated successfully!");
            } else {
                await addJobSeekerEducation(payload);
                setSuccessMsg(`${EDUCATION_LEVEL_CONFIG[formData.educationLevel]?.label || "Education"} added to your profile!`);
            }

            setModalOpen(false);
            await fetchEducationList();
            setTimeout(() => setSuccessMsg(""), 3500);
        } catch (err) {
            console.error("Save education error:", err);
            setErrorMsg(err?.response?.data?.error || err?.response?.data?.message || "Failed to save education details.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (educationId, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to remove this education record from your profile?")) {
            return;
        }

        setDeletingId(educationId);
        try {
            await deleteJobSeekerEducation(educationId);
            setSuccessMsg("Education record deleted.");
            await fetchEducationList();
            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (err) {
            console.error("Delete education error:", err);
            setErrorMsg("Failed to delete education record.");
        } finally {
            setDeletingId(null);
        }
    };

    // Determine missing levels
    const existingLevels = new Set(educations.map((e) => e.educationLevel));
    const missingPills = [
        { level: "TENTH", label: "+ Add Class 10th (SSC)" },
        { level: "TWELFTH", label: "+ Add Class 12th (HSC)" },
        { level: "DIPLOMA", label: "+ Add Diploma" },
        { level: "GRADUATION", label: "+ Add Graduation" },
        { level: "POST_GRADUATION", label: "+ Add Post-Graduation" }
    ].filter((p) => !existingLevels.has(p.level));

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-5">
            {/* SECTION HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg shadow-2xs">
                        🎓
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-slate-900 tracking-tight">
                                Education & Academic History
                            </h3>
                            <span className="rounded-md bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 text-[9px] font-black text-indigo-700 uppercase">
                                Naukri Standards (10th to Higher)
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Enterprise recruiters verify full academic progression from Class 10th, 12th / Diploma to Graduation & Post Graduation.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => openAddModal("GRADUATION")}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-xs font-black shadow-xs transition hover:scale-[1.02] shrink-0"
                >
                    <FiPlus size={14} />
                    <span>Add Qualification</span>
                </button>
            </div>

            {/* FEEDBACK NOTIFICATIONS */}
            {successMsg && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-3.5 text-xs font-bold text-emerald-800 flex items-center justify-between shadow-2xs animate-in fade-in">
                    <div className="flex items-center gap-2">
                        <FiCheckCircle size={16} className="text-emerald-600" />
                        <span>{successMsg}</span>
                    </div>
                    <button type="button" onClick={() => setSuccessMsg("")} className="text-emerald-600 hover:text-emerald-800">
                        <FiX size={15} />
                    </button>
                </div>
            )}

            {errorMsg && (
                <div className="rounded-2xl border border-red-200 bg-red-50/90 p-3.5 text-xs font-bold text-red-800 flex items-center justify-between shadow-2xs animate-in fade-in">
                    <div className="flex items-center gap-2">
                        <FiAlertCircle size={16} className="text-red-600" />
                        <span>{errorMsg}</span>
                    </div>
                    <button type="button" onClick={() => setErrorMsg("")} className="text-red-600 hover:text-red-800">
                        <FiX size={15} />
                    </button>
                </div>
            )}

            {/* QUICK MISSING LEVEL SUGGESTION PILLS */}
            {missingPills.length > 0 && educations.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 mr-1 flex items-center gap-1">
                        <span>💡</span> Complete your full academic records:
                    </span>
                    {missingPills.map((pill) => (
                        <button
                            key={pill.level}
                            type="button"
                            onClick={() => openAddModal(pill.level)}
                            className="rounded-lg bg-white border border-amber-200 hover:border-amber-400 hover:bg-amber-100 text-amber-800 px-2.5 py-1 text-[11px] font-bold shadow-2xs transition"
                        >
                            {pill.label}
                        </button>
                    ))}
                </div>
            )}

            {/* EDUCATION CARDS LIST */}
            {loading ? (
                <div className="py-8 text-center text-xs font-semibold text-slate-400">
                    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading education history...
                </div>
            ) : educations.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-xl font-bold">
                        🎓
                    </div>
                    <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                            No Academic Qualifications Added Yet
                        </h4>
                        <p className="text-[11px] text-slate-500 max-w-md mx-auto mt-0.5">
                            Add your Class 10th, 12th, Diploma, or Graduation details. Recruiters heavily filter candidates based on degree criteria.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => openAddModal("GRADUATION")}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition"
                        >
                            <FiPlus size={13} /> Add Graduation / Degree
                        </button>
                        <button
                            type="button"
                            onClick={() => openAddModal("TENTH")}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition"
                        >
                            <FiPlus size={13} /> Add 10th (SSC)
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {educations.map((item) => {
                        const levelConfig = EDUCATION_LEVEL_CONFIG[item.educationLevel] || EDUCATION_LEVEL_CONFIG.OTHER;
                        const scoreDisplay =
                            item.scoreType === "CGPA"
                                ? `${item.score} CGPA`
                                : `${item.score}% Marks`;

                        return (
                            <div
                                key={item.educationId}
                                className="group relative rounded-2xl border border-slate-200/90 bg-white hover:border-indigo-300 hover:shadow-md p-4 sm:p-5 transition-all space-y-3"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase ${levelConfig.badge}`}
                                            >
                                                {levelConfig.label}
                                            </span>
                                            <span className="text-xs sm:text-sm font-black text-slate-900">
                                                {item.degree}
                                            </span>
                                        </div>

                                        <p className="text-xs font-bold text-slate-700">
                                            {item.institution}
                                        </p>

                                        {item.university && item.university !== item.institution && (
                                            <p className="text-[11px] font-medium text-slate-500">
                                                Board / University: {item.university}
                                            </p>
                                        )}
                                    </div>

                                    {/* ACTIONS & SCORE PILL */}
                                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-start">
                                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl text-xs font-extrabold text-slate-800">
                                            <FiCalendar size={12} className="text-slate-400" />
                                            <span>{item.passingYear}</span>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-indigo-600">{scoreDisplay}</span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => openEditModal(item)}
                                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 transition"
                                            title="Edit qualification"
                                        >
                                            <FiEdit2 size={13} />
                                        </button>

                                        <button
                                            type="button"
                                            disabled={deletingId === item.educationId}
                                            onClick={(e) => handleDelete(item.educationId, e)}
                                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50/50 transition disabled:opacity-50"
                                            title="Delete qualification"
                                        >
                                            <FiTrash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ADD / EDIT EDUCATION MODAL */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div className="w-full max-w-xl rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                                    Naukri Academic Registry
                                </span>
                                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                                    {editingItem ? "Edit Academic Details" : "Add Academic Qualification"}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition"
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        {errorMsg && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 flex items-center gap-2">
                                <FiAlertCircle size={15} />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* LEVEL SELECTION PILLS */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Qualification Level *
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {Object.entries(EDUCATION_LEVEL_CONFIG).map(([lvl, conf]) => (
                                        <button
                                            key={lvl}
                                            type="button"
                                            onClick={() => handleLevelSelect(lvl)}
                                            className={`rounded-xl p-2.5 text-xs font-bold text-left border transition ${
                                                formData.educationLevel === lvl
                                                    ? "border-indigo-600 bg-indigo-50 text-indigo-900 shadow-2xs"
                                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                            }`}
                                        >
                                            {conf.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* DEGREE / STREAM INPUT */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Degree / Examination / Course *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.degree}
                                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                                    placeholder={EDUCATION_LEVEL_CONFIG[formData.educationLevel]?.defaultDegree || "e.g. B.Tech Computer Science"}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                />

                                {/* QUICK SUGGESTIONS */}
                                {SUGGESTED_DEGREES[formData.educationLevel] && (
                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                        <span className="text-[10px] text-slate-400 font-bold self-center">Suggestions:</span>
                                        {SUGGESTED_DEGREES[formData.educationLevel].map((deg) => (
                                            <button
                                                key={deg}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, degree: deg })}
                                                className="text-[10px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded px-2 py-0.5 text-slate-600 font-semibold"
                                            >
                                                {deg}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* INSTITUTION NAME */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    School / College / Institute Name *
                                </label>
                                <input
                                    type="text"
                                    list="indian-colleges-list"
                                    value={formData.institution}
                                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                                    placeholder={EDUCATION_LEVEL_CONFIG[formData.educationLevel]?.schoolHint || "Enter school or college name"}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                />
                                <datalist id="indian-colleges-list">
                                    {INDIAN_COLLEGES_AND_UNIVERSITIES.map((inst) => (
                                        <option key={inst} value={inst} />
                                    ))}
                                </datalist>
                            </div>

                            {/* BOARD / UNIVERSITY */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Board / University Name (Optional)
                                </label>
                                <input
                                    type="text"
                                    list="indian-boards-universities-list"
                                    value={formData.university}
                                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                                    placeholder={EDUCATION_LEVEL_CONFIG[formData.educationLevel]?.boardHint || "e.g. State Board, CBSE, Pune University"}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                />
                                <datalist id="indian-boards-universities-list">
                                    <option value="Maharashtra State Board (MSBSHSE)" />
                                    <option value="CBSE (Central Board of Secondary Education)" />
                                    <option value="ICSE / ISC Board" />
                                    <option value="MSBTE Mumbai" />
                                    {INDIAN_COLLEGES_AND_UNIVERSITIES.map((u) => (
                                        <option key={u} value={u} />
                                    ))}
                                </datalist>
                            </div>

                            {/* PASSING YEAR & SCORE */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Passing Year *
                                    </label>
                                    <input
                                        type="number"
                                        min="1960"
                                        max="2035"
                                        required
                                        value={formData.passingYear}
                                        onChange={(e) => setFormData({ ...formData, passingYear: e.target.value })}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Grading Scale *
                                    </label>
                                    <select
                                        value={formData.scoreType}
                                        onChange={(e) => setFormData({ ...formData, scoreType: e.target.value })}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    >
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="CGPA">CGPA (10 Scale)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Score / Marks *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max={formData.scoreType === "CGPA" ? "10" : "100"}
                                        required
                                        value={formData.score}
                                        onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                                        placeholder={formData.scoreType === "CGPA" ? "e.g. 8.85" : "e.g. 85.4"}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    />
                                </div>
                            </div>

                            {/* SUBMIT ACTIONS */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-600 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleFormSubmit}
                                    disabled={saving}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:scale-[1.02] cursor-pointer"
                                >
                                    <FiCheck size={14} />
                                    <span>{saving ? "Saving..." : editingItem ? "Update Qualification" : "Save Qualification"}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobSeekerEducationSection;
