import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    FiBriefcase,
    FiArrowLeft,
    FiCheckCircle,
    FiAlertCircle,
    FiCpu,
    FiDollarSign,
    FiClock,
    FiMapPin,
    FiCalendar,
    FiPlus,
    FiX
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { createJob } from "../../services/jobService";
import {
    generateJobDescriptionAI,
    predictMarketSalaryAI,
    getQuickSkillSuggestions
} from "../../services/aiService";

const CreateJob = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        minSalary: "",
        maxSalary: "",
        experienceRequired: 0,
        vacancies: 1,
        requiredSkills: "",
        jobType: "FULL_TIME",
        workplaceType: "HYBRID",
        applicationDeadline: "",
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState("");
    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiSalaryLoading, setAiSalaryLoading] = useState(false);
    const [aiSuccessMessage, setAiSuccessMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    // AI Job Description Generator
    const handleAiGenerateJD = async () => {
        if (!formData.title || formData.title.trim().length < 3) {
            setErrors((prev) => ({ ...prev, title: "Enter a job title first (e.g. Senior React Developer) for AI generation" }));
            return;
        }

        setAiGenerating(true);
        setAiSuccessMessage("");
        try {
            const aiResult = await generateJobDescriptionAI({
                title: formData.title,
                experience: formData.experienceRequired,
                location: formData.location,
                jobType: formData.jobType,
            });

            if (aiResult) {
                setFormData((prev) => ({
                    ...prev,
                    description: aiResult.description || prev.description,
                    requiredSkills: prev.requiredSkills
                        ? `${prev.requiredSkills}, ${aiResult.skills}`
                        : aiResult.skills || prev.requiredSkills,
                }));
                setAiSuccessMessage("✨ AI generated job description & recommended skills inserted!");
                setTimeout(() => setAiSuccessMessage(""), 5000);
            }
        } catch (err) {
            console.error("AI JD generation error:", err);
        } finally {
            setAiGenerating(false);
        }
    };

    // AI Salary Benchmark
    const handleAiBenchmarkSalary = async () => {
        if (!formData.title) {
            setErrors((prev) => ({ ...prev, title: "Enter a role title first" }));
            return;
        }

        setAiSalaryLoading(true);
        try {
            const salaryData = await predictMarketSalaryAI({
                title: formData.title,
                experience: formData.experienceRequired,
                location: formData.location,
            });

            if (salaryData?.minSalary && salaryData?.maxSalary) {
                setFormData((prev) => ({
                    ...prev,
                    minSalary: salaryData.minSalary,
                    maxSalary: salaryData.maxSalary,
                }));
                setAiSuccessMessage(`✨ Applied market benchmark: ₹${(salaryData.minSalary / 100000).toFixed(1)} - ₹${(salaryData.maxSalary / 100000).toFixed(1)} LPA`);
                setTimeout(() => setAiSuccessMessage(""), 5000);
            }
        } catch (err) {
            console.error("AI salary benchmark error:", err);
        } finally {
            setAiSalaryLoading(false);
        }
    };

    // Quick Skill Suggestion Pill Add
    const handleAddSkillPill = (skill) => {
        const currentSkills = formData.requiredSkills
            ? formData.requiredSkills.split(",").map((s) => s.trim().toLowerCase())
            : [];

        if (!currentSkills.includes(skill.toLowerCase())) {
            const updated = formData.requiredSkills
                ? `${formData.requiredSkills}, ${skill}`
                : skill;
            setFormData((prev) => ({ ...prev, requiredSkills: updated }));
            if (errors.requiredSkills) {
                setErrors((prev) => ({ ...prev, requiredSkills: "" }));
            }
        }
    };

    // Validation
    const validate = () => {
        const newErrors = {};

        if (!formData.title || formData.title.trim().length < 5) {
            newErrors.title = "Job title must be at least 5 characters.";
        }
        if (!formData.description || formData.description.trim().length < 50) {
            newErrors.description = "Job description must be at least 50 characters.";
        }
        if (!formData.location || !formData.location.trim()) {
            newErrors.location = "Job location is required.";
        }
        if (!formData.minSalary || Number(formData.minSalary) <= 0) {
            newErrors.minSalary = "Enter a valid positive minimum salary.";
        }
        if (!formData.maxSalary || Number(formData.maxSalary) <= 0) {
            newErrors.maxSalary = "Enter a valid positive maximum salary.";
        } else if (Number(formData.maxSalary) < Number(formData.minSalary)) {
            newErrors.maxSalary = "Maximum salary cannot be lower than minimum salary.";
        }
        if (formData.experienceRequired === "" || Number(formData.experienceRequired) < 0) {
            newErrors.experienceRequired = "Experience cannot be negative.";
        }
        if (!formData.vacancies || Number(formData.vacancies) < 1) {
            newErrors.vacancies = "Must have at least 1 vacancy.";
        }
        if (!formData.requiredSkills || formData.requiredSkills.trim().length < 3) {
            newErrors.requiredSkills = "Provide at least 1-2 required skills.";
        }
        if (!formData.applicationDeadline) {
            newErrors.applicationDeadline = "Application deadline is required.";
        } else {
            const selectedDate = new Date(formData.applicationDeadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate <= today) {
                newErrors.applicationDeadline = "Deadline must be a future date.";
            }
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
                title: formData.title.trim(),
                description: formData.description.trim(),
                location: formData.location.trim(),
                minSalary: Number(formData.minSalary),
                maxSalary: Number(formData.maxSalary),
                experienceRequired: Number(formData.experienceRequired),
                vacancies: Number(formData.vacancies),
                requiredSkills: formData.requiredSkills.trim(),
                jobType: formData.jobType,
                workplaceType: formData.workplaceType,
                applicationDeadline: formData.applicationDeadline,
            };

            await createJob(payload);
            navigate("/recruiter/jobs", { replace: true });
        } catch (err) {
            console.error("Job creation failed:", err);
            const msg =
                err.response?.data?.message ||
                err.response?.data ||
                "Failed to publish job opening. Please check all fields.";
            setApiError(typeof msg === "string" ? msg : JSON.stringify(msg));
        } finally {
            setSubmitting(false);
        }
    };

    const suggestedPills = getQuickSkillSuggestions(formData.title);

    // Get tomorrow's date string for input min attribute
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* BACK LINK & TITLE */}
                <div className="flex items-center gap-3">
                    <Link
                        to="/recruiter/jobs"
                        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
                    >
                        <FiArrowLeft size={16} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            Publish New Opening
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Craft a clear role profile with AI JD generation and salary benchmark assistance.
                        </p>
                    </div>
                </div>

                {/* AI SUCCESS NOTIFICATION */}
                {aiSuccessMessage && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-800 animate-in fade-in duration-200">
                        <HiSparkles className="text-indigo-600 shrink-0" size={16} />
                        <span>{aiSuccessMessage}</span>
                    </div>
                )}

                {/* API ERROR BANNER */}
                {apiError && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800">
                        <FiAlertCircle className="text-rose-600 shrink-0" size={16} />
                        <span>{apiError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* SECTION 1: ROLE OVERVIEW */}
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-base font-extrabold text-slate-900">
                                    1. Role Overview
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Define the job title, working mode, and primary location.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleAiGenerateJD}
                                disabled={aiGenerating}
                                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-xs hover:from-indigo-500 hover:to-purple-500 transition disabled:opacity-50"
                            >
                                <HiSparkles size={13} className={aiGenerating ? "animate-spin" : ""} />
                                {aiGenerating ? "Drafting with AI..." : "✨ AI Generate JD"}
                            </button>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                Job Title <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                placeholder="e.g. Senior Full Stack Engineer (React + Java)"
                                value={formData.title}
                                onChange={handleChange}
                                className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition ${
                                    errors.title ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                                }`}
                            />
                            {errors.title && <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.title}</p>}
                        </div>

                        {/* Workplace Type & Job Type & Location */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Workplace Mode
                                </label>
                                <select
                                    name="workplaceType"
                                    value={formData.workplaceType}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                >
                                    <option value="ON_SITE">On-Site (Office)</option>
                                    <option value="HYBRID">Hybrid</option>
                                    <option value="REMOTE">Remote</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Employment Type
                                </label>
                                <select
                                    name="jobType"
                                    value={formData.jobType}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                >
                                    <option value="FULL_TIME">Full Time</option>
                                    <option value="PART_TIME">Part Time</option>
                                    <option value="CONTRACT">Contract</option>
                                    <option value="INTERNSHIP">Internship</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                    City / Location <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    placeholder="e.g. Pune, Maharashtra / Remote"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                                        errors.location ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                                    }`}
                                />
                                {errors.location && <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.location}</p>}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                                    Job Description & Responsibilities <span className="text-rose-500">*</span>
                                </label>
                                <span className="text-[11px] text-slate-400">
                                    {formData.description.length}/3000 chars
                                </span>
                            </div>
                            <textarea
                                name="description"
                                rows={8}
                                placeholder="Describe the day-to-day responsibilities, requirements, team structure, and qualifications..."
                                value={formData.description}
                                onChange={handleChange}
                                className={`w-full p-4 rounded-2xl bg-slate-50 border text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed ${
                                    errors.description ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                                }`}
                            />
                            {errors.description && (
                                <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.description}</p>
                            )}
                        </div>
                    </div>

                    {/* SECTION 2: COMPENSATION & ELIGIBILITY */}
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-base font-extrabold text-slate-900">
                                    2. Compensation & Requirements
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Annual CTC range, experience criteria, and vacancy headcounts.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleAiBenchmarkSalary}
                                disabled={aiSalaryLoading}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition disabled:opacity-50"
                            >
                                <FiDollarSign size={13} />
                                {aiSalaryLoading ? "Analyzing..." : "AI Salary Suggestion"}
                            </button>
                        </div>

                        {/* Salary Min / Max */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Min Annual CTC (INR ₹) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="minSalary"
                                    placeholder="e.g. 600000 (6 LPA)"
                                    value={formData.minSalary}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                                        errors.minSalary ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                                    }`}
                                />
                                {errors.minSalary && <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.minSalary}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Max Annual CTC (INR ₹) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="maxSalary"
                                    placeholder="e.g. 1200000 (12 LPA)"
                                    value={formData.maxSalary}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                                        errors.maxSalary ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                                    }`}
                                />
                                {errors.maxSalary && <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.maxSalary}</p>}
                            </div>
                        </div>

                        {/* Experience & Vacancies & Deadline */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Min Experience (Years) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="50"
                                    name="experienceRequired"
                                    value={formData.experienceRequired}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                                        errors.experienceRequired ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                                    }`}
                                />
                                {errors.experienceRequired && (
                                    <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.experienceRequired}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Vacancies <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    name="vacancies"
                                    value={formData.vacancies}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                                        errors.vacancies ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                                    }`}
                                />
                                {errors.vacancies && (
                                    <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.vacancies}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Application Deadline <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    min={tomorrowStr}
                                    name="applicationDeadline"
                                    value={formData.applicationDeadline}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                                        errors.applicationDeadline ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                                    }`}
                                />
                                {errors.applicationDeadline && (
                                    <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.applicationDeadline}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: SKILLS & TAGS */}
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                        <div className="border-b border-slate-100 pb-4">
                            <h2 className="text-base font-extrabold text-slate-900">
                                3. Required Technical Skills
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Enter comma-separated skills. These are utilized by AI for matching candidates.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                Skills (Comma Separated) <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="requiredSkills"
                                placeholder="e.g. Java, Spring Boot, React, PostgreSQL, Docker, AWS"
                                value={formData.requiredSkills}
                                onChange={handleChange}
                                className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                                    errors.requiredSkills ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                                }`}
                            />
                            {errors.requiredSkills && (
                                <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.requiredSkills}</p>
                            )}
                        </div>

                        {/* Quick Add Pills */}
                        {suggestedPills && suggestedPills.length > 0 && (
                            <div>
                                <p className="text-[11px] font-bold text-slate-500 mb-2">
                                    Click to quickly add suggested skills for this role:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {suggestedPills.map((pill, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleAddSkillPill(pill)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 text-xs font-semibold transition"
                                        >
                                            <FiPlus size={12} />
                                            {pill}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SUBMIT BUTTON */}
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <Link
                            to="/recruiter/jobs"
                            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] disabled:opacity-50"
                        >
                            <FiCheckCircle size={15} />
                            {submitting ? "Publishing Job..." : "Publish Job Opening"}
                        </button>
                    </div>
                </form>
        </div>
    );
};

export default CreateJob;
