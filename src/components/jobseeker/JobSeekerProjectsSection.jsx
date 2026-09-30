import { useState, useEffect, useMemo } from "react";
import {
    FiLayers,
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiCheckCircle,
    FiAlertCircle,
    FiX,
    FiCalendar,
    FiGithub,
    FiExternalLink,
    FiUsers,
    FiZap,
    FiCheck
} from "react-icons/fi";
import {
    getJobSeekerProjects,
    addJobSeekerProject,
    updateJobSeekerProject,
    deleteJobSeekerProject
} from "../../services/jobSeekerService";
import { ALL_IT_SKILLS, IT_DESIGNATIONS } from "../../utils/naukriTaxonomy";

const JobSeekerProjectsSection = ({ onProjectsChange }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");
    const [feedback, setFeedback] = useState("");

    const [form, setForm] = useState({
        title: "",
        clientName: "Academic / Final Year Project",
        projectStatus: "FINISHED",
        role: "Full Stack Developer",
        teamSize: "2",
        startDate: "2024-08-01",
        endDate: "2025-01-01",
        githubUrl: "",
        liveDemoUrl: "",
        techStackList: [],
        description: ""
    });

    const [skillInput, setSkillInput] = useState("");
    const [showSkillDropdown, setShowSkillDropdown] = useState(false);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const data = await getJobSeekerProjects();
            const list = Array.isArray(data) ? data : [];
            setProjects(list);
            if (onProjectsChange) onProjectsChange(list);
        } catch (err) {
            console.warn("Could not load projects:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const filteredSkills = useMemo(() => {
        const q = skillInput.toLowerCase().trim();
        if (!q) return ALL_IT_SKILLS.filter((s) => !form.techStackList.includes(s)).slice(0, 12);
        return ALL_IT_SKILLS.filter(
            (s) => s.toLowerCase().includes(q) && !form.techStackList.includes(s)
        ).slice(0, 12);
    }, [skillInput, form.techStackList]);

    const openAddModal = () => {
        setEditingItem(null);
        setError("");
        setForm({
            title: "",
            clientName: "Academic / Personal Engineering Project",
            projectStatus: "FINISHED",
            role: "Full Stack Developer",
            teamSize: "2",
            startDate: "2024-08-01",
            endDate: "2025-01-01",
            githubUrl: "",
            liveDemoUrl: "",
            techStackList: [],
            description: ""
        });
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
            title: item.title || "",
            clientName: item.clientName || "Academic / Personal Project",
            projectStatus: item.projectStatus || "FINISHED",
            role: item.role || "Full Stack Developer",
            teamSize: item.teamSize ? String(item.teamSize) : "1",
            startDate: item.startDate || "2024-08-01",
            endDate: item.endDate || "",
            githubUrl: item.githubUrl || "",
            liveDemoUrl: item.liveDemoUrl || "",
            techStackList: parsedSkills,
            description: item.description || ""
        });
        setSkillInput("");
        setModalOpen(true);
    };

    const addTechSkill = (skill) => {
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

    const removeTechSkill = (skillToRemove) => {
        setForm((prev) => ({
            ...prev,
            techStackList: prev.techStackList.filter((s) => s !== skillToRemove)
        }));
    };

    const generateAiProjectDescription = () => {
        const title = form.title || "Enterprise Web Platform";
        const stack =
            form.techStackList.length > 0
                ? form.techStackList.join(", ")
                : "Java, Spring Boot, React.js, and MySQL";
        const role = form.role || "Full Stack Developer";
        const summary = `Architected and developed "${title}" as ${role} using ${stack}. Implemented secure JWT role-based authentication, optimized REST API queries for fast response times, and built a responsive modern UI with clean state management.`;
        setForm((prev) => ({ ...prev, description: summary }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.title.trim()) {
            setError("Project Title is required.");
            return;
        }

        const payload = {
            title: form.title.trim(),
            clientName: form.clientName.trim(),
            projectStatus: form.projectStatus,
            role: form.role.trim(),
            teamSize: form.teamSize ? parseInt(form.teamSize, 10) : 1,
            startDate: form.startDate || null,
            endDate: form.projectStatus === "IN_PROGRESS" ? null : (form.endDate || null),
            githubUrl: form.githubUrl.trim(),
            liveDemoUrl: form.liveDemoUrl.trim(),
            techStack: form.techStackList.join(", "),
            description: form.description.trim()
        };

        setSaving(true);
        try {
            if (editingItem && editingItem.id) {
                await updateJobSeekerProject(editingItem.id, payload);
                setFeedback(`Updated project "${payload.title}"`);
            } else {
                await addJobSeekerProject(payload);
                setFeedback(`Added project "${payload.title}" to your profile`);
            }
            setModalOpen(false);
            await fetchProjects();
            setTimeout(() => setFeedback(""), 3500);
        } catch (err) {
            console.error("Save project error:", err);
            setError(
                err.response?.data?.message ||
                    "Please save your Basic Profile once before adding Projects."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        if (!item.id) return;
        setDeletingId(item.id);
        try {
            await deleteJobSeekerProject(item.id);
            setFeedback(`Removed project "${item.title}"`);
            await fetchProjects();
            setTimeout(() => setFeedback(""), 3000);
        } catch (err) {
            console.error("Delete project error:", err);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-5">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
                        <FiLayers size={18} />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                            IT Projects & Case Studies
                            <span className="rounded-full bg-purple-50 border border-purple-200 px-2.5 py-0.5 text-[10px] font-extrabold text-purple-700 uppercase">
                                Portfolio Showcase
                            </span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Showcase your academic, industrial, or open-source projects with tech stack, role, and live links.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-black text-white shadow-sm shadow-indigo-600/20 transition cursor-pointer shrink-0"
                >
                    <FiPlus size={15} />
                    Add Project
                </button>
            </div>

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

            {/* PROJECTS GRID */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map((n) => (
                        <div key={n} className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
                    ))}
                </div>
            ) : projects.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-7 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
                        <FiLayers size={22} />
                    </div>
                    <h4 className="text-sm font-black text-slate-800">
                        No Projects Added Yet
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                        Add your key engineering projects, technologies used, GitHub repository, and your specific role to stand out to technical hiring managers.
                    </p>
                    <button
                        type="button"
                        onClick={openAddModal}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                    >
                        <FiPlus size={13} /> Add Your First Project
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map((proj) => {
                        const skills = proj.techStack
                            ? proj.techStack.split(",").map((s) => s.trim()).filter(Boolean)
                            : [];
                        return (
                            <div
                                key={proj.id}
                                className="rounded-2xl border border-slate-200/90 bg-slate-50/40 hover:bg-white hover:border-indigo-200 hover:shadow-md p-5 transition-all flex flex-col justify-between gap-4"
                            >
                                <div className="space-y-2.5">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                                <span
                                                    className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase border ${
                                                        proj.projectStatus === "IN_PROGRESS"
                                                            ? "bg-amber-50 text-amber-700 border-amber-200"
                                                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    }`}
                                                >
                                                    {proj.projectStatus === "IN_PROGRESS" ? "In Progress" : "Completed"}
                                                </span>
                                                {proj.clientName && (
                                                    <span className="text-[11px] font-bold text-slate-500">
                                                        • {proj.clientName}
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="text-sm font-black text-slate-900">
                                                {proj.title}
                                            </h4>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(proj)}
                                                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 transition cursor-pointer"
                                                title="Edit Project"
                                            >
                                                <FiEdit2 size={12} />
                                            </button>
                                            <button
                                                type="button"
                                                disabled={deletingId === proj.id}
                                                onClick={() => handleDelete(proj)}
                                                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 hover:text-red-600 text-slate-500 transition cursor-pointer"
                                                title="Delete Project"
                                            >
                                                <FiTrash2 size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-500">
                                        {proj.role && (
                                            <span className="text-indigo-700 font-bold">
                                                Role: {proj.role}
                                            </span>
                                        )}
                                        {proj.teamSize && (
                                            <span className="inline-flex items-center gap-1">
                                                <FiUsers size={11} /> Team of {proj.teamSize}
                                            </span>
                                        )}
                                    </div>

                                    {proj.description && (
                                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                                            {proj.description}
                                        </p>
                                    )}

                                    {skills.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {skills.map((s) => (
                                                <span
                                                    key={s}
                                                    className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700"
                                                >
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {(proj.githubUrl || proj.liveDemoUrl) && (
                                    <div className="flex items-center gap-3 pt-3 border-t border-slate-200/70 text-xs font-bold">
                                        {proj.githubUrl && (
                                            <a
                                                href={proj.githubUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-slate-700 hover:text-indigo-600 transition"
                                            >
                                                <FiGithub size={13} /> Source Code
                                            </a>
                                        )}
                                        {proj.liveDemoUrl && (
                                            <a
                                                href={proj.liveDemoUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 transition"
                                            >
                                                <FiExternalLink size={13} /> Live Demo
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ADD / EDIT PROJECT MODAL */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl space-y-5 my-8 max-h-[92vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">
                                    {editingItem ? "Edit IT Project" : "Add IT Project"}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Highlight your technical architecture, role, and technologies used.
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Project Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        placeholder="e.g. HireSphere Job Portal & ATS Engine"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Client / Organization / Type
                                    </label>
                                    <input
                                        type="text"
                                        list="project-client-types"
                                        value={form.clientName}
                                        onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                                        placeholder="e.g. Academic / Final Year Project, TCS..."
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    />
                                    <datalist id="project-client-types">
                                        <option value="Academic / Final Year Project" />
                                        <option value="Personal / Open Source Project" />
                                        <option value="Industrial Internship Project" />
                                        <option value="Hackathon Winner / Finalist Project" />
                                        <option value="Enterprise Client Project" />
                                    </datalist>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Your Role in Project
                                    </label>
                                    <input
                                        type="text"
                                        list="project-roles-list"
                                        value={form.role}
                                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                                        placeholder="e.g. Full Stack Developer"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    />
                                    <datalist id="project-roles-list">
                                        {IT_DESIGNATIONS.slice(0, 15).map((r) => (
                                            <option key={r} value={r} />
                                        ))}
                                    </datalist>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Project Status
                                    </label>
                                    <select
                                        value={form.projectStatus}
                                        onChange={(e) => setForm({ ...form, projectStatus: e.target.value })}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    >
                                        <option value="FINISHED">Finished / Completed</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Team Size
                                    </label>
                                    <select
                                        value={form.teamSize}
                                        onChange={(e) => setForm({ ...form, teamSize: e.target.value })}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                                            <option key={n} value={String(n)}>
                                                {n} {n === 1 ? "Member (Solo)" : "Members"}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Technologies Used */}
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Technologies & Skills Used
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
                                                    onClick={() => removeTechSkill(skill)}
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
                                            addTechSkill(skillInput);
                                        }
                                    }}
                                    placeholder="Search & add tech stack (e.g. Spring Boot, React.js, MySQL, Docker)..."
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                />
                                {showSkillDropdown && filteredSkills.length > 0 && (
                                    <div className="absolute z-30 mt-1 w-full max-h-40 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl p-2 flex flex-wrap gap-1.5">
                                        {filteredSkills.map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onMouseDown={() => addTechSkill(s)}
                                                className="rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white px-2.5 py-1 text-xs font-bold text-slate-700 transition cursor-pointer"
                                            >
                                                + {s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Links */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        GitHub Repository Link
                                    </label>
                                    <input
                                        type="url"
                                        value={form.githubUrl}
                                        onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                                        placeholder="https://github.com/username/project"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Live Demo / Deployed URL
                                    </label>
                                    <input
                                        type="url"
                                        value={form.liveDemoUrl}
                                        onChange={(e) => setForm({ ...form, liveDemoUrl: e.target.value })}
                                        placeholder="https://your-project-demo.vercel.app"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    />
                                </div>
                            </div>

                            {/* Description with AI Writer */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-bold text-slate-700">
                                        Project Details & Architecture
                                    </label>
                                    <button
                                        type="button"
                                        onClick={generateAiProjectDescription}
                                        className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 text-[11px] font-bold text-indigo-700 transition cursor-pointer"
                                    >
                                        <FiZap size={11} />
                                        AI Generate Summary
                                    </button>
                                </div>
                                <textarea
                                    rows={3}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Explain what problem the project solves, system architecture, and your contribution..."
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
                                {saving ? "Saving..." : editingItem ? "Update Project" : "Save Project"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobSeekerProjectsSection;
