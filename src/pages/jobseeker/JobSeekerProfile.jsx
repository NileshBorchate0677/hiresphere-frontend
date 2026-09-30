import { useEffect, useState, useMemo } from "react";
import {
    FiUser,
    FiMail,
    FiPhone,
    FiMapPin,
    FiBook,
    FiFileText,
    FiCheck,
    FiAlertCircle,
    FiUploadCloud,
    FiDownload,
    FiCheckCircle,
    FiBriefcase,
    FiGlobe,
    FiGithub,
    FiLinkedin,
    FiClock,
    FiPlus,
    FiX,
    FiAward,
    FiCode,
    FiZap,
    FiDollarSign,
    FiCalendar,
    FiLayers,
    FiCompass,
    FiSearch,
    FiSliders,
    FiEdit2,
    FiEye,
    FiSave,
    FiExternalLink
} from "react-icons/fi";
import {
    getJobSeekerProfile,
    createJobSeekerProfile,
    updateJobSeekerProfile,
    uploadResume,
    getJobSeekerEducation,
    getJobSeekerExperiences,
    getJobSeekerProjects
} from "../../services/jobSeekerService";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../utils/constants";
import {
    calculateProfileCompleteness,
    generateAIProfileHeadlines,
    generateAIProfileSummary,
    getAiRecommendedSkills,
    getAiSettings,
    saveAiSettings
} from "../../utils/aiHelper";
import {
    ALL_INDIA_IT_CITIES,
    TOP_IT_COMPANIES_INDIA,
    IT_SKILLS_CATEGORIES,
    ALL_IT_SKILLS,
    IT_DESIGNATIONS,
    IT_INDUSTRIES,
    IT_DEPARTMENTS,
    ROLE_CATEGORIES,
    NOTICE_PERIOD_OPTIONS,
    WORK_MODE_OPTIONS,
    SHIFT_OPTIONS,
    DESIRED_JOB_TYPES,
    DESIRED_EMPLOYMENT_TYPES,
    MARITAL_STATUS_OPTIONS,
    INDIAN_LANGUAGES
} from "../../utils/naukriTaxonomy";
import JobSeekerEducationSection from "../../components/jobseeker/JobSeekerEducationSection";
import JobSeekerEmploymentSection from "../../components/jobseeker/JobSeekerEmploymentSection";
import JobSeekerProjectsSection from "../../components/jobseeker/JobSeekerProjectsSection";

const mapDegreeToQualificationEnum = (educationLevel, degreeStr = "") => {
    const d = (degreeStr || "").toUpperCase();
    if (d.includes("M.TECH") || d.includes("MTECH")) return "MTECH";
    if (d.includes("M.E") || d.includes("MASTER OF ENGINEERING")) return "ME";
    if (d.includes("MCA")) return "MCA";
    if (d.includes("MBA")) return "MBA";
    if (d.includes("M.SC") || d.includes("MSC")) return "MSC";
    if (d.includes("B.TECH") || d.includes("BTECH")) return "BTECH";
    if (d.includes("B.E") || d.includes("BACHELOR OF ENGINEERING")) return "BE";
    if (d.includes("BCA")) return "BCA";
    if (d.includes("B.SC") || d.includes("BSC")) return "BSC";
    if (d.includes("B.COM") || d.includes("BCOM")) return "BCOM";
    if (d.includes("PH.D") || d.includes("PHD") || d.includes("DOCTORATE")) return "PHD";

    switch (educationLevel) {
        case "TENTH":
            return "SSC";
        case "TWELFTH":
            return "HSC";
        case "DIPLOMA":
            return "DIPLOMA";
        case "POST_GRADUATION":
            return "MTECH";
        case "OTHER":
            return "PHD";
        case "GRADUATION":
        default:
            return "BTECH";
    }
};

const TOP_HUB_CITIES_QUICK = [
    "Pune",
    "Bengaluru",
    "Hyderabad",
    "Mumbai",
    "Navi Mumbai",
    "Gurugram (Gurgaon)",
    "Noida",
    "Delhi / NCR",
    "Chennai",
    "Ahmedabad",
    "Indore",
    "Kochi",
    "Nagpur",
    "Nashik",
    "Remote (All India)"
];

const JobSeekerProfile = () => {
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        fullName: "",
        headline: "",
        phoneNumber: "",
        experience: 0,
        gender: "MALE",
        location: "Pune",
        bio: "",
        noticePeriod: "Immediate / Serving Notice",
        // Employment & Salary summary fields (synced with Employment & Career Profile)
        currentDesignation: "",
        currentCompany: "",
        currentSalary: "",
        expectedSalary: "",
        preferredLocation: "Pune, Bengaluru",
        // Education summary fields (synced with Multi-level Education)
        highestQualification: "",
        course: "",
        collegeName: "",
        passingYear: "",
        // Career Profile Fields
        currentIndustry: "IT Services & Consulting",
        department: "Engineering - Software & QA",
        roleCategory: "Software Development",
        desiredJobType: "Permanent",
        desiredEmploymentType: "Full Time",
        preferredWorkMode: "Hybrid",
        preferredShift: "Day Shift",
        // Personal Details Fields
        dateOfBirth: "",
        maritalStatus: "Single / Unmarried",
        hometown: "",
        pincode: "",
        permanentAddress: "",
        languagesKnown: "English, Hindi, Marathi",
        differentlyAbled: false,
        careerBreak: false,
        // Social & Coding links
        githubUrl: "",
        linkedinUrl: "",
        portfolioUrl: ""
    });

    // AI Engine settings state (Naukri-Grade)
    const [aiSettings, setAiSettingsState] = useState(getAiSettings());
    const [showAiSettingsModal, setShowAiSettingsModal] = useState(false);
    const [aiSummaryTone, setAiSummaryTone] = useState("professional");

    // View vs Edit Mode State per section
    const [editingSections, setEditingSections] = useState({
        basic: false,
        resumeHeadline: false,
        skills: false,
        career: false,
        summary: false,
        personal: false
    });

    const isAnyEditing = useMemo(() => {
        return Object.values(editingSections).some(Boolean);
    }, [editingSections]);

    const toggleSectionEdit = (sectionName, forceState) => {
        setEditingSections((prev) => ({
            ...prev,
            [sectionName]: forceState !== undefined ? forceState : !prev[sectionName]
        }));
    };

    const setAllEditMode = (mode) => {
        setEditingSections({
            basic: mode,
            resumeHeadline: mode,
            skills: mode,
            career: mode,
            summary: mode,
            personal: mode
        });
    };

    // Interactive Skill Tags & Categorized Explorer
    const [skillsList, setSkillsList] = useState([]);
    const [skillInput, setSkillInput] = useState("");
    const [activeSkillCategory, setActiveSkillCategory] = useState("Backend & Languages");
    const [showSkillAutocomplete, setShowSkillAutocomplete] = useState(false);

    // Preferred Locations Multi-Select State
    const [preferredCitiesList, setPreferredCitiesList] = useState(["Pune", "Bengaluru"]);
    const [citySearchInput, setCitySearchInput] = useState("");
    const [showCityDropdown, setShowCityDropdown] = useState(false);

    // Languages Known Multi-Select State
    const [languagesList, setLanguagesList] = useState(["English", "Hindi", "Marathi"]);

    // Child sections records count for completeness
    const [educationRecords, setEducationRecords] = useState([]);
    const [employmentRecords, setEmploymentRecords] = useState([]);
    const [projectRecords, setProjectRecords] = useState([]);

    const [resumePath, setResumePath] = useState(null);
    const [resumeFileName, setResumeFileName] = useState("");
    const [isExisting, setIsExisting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // AI modal / suggestions state
    const [showAiHeadlines, setShowAiHeadlines] = useState(false);
    const [aiHeadlines, setAiHeadlines] = useState([]);
    const [aiGeneratingBio, setAiGeneratingBio] = useState(false);

    const fetchProfile = async () => {
        setLoading(true);
        setError("");
        try {
            const [profileRes, eduRes, expRes, projRes] = await Promise.allSettled([
                getJobSeekerProfile(),
                getJobSeekerEducation(),
                getJobSeekerExperiences(),
                getJobSeekerProjects()
            ]);

            const data = profileRes.status === "fulfilled" ? profileRes.value : null;
            if (eduRes.status === "fulfilled" && Array.isArray(eduRes.value)) {
                setEducationRecords(eduRes.value);
            }
            if (expRes.status === "fulfilled" && Array.isArray(expRes.value)) {
                setEmploymentRecords(expRes.value);
            }
            if (projRes.status === "fulfilled" && Array.isArray(projRes.value)) {
                setProjectRecords(projRes.value);
            }

            if (data && (data.id || data.jobSeekerProfileId || data.fullName)) {
                const prefLocStr = data.preferredLocation || "Pune, Bengaluru";
                const parsedCities = prefLocStr
                    .split(",")
                    .map((c) => c.trim())
                    .filter(Boolean);
                setPreferredCitiesList(parsedCities);

                const langStr = data.languagesKnown || "English, Hindi, Marathi";
                const parsedLangs = langStr
                    .split(",")
                    .map((l) => l.trim())
                    .filter(Boolean);
                setLanguagesList(parsedLangs);

                setFormData({
                    fullName: data.fullName || user?.fullName || user?.name || "",
                    headline: data.headline || "",
                    phoneNumber: data.phoneNumber || "",
                    experience: data.experience !== undefined && data.experience !== null ? data.experience : 0,
                    gender: data.gender || "MALE",
                    location: data.location || "Pune",
                    bio: data.summary || data.bio || "",
                    noticePeriod: data.noticePeriod || "Immediate / Serving Notice",
                    currentDesignation: data.currentDesignation || "",
                    currentCompany: data.currentCompany || "",
                    currentSalary: data.currentSalary !== null && data.currentSalary !== undefined ? String(data.currentSalary) : "",
                    expectedSalary: data.expectedSalary !== null && data.expectedSalary !== undefined ? String(data.expectedSalary) : "",
                    preferredLocation: prefLocStr,
                    highestQualification: data.highestQualification || "",
                    course: data.course || "",
                    collegeName: data.collegeName || "",
                    passingYear: data.passingYear ? String(data.passingYear) : "",
                    currentIndustry: data.currentIndustry || "IT Services & Consulting",
                    department: data.department || "Engineering - Software & QA",
                    roleCategory: data.roleCategory || "Software Development",
                    desiredJobType: data.desiredJobType || "Permanent",
                    desiredEmploymentType: data.desiredEmploymentType || "Full Time",
                    preferredWorkMode: data.preferredWorkMode || "Hybrid",
                    preferredShift: data.preferredShift || "Day Shift",
                    dateOfBirth: data.dateOfBirth || "",
                    maritalStatus: data.maritalStatus || "Single / Unmarried",
                    hometown: data.hometown || data.location || "",
                    pincode: data.pincode || "",
                    permanentAddress: data.permanentAddress || "",
                    languagesKnown: langStr,
                    differentlyAbled: Boolean(data.differentlyAbled),
                    careerBreak: Boolean(data.careerBreak),
                    githubUrl: data.githubUrl || "",
                    linkedinUrl: data.linkedinUrl || "",
                    portfolioUrl: data.portfolioUrl || ""
                });

                if (data.skills) {
                    const parsed = data.skills
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                    setSkillsList(parsed);
                } else {
                    setSkillsList([]);
                }

                setResumePath(data.resumeUrl || data.resumePath || null);
                setResumeFileName(data.resumeFileName || "");
                setIsExisting(true);
            } else {
                setFormData((prev) => ({
                    ...prev,
                    fullName: user?.fullName || user?.name || ""
                }));
                setSkillsList([]);
                setIsExisting(false);
                // For brand new users without saved profile, open basic section in edit mode
                setEditingSections((prev) => ({ ...prev, basic: true }));
            }
        } catch (err) {
            console.warn("Fetch profile note:", err);
            setFormData((prev) => ({
                ...prev,
                fullName: user?.fullName || user?.name || ""
            }));
            setSkillsList([]);
            setIsExisting(false);
            setEditingSections((prev) => ({ ...prev, basic: true }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    // Skill tag handlers
    const handleAddSkill = (skillToAdd) => {
        const cleaned = skillToAdd.trim();
        if (!cleaned) return;
        if (!skillsList.some((s) => s.toLowerCase() === cleaned.toLowerCase())) {
            setSkillsList((prev) => [...prev, cleaned]);
        }
        setSkillInput("");
        setShowSkillAutocomplete(false);
    };

    const handleKeyDownSkill = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            handleAddSkill(skillInput);
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setSkillsList((prev) => prev.filter((s) => s !== skillToRemove));
    };

    const filteredAutocompleteSkills = useMemo(() => {
        const q = skillInput.toLowerCase().trim();
        if (!q) return [];
        return ALL_IT_SKILLS.filter(
            (s) =>
                s.toLowerCase().includes(q) &&
                !skillsList.some((existing) => existing.toLowerCase() === s.toLowerCase())
        ).slice(0, 12);
    }, [skillInput, skillsList]);

    // Preferred City handlers
    const togglePreferredCity = (city) => {
        setPreferredCitiesList((prev) => {
            const exists = prev.some((c) => c.toLowerCase() === city.toLowerCase());
            const updated = exists
                ? prev.filter((c) => c.toLowerCase() !== city.toLowerCase())
                : [...prev, city];
            setFormData((f) => ({ ...f, preferredLocation: updated.join(", ") }));
            return updated;
        });
        setCitySearchInput("");
        setShowCityDropdown(false);
    };

    const filteredCities = useMemo(() => {
        const q = citySearchInput.toLowerCase().trim();
        if (!q) {
            return ALL_INDIA_IT_CITIES.filter(
                (c) => !preferredCitiesList.some((p) => p.toLowerCase() === c.toLowerCase())
            ).slice(0, 12);
        }
        return ALL_INDIA_IT_CITIES.filter(
            (c) =>
                c.toLowerCase().includes(q) &&
                !preferredCitiesList.some((p) => p.toLowerCase() === c.toLowerCase())
        ).slice(0, 12);
    }, [citySearchInput, preferredCitiesList]);

    // Languages Known handlers
    const toggleLanguage = (lang) => {
        setLanguagesList((prev) => {
            const exists = prev.includes(lang);
            const updated = exists ? prev.filter((l) => l !== lang) : [...prev, lang];
            setFormData((f) => ({ ...f, languagesKnown: updated.join(", ") }));
            return updated;
        });
    };

    // AI Headline Trigger
    const handleOpenAiHeadlines = () => {
        const currentData = {
            ...formData,
            skills: skillsList.join(", ")
        };
        const suggestions = generateAIProfileHeadlines(currentData);
        setAiHeadlines(suggestions);
        setShowAiHeadlines(true);
    };

    const handleApplyHeadline = (selectedHeadline) => {
        setFormData((prev) => ({ ...prev, headline: selectedHeadline }));
        setShowAiHeadlines(false);
        setMessage("✨ AI Resume Headline applied! Click 'Save' to persist.");
        setTimeout(() => setMessage(""), 3500);
    };

    // AI Summary Trigger with Tone
    const handleGenerateAiBio = (tone = aiSummaryTone) => {
        setAiGeneratingBio(true);
        setTimeout(() => {
            const currentData = {
                ...formData,
                skills: skillsList.join(", ")
            };
            const generatedBio = generateAIProfileSummary(currentData, tone);
            setFormData((prev) => ({ ...prev, bio: generatedBio }));
            setEditingSections((prev) => ({ ...prev, summary: true }));
            setAiGeneratingBio(false);
            setMessage("✨ AI Professional Summary generated! Click 'Save' to persist.");
            setTimeout(() => setMessage(""), 3500);
        }, 350);
    };

    // AI In-Demand IT Skills Recommendation for candidate's role
    const recommendedSkills = useMemo(() => {
        return getAiRecommendedSkills(formData.currentDesignation || "Software Engineer", skillsList);
    }, [formData.currentDesignation, skillsList]);

    // Profile Completeness calculation (True 7-Section Naukri Standard)
    const completeness = useMemo(() => {
        return calculateProfileCompleteness({
            ...formData,
            skills: skillsList,
            resumeUrl: resumePath,
            resumeFileName: resumeFileName,
            educationCount: educationRecords.length,
            employmentCount: employmentRecords.length
        });
    }, [formData, skillsList, resumePath, resumeFileName, educationRecords, employmentRecords]);

    const handleMissingPillClick = (sectionId) => {
        const sectionMap = {
            "sec-basic": "basic",
            "sec-resume": "resumeHeadline",
            "sec-headline": "resumeHeadline",
            "sec-skills": "skills",
            "sec-employment": "employment",
            "sec-education": "education",
            "sec-summary": "summary"
        };
        const editKey = sectionMap[sectionId];
        if (editKey && editKey !== "employment" && editKey !== "education") {
            toggleSectionEdit(editKey, true);
        }
        scrollToSection(sectionId);
    };

    // Save Profile (Supports saving entire profile or closing a specific section)
    const handleSubmit = async (e, sectionToClose = null) => {
        if (e && e.preventDefault) e.preventDefault();
        setError("");
        setMessage("");

        if (!formData.fullName || formData.fullName.trim().length < 3) {
            setError("Full Name is mandatory (minimum 3 characters).");
            toggleSectionEdit("basic", true);
            return;
        }

        const cleanedPhone = String(formData.phoneNumber || "").replace(/\D/g, "").slice(-10);
        if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
            setError("Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9 in Basic Info.");
            toggleSectionEdit("basic", true);
            return;
        }

        setSaving(true);
        try {
            const parseSalary = (val) => {
                if (val === null || val === undefined || val === "") return null;
                const cleaned = String(val).replace(/[^0-9.]/g, "");
                const num = parseFloat(cleaned);
                return isNaN(num) ? null : num;
            };

            const effectiveSkills = skillsList.join(", ");
            const effectiveHeadline =
                formData.headline && formData.headline.trim().length >= 5
                    ? formData.headline.trim()
                    : "";

            const payload = {
                ...formData,
                fullName: formData.fullName.trim(),
                phoneNumber: cleanedPhone,
                location: formData.location?.trim() || "Pune",
                headline: effectiveHeadline.slice(0, 150),
                experience: Math.min(50, Math.max(0, Math.round(Number(formData.experience) || 0))),
                skills: effectiveSkills,
                summary: formData.bio?.trim() || "",
                highestQualification: formData.highestQualification || null,
                collegeName: formData.collegeName?.trim() || null,
                course: formData.course?.trim() || null,
                passingYear: formData.passingYear ? Number(formData.passingYear) : null,
                currentSalary: parseSalary(formData.currentSalary),
                expectedSalary: parseSalary(formData.expectedSalary),
                preferredLocation: preferredCitiesList.join(", ") || formData.preferredLocation || "Pune",
                languagesKnown: languagesList.join(", ") || formData.languagesKnown || "English, Hindi",
                resumeUrl: resumePath || "",
                resumeFileName: resumeFileName || ""
            };

            let res;
            if (isExisting) {
                res = await updateJobSeekerProfile(payload);
            } else {
                res = await createJobSeekerProfile(payload);
                setIsExisting(true);
            }

            if (res) {
                // Immediately synchronize local state from server response
                const prefLocStr = res.preferredLocation || payload.preferredLocation || "Pune";
                setPreferredCitiesList(prefLocStr.split(",").map((c) => c.trim()).filter(Boolean));

                const langStr = res.languagesKnown || payload.languagesKnown || "English, Hindi";
                setLanguagesList(langStr.split(",").map((l) => l.trim()).filter(Boolean));

                if (res.skills) {
                    setSkillsList(res.skills.split(",").map((s) => s.trim()).filter(Boolean));
                }

                setFormData((prev) => ({
                    ...prev,
                    fullName: res.fullName || prev.fullName,
                    headline: res.headline || prev.headline,
                    phoneNumber: res.phoneNumber || prev.phoneNumber,
                    experience: res.experience !== undefined ? res.experience : prev.experience,
                    gender: res.gender || prev.gender,
                    location: res.location || prev.location,
                    bio: res.summary || res.bio || prev.bio,
                    noticePeriod: res.noticePeriod || prev.noticePeriod,
                    currentDesignation: res.currentDesignation || prev.currentDesignation,
                    currentCompany: res.currentCompany || prev.currentCompany,
                    currentSalary:
                        res.currentSalary !== null && res.currentSalary !== undefined
                            ? String(res.currentSalary)
                            : prev.currentSalary,
                    expectedSalary:
                        res.expectedSalary !== null && res.expectedSalary !== undefined
                            ? String(res.expectedSalary)
                            : prev.expectedSalary,
                    preferredLocation: prefLocStr,
                    highestQualification: res.highestQualification || prev.highestQualification,
                    course: res.course || prev.course,
                    collegeName: res.collegeName || prev.collegeName,
                    passingYear: res.passingYear ? String(res.passingYear) : prev.passingYear,
                    currentIndustry: res.currentIndustry || prev.currentIndustry,
                    department: res.department || prev.department,
                    roleCategory: res.roleCategory || prev.roleCategory,
                    desiredJobType: res.desiredJobType || prev.desiredJobType,
                    desiredEmploymentType: res.desiredEmploymentType || prev.desiredEmploymentType,
                    preferredWorkMode: res.preferredWorkMode || prev.preferredWorkMode,
                    preferredShift: res.preferredShift || prev.preferredShift,
                    dateOfBirth: res.dateOfBirth || prev.dateOfBirth,
                    maritalStatus: res.maritalStatus || prev.maritalStatus,
                    hometown: res.hometown || prev.hometown,
                    pincode: res.pincode || prev.pincode,
                    permanentAddress: res.permanentAddress || prev.permanentAddress,
                    languagesKnown: langStr,
                    differentlyAbled: Boolean(res.differentlyAbled),
                    careerBreak: Boolean(res.careerBreak),
                    githubUrl: res.githubUrl || prev.githubUrl,
                    linkedinUrl: res.linkedinUrl || prev.linkedinUrl,
                    portfolioUrl: res.portfolioUrl || prev.portfolioUrl
                }));

                // Switch section(s) to View Mode
                if (sectionToClose) {
                    setEditingSections((prev) => ({ ...prev, [sectionToClose]: false }));
                    setMessage(`✅ Profile section saved successfully! Updated details are now displayed.`);
                } else {
                    setAllEditMode(false);
                    setMessage("✅ Complete Candidate Profile saved & indexed! All saved details are displayed below.");
                }

                setTimeout(() => setMessage(""), 4500);
            }
        } catch (err) {
            console.error("Save profile error:", err);
            const validationErrors = err.response?.data?.errors;
            if (validationErrors && typeof validationErrors === "object") {
                const firstErr = Object.values(validationErrors)[0];
                setError(String(firstErr));
            } else {
                setError(
                    err.response?.data?.message ||
                        "Could not save profile. Please verify your mobile number, headline, and skills."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    // Resume Upload
    const handleResumeUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            setError("Only PDF files are supported for ATS Resume parsing.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Resume file size must be under 5MB.");
            return;
        }

        setUploadingResume(true);
        setError("");
        setMessage("");

        try {
            const res = await uploadResume(file);
            const newPath = res?.resumeUrl || res?.resumePath || res?.filePath || `/jobseeker/resume/download/${file.name}`;
            setResumePath(newPath);
            setResumeFileName(res?.resumeFileName || file.name);
            setMessage("📄 Resume PDF uploaded & linked to your ATS profile!");
            setTimeout(() => setMessage(""), 4000);
        } catch (err) {
            console.error("Upload resume error:", err);
            setError(
                err.response?.data?.message ||
                    "Please save your Basic Profile once before uploading your Resume PDF."
            );
        } finally {
            setUploadingResume(false);
        }
    };

    const getFullResumeUrl = () => {
        if (!resumePath) return "#";
        if (resumePath.startsWith("http")) return resumePath;
        return `${API_BASE_URL}${resumePath.startsWith("/") ? "" : "/"}${resumePath}`;
    };

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <div className="h-44 rounded-3xl bg-white border border-slate-200 p-6 animate-pulse" />
                <div className="h-96 rounded-3xl bg-white border border-slate-200 p-6 animate-pulse" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-6 pb-28 font-sans space-y-6">
            {/* TOAST / ALERTS */}
            {message && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/95 p-4 text-xs font-bold text-emerald-800 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                        <FiCheckCircle size={18} className="text-emerald-600 shrink-0" />
                        <span>{message}</span>
                    </div>
                    <button type="button" onClick={() => setMessage("")} className="text-emerald-600 hover:text-emerald-800">
                        <FiX size={16} />
                    </button>
                </div>
            )}

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50/95 p-4 text-xs font-bold text-red-800 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                        <FiAlertCircle size={18} className="text-red-600 shrink-0" />
                        <span>{error}</span>
                    </div>
                    <button type="button" onClick={() => setError("")} className="text-red-600 hover:text-red-800">
                        <FiX size={16} />
                    </button>
                </div>
            )}

            {/* TOP HERO CARD: CANDIDATE IDENTITY & EDIT / VIEW CONTROLS */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                        <div className="relative shrink-0">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 to-sky-400 text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-white/20">
                                {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : "C"}
                            </div>
                            <span
                                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-white text-[10px] font-bold"
                                title="Active for Recruiter Search"
                            >
                                ✓
                            </span>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                    {formData.fullName || "Candidate Name"}
                                </h1>
                                <span className="rounded-full bg-indigo-500/20 border border-indigo-400/30 px-3 py-0.5 text-[10px] font-black text-indigo-300 uppercase tracking-wider">
                                    ATS Search Indexed
                                </span>
                                {formData.noticePeriod && (
                                    <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                                        {formData.noticePeriod}
                                    </span>
                                )}
                            </div>

                            <p className="text-xs sm:text-sm font-bold text-slate-300">
                                {formData.currentDesignation || formData.roleCategory || "Software Engineering Candidate"}
                                {formData.currentCompany ? ` at ${formData.currentCompany}` : ""}
                            </p>

                            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-400 font-medium pt-1">
                                <span className="flex items-center gap-1.5">
                                    <FiMail size={13} className="text-indigo-400" />
                                    {user?.email || "No email"}
                                </span>
                                {formData.phoneNumber && (
                                    <span className="flex items-center gap-1.5">
                                        <FiPhone size={13} className="text-indigo-400" />
                                        +91 {formData.phoneNumber}
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5">
                                    <FiMapPin size={13} className="text-indigo-400" />
                                    {formData.location || "Pune"}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <FiBriefcase size={13} className="text-indigo-400" />
                                    {Number(formData.experience) > 0 ? `${formData.experience} Yrs Exp` : "Fresher (0 Yrs)"}
                                </span>
                                {formData.expectedSalary && (
                                    <span className="flex items-center gap-1 text-emerald-300 font-bold">
                                        Expected: ₹{formData.expectedSalary} LPA
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* COMPLETENESS RING & MASTER VIEW/EDIT CONTROLS */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="relative w-14 h-14 flex items-center justify-center">
                                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        className="text-slate-700"
                                        strokeWidth="3.5"
                                        stroke="currentColor"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path
                                        className={completeness.percentage >= 80 ? "text-emerald-400" : "text-indigo-400"}
                                        strokeDasharray={`${completeness.percentage}, 100`}
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                </svg>
                                <span className="absolute text-xs font-black text-white">
                                    {completeness.percentage}%
                                </span>
                            </div>

                            <div>
                                <p className="text-xs font-black text-white">Profile Strength</p>
                                {completeness.missing.length > 0 ? (
                                    <p className="text-[11px] text-amber-300 font-semibold mt-0.5">
                                        Add {completeness.missing[0].label} ({completeness.missing[0].boost})
                                    </p>
                                ) : (
                                    <p className="text-[11px] text-emerald-400 font-bold mt-0.5">
                                        100% Complete • Priority Ranked
                                    </p>
                                )}
                                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-300 font-semibold">
                                    <span>{skillsList.length} Skills</span>
                                    <span>•</span>
                                    <span>{employmentRecords.length} Jobs</span>
                                    <span>•</span>
                                    <span>{educationRecords.length} Degrees</span>
                                    <span>•</span>
                                    <span>{projectRecords.length} Projects</span>
                                </div>
                            </div>
                        </div>

                        {/* MASTER EDIT / VIEW TOGGLE BUTTON */}
                        <div className="sm:border-l sm:border-white/10 sm:pl-4 flex flex-col gap-2 w-full sm:w-auto">
                            {isAnyEditing ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => handleSubmit()}
                                        disabled={saving}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 px-4 py-2 text-xs font-bold text-white shadow-md transition cursor-pointer"
                                    >
                                        <FiSave size={14} />
                                        <span>{saving ? "Saving..." : "Save All Changes"}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAllEditMode(false)}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-1.5 text-xs font-semibold text-slate-200 transition cursor-pointer"
                                    >
                                        <FiEye size={13} />
                                        <span>View Saved Profile</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setAllEditMode(true)}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:scale-[1.02] cursor-pointer"
                                >
                                    <FiEdit2 size={14} className="text-indigo-300" />
                                    <span>Edit Full Profile</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* NAUKRI.COM PROFILE BOOSTER & MISSING SECTIONS CARD */}
            {completeness.percentage < 100 && (
                <div className="rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50/90 via-sky-50/60 to-purple-50/60 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                            <h3 className="text-sm font-black text-slate-900">
                                Boost Your Profile to 100% (Currently {completeness.percentage}%)
                            </h3>
                        </div>
                        <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                            Profiles with 100% completeness get up to 4x more interview calls on HireSphere. Click any missing section below to fill it:
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                            {completeness.missing.map((item) => (
                                <button
                                    key={item.label}
                                    type="button"
                                    onClick={() => handleMissingPillClick(item.sectionId)}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-2xs transition cursor-pointer"
                                >
                                    <span>+ Add {item.label}</span>
                                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md font-extrabold">{item.boost}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowAiSettingsModal(true)}
                            className="inline-flex items-center gap-2 rounded-2xl bg-white border border-indigo-200 hover:border-indigo-300 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:shadow transition cursor-pointer"
                        >
                            <FiZap size={14} className="text-indigo-600" />
                            <span>AI Engine: {aiSettings.mode === "gemini" ? "Google Gemini" : "HireSphere Fast AI"}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* QUICK SECTION JUMP BAR */}
            <div className="sticky top-16 z-20 flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-2 shadow-xs no-scrollbar">
                {[
                    { id: "sec-basic", label: "Basic Info", icon: FiUser },
                    { id: "sec-resume", label: "Resume & Headline", icon: FiFileText },
                    { id: "sec-skills", label: "IT Key Skills", icon: FiCode },
                    { id: "sec-summary", label: "Profile Summary", icon: FiZap },
                    { id: "sec-employment", label: "Employment", icon: FiBriefcase },
                    { id: "sec-education", label: "Education (10th–PG)", icon: FiBook },
                    { id: "sec-projects", label: "IT Projects", icon: FiLayers },
                    { id: "sec-career", label: "Career Profile & Cities", icon: FiCompass },
                    { id: "sec-personal", label: "Personal & Languages", icon: FiSliders }
                ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => scrollToSection(tab.id)}
                            className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition shrink-0 cursor-pointer"
                        >
                            <Icon size={13} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            <div className="space-y-6">
                {/* ========================================================================= */}
                {/* 1. BASIC IDENTITY & CURRENT STATUS (VIEW MODE VS EDIT MODE) */}
                {/* ========================================================================= */}
                <div id="sec-basic" className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-5 scroll-mt-28">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                                <FiUser size={18} />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900">
                                    Basic Identity & Current Status
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Primary contact details, current IT hub city, total experience, and notice period.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {editingSections.basic ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => toggleSectionEdit("basic", false)}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition cursor-pointer"
                                    >
                                        <FiX size={13} />
                                        <span>Cancel</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => handleSubmit(e, "basic")}
                                        disabled={saving}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                                    >
                                        <FiSave size={13} />
                                        <span>Save</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => toggleSectionEdit("basic", true)}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 px-3.5 py-1.5 text-xs font-bold text-indigo-700 transition cursor-pointer"
                                >
                                    <FiEdit2 size={13} />
                                    <span>Edit Info</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* BASIC INFO: VIEW MODE */}
                    {!editingSections.basic ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-1">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Full Name</span>
                                <p className="text-sm font-bold text-slate-900">{formData.fullName || "Not Specified"}</p>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-1">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mobile Number</span>
                                <p className="text-sm font-bold text-slate-900">
                                    {formData.phoneNumber ? `+91 ${formData.phoneNumber}` : "Not Specified"}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-1">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Current Location</span>
                                <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                    <FiMapPin size={14} className="text-indigo-600 shrink-0" />
                                    {formData.location || "Pune"}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-1">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total IT Experience</span>
                                <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                    <FiBriefcase size={14} className="text-indigo-600 shrink-0" />
                                    {Number(formData.experience) > 0 ? `${formData.experience} Years` : "Fresher (0 Years)"}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-1">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Current Designation</span>
                                <p className="text-sm font-bold text-slate-900">{formData.currentDesignation || "Software Engineer"}</p>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-1">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Current Company</span>
                                <p className="text-sm font-bold text-slate-900">{formData.currentCompany || "Not Specified"}</p>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-1">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Notice Period</span>
                                <p className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1 inline-block mt-0.5">
                                    {formData.noticePeriod || "Immediate / Serving Notice"}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-1">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Compensation (CTC)</span>
                                <p className="text-sm font-bold text-slate-900">
                                    {formData.currentSalary ? `₹${formData.currentSalary} LPA` : "Not Disclosed"}
                                    {formData.expectedSalary ? ` • Exp: ₹${formData.expectedSalary} LPA` : ""}
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* BASIC INFO: EDIT MODE */
                        <div className="space-y-4 pt-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        required
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="e.g. Nilesh Borchate"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Mobile Number (10 Digits) *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        required
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        placeholder="9876543210"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Current City (All-India IT Hubs) *
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        list="all-india-cities-datalist"
                                        required
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="Select or type city (e.g. Pune, Bengaluru)"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    />
                                    <datalist id="all-india-cities-datalist">
                                        {ALL_INDIA_IT_CITIES.map((city) => (
                                            <option key={city} value={city} />
                                        ))}
                                    </datalist>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Total IT Experience (Years) *
                                    </label>
                                    <select
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    >
                                        <option value={0}>Fresher (0 Years)</option>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 18, 20].map((yr) => (
                                            <option key={yr} value={yr}>
                                                {yr} {yr === 1 ? "Year" : "Years"} Experience
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Current / Latest Designation
                                    </label>
                                    <input
                                        type="text"
                                        name="currentDesignation"
                                        list="standard-it-designations"
                                        value={formData.currentDesignation}
                                        onChange={handleChange}
                                        placeholder="e.g. Software Engineer, Java Developer"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    />
                                    <datalist id="standard-it-designations">
                                        {IT_DESIGNATIONS.map((role) => (
                                            <option key={role} value={role} />
                                        ))}
                                    </datalist>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Current / Latest IT Company
                                    </label>
                                    <input
                                        type="text"
                                        name="currentCompany"
                                        list="standard-it-companies"
                                        value={formData.currentCompany}
                                        onChange={handleChange}
                                        placeholder="e.g. TCS, Persistent Systems, Fresher"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    />
                                    <datalist id="standard-it-companies">
                                        {TOP_IT_COMPANIES_INDIA.map((comp) => (
                                            <option key={comp} value={comp} />
                                        ))}
                                    </datalist>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Notice Period / Availability
                                    </label>
                                    <select
                                        name="noticePeriod"
                                        value={formData.noticePeriod}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    >
                                        {NOTICE_PERIOD_OPTIONS.map((np) => (
                                            <option key={np} value={np}>
                                                {np}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Current CTC (LPA)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            name="currentSalary"
                                            value={formData.currentSalary}
                                            onChange={handleChange}
                                            placeholder="e.g. 6.5"
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Expected (LPA)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            name="expectedSalary"
                                            value={formData.expectedSalary}
                                            onChange={handleChange}
                                            placeholder="e.g. 10.0"
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => toggleSectionEdit("basic", false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => handleSubmit(e, "basic")}
                                    disabled={saving}
                                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                                >
                                    {saving ? "Saving..." : "Save Basic Info"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ========================================================================= */}
                {/* 2. RESUME & RESUME HEADLINE (VIEW MODE VS EDIT MODE) */}
                {/* ========================================================================= */}
                <div id="sec-resume" className="grid grid-cols-1 lg:grid-cols-12 gap-6 scroll-mt-28">
                    {/* Resume PDF Card */}
                    <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                                    <FiFileText size={18} />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900">Resume / CV (PDF)</h3>
                                    <p className="text-xs text-slate-500">
                                        Attached automatically when applying to jobs.
                                    </p>
                                </div>
                            </div>
                            {resumePath && (
                                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-black text-emerald-700 uppercase">
                                    Ready
                                </span>
                            )}
                        </div>

                        {resumePath ? (
                            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-indigo-200 flex items-center justify-center text-red-500 font-black text-xs shrink-0">
                                        PDF
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-900 truncate">
                                            {resumeFileName || "Candidate_Resume.pdf"}
                                        </p>
                                        <p className="text-[11px] text-emerald-700 font-semibold">
                                            ✓ Verified for 1-Click Job Apply
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 pt-1">
                                    <a
                                        href={getFullResumeUrl()}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-2 text-xs font-bold text-slate-700 transition"
                                    >
                                        <FiDownload size={13} className="text-indigo-600" />
                                        View PDF
                                    </a>
                                    <label className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2 text-xs font-bold text-white cursor-pointer transition">
                                        <FiUploadCloud size={14} />
                                        <span>{uploadingResume ? "Uploading..." : "Update PDF"}</span>
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleResumeUpload}
                                            disabled={uploadingResume}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/60 p-5 text-center space-y-2.5 transition">
                                <FiUploadCloud size={24} className="text-indigo-600 mx-auto" />
                                <p className="text-xs font-bold text-slate-800">
                                    Upload your latest Resume (PDF, max 5MB)
                                </p>
                                <label className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white cursor-pointer transition">
                                    <FiUploadCloud size={14} />
                                    <span>{uploadingResume ? "Uploading..." : "Choose PDF File"}</span>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleResumeUpload}
                                        disabled={uploadingResume}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Resume Headline Card (View vs Edit Mode) */}
                    <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 flex flex-col justify-between">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base font-black text-slate-900">Resume Headline</h3>
                                    <span className="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[9px] font-black text-amber-700 uppercase">
                                        High Search Weight
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    The primary summary recruiters see when browsing candidate search results.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleOpenAiHeadlines}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800 transition cursor-pointer shrink-0"
                                >
                                    <FiZap size={13} className="text-amber-600" />
                                    <span>✨ AI Suggestions</span>
                                </button>
                                {editingSections.resumeHeadline ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => toggleSectionEdit("resumeHeadline", false)}
                                            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-600 transition cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => handleSubmit(e, "resumeHeadline")}
                                            disabled={saving}
                                            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition cursor-pointer"
                                        >
                                            Save
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => toggleSectionEdit("resumeHeadline", true)}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-700 transition cursor-pointer shrink-0"
                                    >
                                        <FiEdit2 size={13} />
                                        <span>Edit Headline</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* HEADLINE: VIEW MODE */}
                        {!editingSections.resumeHeadline ? (
                            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 relative">
                                <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed italic">
                                    "{formData.headline || "Full Stack Engineer | Java, Spring Boot, React.js & AWS | Immediate Joiner"}"
                                </p>
                            </div>
                        ) : (
                            /* HEADLINE: EDIT MODE */
                            <div className="space-y-3">
                                <textarea
                                    rows={2}
                                    name="headline"
                                    value={formData.headline}
                                    onChange={handleChange}
                                    placeholder="e.g. Full Stack Engineer | Java, Spring Boot, React.js & AWS | B.Tech CSE | Immediate Joiner"
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition resize-none"
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => toggleSectionEdit("resumeHeadline", false)}
                                        className="px-4 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => handleSubmit(e, "resumeHeadline")}
                                        disabled={saving}
                                        className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                                    >
                                        {saving ? "Saving..." : "Save Headline"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {showAiHeadlines && (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3.5 space-y-2 mt-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-amber-900">
                                        Click any AI Headline to apply:
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setShowAiHeadlines(false)}
                                        className="text-amber-700 text-xs font-bold"
                                    >
                                        Close
                                    </button>
                                </div>
                                <div className="space-y-1.5">
                                    {aiHeadlines.map((h, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-amber-100"
                                        >
                                            <p className="text-xs font-semibold text-slate-800">{h}</p>
                                            <button
                                                type="button"
                                                onClick={() => handleApplyHeadline(h)}
                                                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold shrink-0 cursor-pointer"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* 3. STANDARDIZED IT KEY SKILLS (VIEW MODE VS EDIT MODE) */}
                {/* ========================================================================= */}
                <div id="sec-skills" className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-5 scroll-mt-28">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                                <FiCode size={18} />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                    IT Key Skills & Technical Stack
                                    <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-extrabold text-indigo-700">
                                        {skillsList.length} Selected
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Standardized skill tags used by recruiters to filter candidate search results.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {editingSections.skills ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => toggleSectionEdit("skills", false)}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition cursor-pointer"
                                    >
                                        <FiX size={13} />
                                        <span>Cancel</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => handleSubmit(e, "skills")}
                                        disabled={saving}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                                    >
                                        <FiSave size={13} />
                                        <span>Save</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => toggleSectionEdit("skills", true)}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 px-3.5 py-1.5 text-xs font-bold text-indigo-700 transition cursor-pointer"
                                >
                                    <FiEdit2 size={13} />
                                    <span>Edit Skills</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* SKILLS: VIEW MODE */}
                    {!editingSections.skills ? (
                        <div className="space-y-3">
                            {skillsList.length > 0 ? (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {skillsList.map((skill) => (
                                        <span
                                            key={skill}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 px-3 py-1.5 text-xs font-bold shadow-2xs hover:border-indigo-400 transition"
                                        >
                                            <FiCode size={12} className="text-indigo-600" />
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
                                    No skills added yet. Click <strong>Edit Skills</strong> above to add skills.
                                </div>
                            )}
                        </div>
                    ) : (
                        /* SKILLS: EDIT MODE */
                        <div className="space-y-4">
                            {/* AI In-Demand IT Skills Recommendation */}
                            {recommendedSkills.length > 0 && (
                                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-3.5 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
                                            <FiZap size={13} className="text-indigo-600" />
                                            AI In-Demand IT Skills for {formData.currentDesignation || "Your Profile"}:
                                        </span>
                                        <span className="text-[10px] text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200 font-bold">
                                            1-Click Add
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {recommendedSkills.map((sk) => (
                                            <button
                                                key={sk}
                                                type="button"
                                                onClick={() => handleAddSkill(sk)}
                                                className="inline-flex items-center gap-1 rounded-xl bg-white border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/80 px-2.5 py-1 text-xs font-bold text-indigo-700 shadow-2xs transition cursor-pointer"
                                            >
                                                <FiPlus size={12} className="text-indigo-600" />
                                                {sk}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Active Skills Box + Live Autocomplete Input */}
                            <div className="relative">
                                <div className="flex flex-wrap items-center gap-2 min-h-[52px] p-3 rounded-2xl bg-slate-50 border border-slate-200 focus-within:bg-white focus-within:border-indigo-600 transition">
                                    {skillsList.map((skill) => (
                                        <span
                                            key={skill}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 text-white px-3 py-1.5 text-xs font-bold shadow-2xs"
                                        >
                                            {skill}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSkill(skill)}
                                                className="hover:text-indigo-200 p-0.5 cursor-pointer"
                                                aria-label={`Remove ${skill}`}
                                            >
                                                <FiX size={12} />
                                            </button>
                                        </span>
                                    ))}

                                    <div className="relative flex-1 min-w-[220px]">
                                        <input
                                            type="text"
                                            value={skillInput}
                                            onFocus={() => setShowSkillAutocomplete(true)}
                                            onBlur={() => setTimeout(() => setShowSkillAutocomplete(false), 180)}
                                            onChange={(e) => {
                                                setSkillInput(e.target.value);
                                                setShowSkillAutocomplete(true);
                                            }}
                                            onKeyDown={handleKeyDownSkill}
                                            placeholder="Search IT skill (e.g. Spring Boot, React.js, AWS, Python) & press Enter..."
                                            className="w-full bg-transparent text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none px-2 py-1"
                                        />
                                    </div>
                                </div>

                                {showSkillAutocomplete && filteredAutocompleteSkills.length > 0 && (
                                    <div className="absolute z-30 mt-1 w-full rounded-2xl border border-slate-200 bg-white shadow-xl p-2.5 flex flex-wrap gap-1.5">
                                        {filteredAutocompleteSkills.map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onMouseDown={() => handleAddSkill(s)}
                                                className="rounded-xl bg-indigo-50 hover:bg-indigo-600 hover:text-white px-3 py-1.5 text-xs font-bold text-indigo-700 transition cursor-pointer"
                                            >
                                                + {s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Categorized IT Skill Explorer */}
                            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-3">
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                                    {Object.keys(IT_SKILLS_CATEGORIES).map((category) => (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() => setActiveSkillCategory(category)}
                                            className={`rounded-xl px-3 py-1.5 text-xs font-bold shrink-0 transition cursor-pointer ${
                                                activeSkillCategory === category
                                                    ? "bg-slate-900 text-white shadow-xs"
                                                    : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                                            }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {(IT_SKILLS_CATEGORIES[activeSkillCategory] || []).map((skill) => {
                                        const exists = skillsList.some(
                                            (s) => s.toLowerCase() === skill.toLowerCase()
                                        );
                                        return (
                                            <button
                                                key={skill}
                                                type="button"
                                                onClick={() =>
                                                    exists ? handleRemoveSkill(skill) : handleAddSkill(skill)
                                                }
                                                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                                                    exists
                                                        ? "bg-emerald-50 border border-emerald-300 text-emerald-800"
                                                        : "bg-white border border-slate-200 text-slate-700 hover:border-indigo-500 hover:text-indigo-600"
                                                }`}
                                            >
                                                {exists ? `✓ ${skill}` : `+ ${skill}`}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => toggleSectionEdit("skills", false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => handleSubmit(e, "skills")}
                                    disabled={saving}
                                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                                >
                                    {saving ? "Saving..." : "Save Skills"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ========================================================================= */}
                {/* 4. MULTI-COMPANY EMPLOYMENT & INTERNSHIP HISTORY */}
                {/* ========================================================================= */}
                <div id="sec-employment" className="scroll-mt-28">
                    <JobSeekerEmploymentSection
                        onEmploymentChange={(list) => {
                            setEmploymentRecords(list || []);
                            if (list && list.length > 0) {
                                const current = list.find((item) => item.isCurrentJob) || list[0];
                                setFormData((prev) => ({
                                    ...prev,
                                    currentCompany: current.companyName || prev.currentCompany,
                                    currentDesignation: current.designation || prev.currentDesignation,
                                    currentSalary:
                                        current.currentCtc !== null && current.currentCtc !== undefined
                                            ? String(current.currentCtc)
                                            : prev.currentSalary,
                                    noticePeriod: current.noticePeriod || prev.noticePeriod,
                                    department: current.department || prev.department
                                }));
                            }
                        }}
                    />
                </div>

                {/* ========================================================================= */}
                {/* 5. MULTI-LEVEL ACADEMIC EDUCATION (10th SSC, 12th HSC, DIPLOMA, GRADUATION, PG) */}
                {/* ========================================================================= */}
                <div id="sec-education" className="scroll-mt-28">
                    <JobSeekerEducationSection
                        onEducationChange={(records) => {
                            setEducationRecords(records || []);
                            if (records && records.length > 0) {
                                const top = records[0];
                                const mappedEnum = mapDegreeToQualificationEnum(
                                    top.educationLevel,
                                    top.degree
                                );
                                setFormData((prev) => ({
                                    ...prev,
                                    highestQualification: mappedEnum,
                                    course: top.degree || prev.course,
                                    collegeName: top.institution || prev.collegeName,
                                    passingYear: top.passingYear ? String(top.passingYear) : prev.passingYear
                                }));
                            }
                        }}
                    />
                </div>

                {/* ========================================================================= */}
                {/* 6. IT PROJECTS & PORTFOLIO SHOWCASE */}
                {/* ========================================================================= */}
                <div id="sec-projects" className="scroll-mt-28">
                    <JobSeekerProjectsSection
                        onProjectsChange={(list) => {
                            setProjectRecords(list || []);
                        }}
                    />
                </div>

                {/* ========================================================================= */}
                {/* 7. CAREER PROFILE & ALL-INDIA PREFERRED CITIES (VIEW MODE VS EDIT MODE) */}
                {/* ========================================================================= */}
                <div id="sec-career" className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-5 scroll-mt-28">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                                <FiCompass size={18} />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900">
                                    Career Profile & Preferred Work Locations
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Target industry, functional area, work mode, shift, and preferred Indian IT cities.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {editingSections.career ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => toggleSectionEdit("career", false)}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition cursor-pointer"
                                    >
                                        <FiX size={13} />
                                        <span>Cancel</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => handleSubmit(e, "career")}
                                        disabled={saving}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                                    >
                                        <FiSave size={13} />
                                        <span>Save</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => toggleSectionEdit("career", true)}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 px-3.5 py-1.5 text-xs font-bold text-indigo-700 transition cursor-pointer"
                                >
                                    <FiEdit2 size={13} />
                                    <span>Edit Career</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* CAREER PROFILE: VIEW MODE */}
                    {!editingSections.career ? (
                        <div className="space-y-4 pt-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-1">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Target Industry</span>
                                    <p className="text-sm font-bold text-slate-900">{formData.currentIndustry || "IT Services & Consulting"}</p>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-1">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Department</span>
                                    <p className="text-sm font-bold text-slate-900">{formData.department || "Engineering - Software & QA"}</p>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-1">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Role Category</span>
                                    <p className="text-sm font-bold text-slate-900">{formData.roleCategory || "Software Development"}</p>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-1">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Preferred Work Mode</span>
                                    <p className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-2.5 py-1 inline-block mt-0.5">
                                        {formData.preferredWorkMode || "Hybrid"}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-1">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Desired Job Type</span>
                                    <p className="text-sm font-bold text-slate-900">{formData.desiredJobType || "Permanent"}</p>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-1">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Employment Type</span>
                                    <p className="text-sm font-bold text-slate-900">{formData.desiredEmploymentType || "Full Time"}</p>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-1">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Preferred Shift</span>
                                    <p className="text-sm font-bold text-slate-900">{formData.preferredShift || "Day Shift"}</p>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-1">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Expected CTC</span>
                                    <p className="text-sm font-bold text-emerald-700">
                                        {formData.expectedSalary ? `₹${formData.expectedSalary} LPA` : "Negotiable"}
                                    </p>
                                </div>
                            </div>

                            {/* Preferred Cities View */}
                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 space-y-2">
                                <span className="text-xs font-black text-emerald-900">
                                    Preferred Work Cities ({preferredCitiesList.length}):
                                </span>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {preferredCitiesList.map((c) => (
                                        <span
                                            key={c}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 text-white px-3 py-1 text-xs font-bold shadow-2xs"
                                        >
                                            <FiMapPin size={11} />
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* CAREER PROFILE: EDIT MODE */
                        <div className="space-y-4 pt-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Current / Target Industry
                                    </label>
                                    <select
                                        name="currentIndustry"
                                        value={formData.currentIndustry}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    >
                                        {IT_INDUSTRIES.map((ind) => (
                                            <option key={ind} value={ind}>
                                                {ind}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Department / Functional Area
                                    </label>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    >
                                        {IT_DEPARTMENTS.map((dept) => (
                                            <option key={dept} value={dept}>
                                                {dept}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Role Category
                                    </label>
                                    <select
                                        name="roleCategory"
                                        value={formData.roleCategory}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    >
                                        {ROLE_CATEGORIES.map((rc) => (
                                            <option key={rc} value={rc}>
                                                {rc}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Preferred Work Mode
                                    </label>
                                    <select
                                        name="preferredWorkMode"
                                        value={formData.preferredWorkMode}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    >
                                        {WORK_MODE_OPTIONS.map((wm) => (
                                            <option key={wm} value={wm}>
                                                {wm}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Desired Job Type
                                    </label>
                                    <select
                                        name="desiredJobType"
                                        value={formData.desiredJobType}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    >
                                        {DESIRED_JOB_TYPES.map((jt) => (
                                            <option key={jt} value={jt}>
                                                {jt}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Desired Employment Type
                                    </label>
                                    <select
                                        name="desiredEmploymentType"
                                        value={formData.desiredEmploymentType}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    >
                                        {DESIRED_EMPLOYMENT_TYPES.map((et) => (
                                            <option key={et} value={et}>
                                                {et}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Preferred Work Shift
                                    </label>
                                    <select
                                        name="preferredShift"
                                        value={formData.preferredShift}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    >
                                        {SHIFT_OPTIONS.map((sh) => (
                                            <option key={sh} value={sh}>
                                                {sh}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Expected Annual Salary (LPA)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        name="expectedSalary"
                                        value={formData.expectedSalary}
                                        onChange={handleChange}
                                        placeholder="e.g. 12.0"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    />
                                </div>
                            </div>

                            {/* Preferred Job Locations (All-India Multi-City Picker) */}
                            <div className="pt-2 space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                    <label className="block text-xs font-bold text-slate-700">
                                        Preferred Work Locations across India ({preferredCitiesList.length} selected)
                                    </label>
                                    <span className="text-[11px] text-slate-400">
                                        Select multiple IT hub cities where you are open to working
                                    </span>
                                </div>

                                <div className="relative">
                                    <div className="flex flex-wrap items-center gap-2 min-h-[48px] p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
                                        {preferredCitiesList.map((city) => (
                                            <span
                                                key={city}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 text-white px-3 py-1 text-xs font-bold"
                                            >
                                                <FiMapPin size={11} />
                                                {city}
                                                <button
                                                    type="button"
                                                    onClick={() => togglePreferredCity(city)}
                                                    className="hover:text-emerald-200 cursor-pointer"
                                                >
                                                    <FiX size={12} />
                                                </button>
                                            </span>
                                        ))}

                                        <input
                                            type="text"
                                            value={citySearchInput}
                                            onFocus={() => setShowCityDropdown(true)}
                                            onBlur={() => setTimeout(() => setShowCityDropdown(false), 180)}
                                            onChange={(e) => {
                                                setCitySearchInput(e.target.value);
                                                setShowCityDropdown(true);
                                            }}
                                            placeholder="Search & add Indian city (e.g. Pune, Bengaluru, Hyderabad, Gurugram)..."
                                            className="flex-1 min-w-[200px] bg-transparent text-xs font-semibold text-slate-800 outline-none px-2 py-1"
                                        />
                                    </div>

                                    {showCityDropdown && filteredCities.length > 0 && (
                                        <div className="absolute z-30 mt-1 w-full rounded-2xl border border-slate-200 bg-white shadow-xl p-2 flex flex-wrap gap-1.5">
                                            {filteredCities.map((c) => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    onMouseDown={() => togglePreferredCity(c)}
                                                    className="rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white px-3 py-1 text-xs font-bold text-slate-700 transition cursor-pointer"
                                                >
                                                    + {c}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="text-[10px] font-black uppercase text-slate-400 mr-1">
                                        Top India IT Hubs:
                                    </span>
                                    {TOP_HUB_CITIES_QUICK.map((city) => {
                                        const selected = preferredCitiesList.some(
                                            (c) => c.toLowerCase() === city.toLowerCase()
                                        );
                                        return (
                                            <button
                                                key={city}
                                                type="button"
                                                onClick={() => togglePreferredCity(city)}
                                                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                                                    selected
                                                        ? "bg-emerald-50 border border-emerald-300 text-emerald-800"
                                                        : "bg-white border border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-700"
                                                }`}
                                            >
                                                {selected ? `✓ ${city}` : `+ ${city}`}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => toggleSectionEdit("career", false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => handleSubmit(e, "career")}
                                    disabled={saving}
                                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                                >
                                    {saving ? "Saving..." : "Save Career Profile"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ========================================================================= */}
                {/* 8. PROFILE SUMMARY & AI ATS GENERATOR (VIEW MODE VS EDIT MODE) */}
                {/* ========================================================================= */}
                <div id="sec-summary" className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-4 scroll-mt-28">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div>
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                Profile Summary / Executive Bio
                                {formData.bio && formData.bio.trim().length >= 25 && (
                                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                                        ✓ Completed (+15%)
                                    </span>
                                )}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Highlights your engineering expertise, tech stack, and career goals for recruiters.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {/* AI Summary Tone Selection */}
                            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                                {[
                                    { id: "professional", label: "👔 Pro" },
                                    { id: "results", label: "📈 Impact" },
                                    { id: "fresher", label: "🎓 Fresher" },
                                    { id: "lead", label: "👑 Lead" }
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => {
                                            setAiSummaryTone(t.id);
                                            handleGenerateAiBio(t.id);
                                        }}
                                        disabled={aiGeneratingBio}
                                        className={`px-2 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer ${
                                            aiSummaryTone === t.id
                                                ? "bg-white text-indigo-700 shadow-2xs"
                                                : "text-slate-600 hover:text-slate-900"
                                        }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={() => handleGenerateAiBio(aiSummaryTone)}
                                disabled={aiGeneratingBio}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100/80 px-3 py-1.5 text-xs font-bold text-indigo-700 transition cursor-pointer"
                            >
                                <FiZap size={13} className="text-indigo-600" />
                                <span>{aiGeneratingBio ? "Writing..." : "✨ AI Generate"}</span>
                            </button>

                            {editingSections.summary ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => toggleSectionEdit("summary", false)}
                                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-600 transition cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => handleSubmit(e, "summary")}
                                        disabled={saving}
                                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                                    >
                                        Save
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => toggleSectionEdit("summary", true)}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 px-3.5 py-1.5 text-xs font-bold text-indigo-700 transition cursor-pointer"
                                >
                                    <FiEdit2 size={13} />
                                    <span>{formData.bio ? "Edit Summary" : "Add Summary"}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* SUMMARY: VIEW MODE */}
                    {!editingSections.summary ? (
                        formData.bio && formData.bio.trim().length >= 10 ? (
                            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                                    {formData.bio}
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center space-y-2.5">
                                <p className="text-xs font-semibold text-slate-600">
                                    No profile summary added yet. A compelling summary helps your profile stand out to recruiters (+15% score).
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => toggleSectionEdit("summary", true)}
                                        className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 transition cursor-pointer"
                                    >
                                        + Type Summary
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleGenerateAiBio("professional")}
                                        disabled={aiGeneratingBio}
                                        className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 text-xs font-bold text-white shadow-xs transition cursor-pointer inline-flex items-center gap-1.5"
                                    >
                                        <FiZap size={13} />
                                        <span>✨ AI Write for Me</span>
                                    </button>
                                </div>
                            </div>
                        )
                    ) : (
                        /* SUMMARY: EDIT MODE */
                        <div className="space-y-3">
                            <textarea
                                rows={4}
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Write a concise professional bio highlighting your experience and key IT skills, or click '✨ AI Generate' above..."
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 text-xs sm:text-sm text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition resize-none leading-relaxed"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => toggleSectionEdit("summary", false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => handleSubmit(e, "summary")}
                                    disabled={saving}
                                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                                >
                                    {saving ? "Saving..." : "Save Summary"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ========================================================================= */}
                {/* 9. PERSONAL DETAILS, LANGUAGES & CODING PROFILES (VIEW MODE VS EDIT MODE) */}
                {/* ========================================================================= */}
                <div id="sec-personal" className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-5 scroll-mt-28">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center">
                                <FiSliders size={18} />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900">
                                    Personal Details, Languages & Coding Profiles
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Personal demographics, known languages, and portfolio links for background verification.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {editingSections.personal ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => toggleSectionEdit("personal", false)}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition cursor-pointer"
                                    >
                                        <FiX size={13} />
                                        <span>Cancel</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => handleSubmit(e, "personal")}
                                        disabled={saving}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                                    >
                                        <FiSave size={13} />
                                        <span>Save</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => toggleSectionEdit("personal", true)}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 px-3.5 py-1.5 text-xs font-bold text-indigo-700 transition cursor-pointer"
                                >
                                    <FiEdit2 size={13} />
                                    <span>Edit Details</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* PERSONAL DETAILS: VIEW MODE */}
                    {!editingSections.personal ? (
                        <div className="space-y-5 pt-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-1">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date of Birth</span>
                                    <p className="text-sm font-bold text-slate-900">{formData.dateOfBirth || "Not Specified"}</p>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-1">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gender</span>
                                    <p className="text-sm font-bold text-slate-900">{formData.gender || "Not Specified"}</p>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-1">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Marital Status</span>
                                    <p className="text-sm font-bold text-slate-900">{formData.maritalStatus || "Single / Unmarried"}</p>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-1">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hometown</span>
                                    <p className="text-sm font-bold text-slate-900">{formData.hometown || formData.location || "Pune"}</p>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-1">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pincode</span>
                                    <p className="text-sm font-bold text-slate-900">{formData.pincode || "Not Specified"}</p>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-1 sm:col-span-2 lg:col-span-3">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Permanent Address</span>
                                    <p className="text-sm font-bold text-slate-900">{formData.permanentAddress || "Not Specified"}</p>
                                </div>
                            </div>

                            {/* Languages Known Badges */}
                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-2">
                                <span className="text-xs font-black text-slate-700">Languages Known:</span>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {languagesList.map((lang) => (
                                        <span
                                            key={lang}
                                            className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 px-3 py-1 text-xs font-bold"
                                        >
                                            ✓ {lang}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Coding Profiles & Portfolio Links */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {formData.linkedinUrl ? (
                                    <a
                                        href={formData.linkedinUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3.5 text-xs font-bold text-slate-800 hover:border-indigo-500 hover:text-indigo-600 transition"
                                    >
                                        <FiLinkedin size={16} className="text-sky-600 shrink-0" />
                                        <span className="truncate">LinkedIn Profile</span>
                                        <FiExternalLink size={12} className="ml-auto text-slate-400" />
                                    </a>
                                ) : (
                                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 text-xs text-slate-400 flex items-center gap-2">
                                        <FiLinkedin size={16} />
                                        <span>No LinkedIn Added</span>
                                    </div>
                                )}

                                {formData.githubUrl ? (
                                    <a
                                        href={formData.githubUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3.5 text-xs font-bold text-slate-800 hover:border-indigo-500 hover:text-indigo-600 transition"
                                    >
                                        <FiGithub size={16} className="text-slate-800 shrink-0" />
                                        <span className="truncate">GitHub Profile</span>
                                        <FiExternalLink size={12} className="ml-auto text-slate-400" />
                                    </a>
                                ) : (
                                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 text-xs text-slate-400 flex items-center gap-2">
                                        <FiGithub size={16} />
                                        <span>No GitHub Added</span>
                                    </div>
                                )}

                                {formData.portfolioUrl ? (
                                    <a
                                        href={formData.portfolioUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3.5 text-xs font-bold text-slate-800 hover:border-indigo-500 hover:text-indigo-600 transition"
                                    >
                                        <FiGlobe size={16} className="text-emerald-600 shrink-0" />
                                        <span className="truncate">Portfolio / Website</span>
                                        <FiExternalLink size={12} className="ml-auto text-slate-400" />
                                    </a>
                                ) : (
                                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 text-xs text-slate-400 flex items-center gap-2">
                                        <FiGlobe size={16} />
                                        <span>No Portfolio Added</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* PERSONAL DETAILS: EDIT MODE */
                        <div className="space-y-4 pt-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Gender *
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    >
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Marital Status
                                    </label>
                                    <select
                                        name="maritalStatus"
                                        value={formData.maritalStatus}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    >
                                        {MARITAL_STATUS_OPTIONS.map((ms) => (
                                            <option key={ms} value={ms}>
                                                {ms}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Hometown / Native City
                                    </label>
                                    <input
                                        type="text"
                                        name="hometown"
                                        list="all-india-cities-datalist"
                                        value={formData.hometown}
                                        onChange={handleChange}
                                        placeholder="e.g. Pune, Nashik, Nagpur"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Area Pincode
                                    </label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        maxLength={6}
                                        value={formData.pincode}
                                        onChange={handleChange}
                                        placeholder="e.g. 411001"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    />
                                </div>

                                <div className="sm:col-span-2 lg:col-span-3">
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Permanent Address
                                    </label>
                                    <input
                                        type="text"
                                        name="permanentAddress"
                                        value={formData.permanentAddress}
                                        onChange={handleChange}
                                        placeholder="Flat / Street / Area / City / State"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    />
                                </div>
                            </div>

                            {/* Diversity & Career Break Toggles */}
                            <div className="flex flex-wrap items-center gap-6 pt-1">
                                <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="differentlyAbled"
                                        checked={formData.differentlyAbled}
                                        onChange={handleChange}
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    Differently Abled (PwD Candidate)
                                </label>
                                <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="careerBreak"
                                        checked={formData.careerBreak}
                                        onChange={handleChange}
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    Have you taken a Career Break?
                                </label>
                            </div>

                            {/* Languages Known Selector */}
                            <div className="space-y-2 pt-2 border-t border-slate-100">
                                <label className="block text-xs font-bold text-slate-700">
                                    Languages Known ({languagesList.join(", ")})
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {INDIAN_LANGUAGES.map((lang) => {
                                        const active = languagesList.includes(lang);
                                        return (
                                            <button
                                                key={lang}
                                                type="button"
                                                onClick={() => toggleLanguage(lang)}
                                                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                                                    active
                                                        ? "bg-indigo-600 text-white shadow-2xs"
                                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                }`}
                                            >
                                                {active ? `✓ ${lang}` : `+ ${lang}`}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Social & Coding Links */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        LinkedIn Profile URL
                                    </label>
                                    <div className="relative flex items-center">
                                        <FiLinkedin size={14} className="absolute left-3.5 text-slate-400" />
                                        <input
                                            type="url"
                                            name="linkedinUrl"
                                            value={formData.linkedinUrl}
                                            onChange={handleChange}
                                            placeholder="https://linkedin.com/in/username"
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        GitHub Profile URL
                                    </label>
                                    <div className="relative flex items-center">
                                        <FiGithub size={14} className="absolute left-3.5 text-slate-400" />
                                        <input
                                            type="url"
                                            name="githubUrl"
                                            value={formData.githubUrl}
                                            onChange={handleChange}
                                            placeholder="https://github.com/username"
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Portfolio / LeetCode URL
                                    </label>
                                    <div className="relative flex items-center">
                                        <FiGlobe size={14} className="absolute left-3.5 text-slate-400" />
                                        <input
                                            type="url"
                                            name="portfolioUrl"
                                            value={formData.portfolioUrl}
                                            onChange={handleChange}
                                            placeholder="https://yourportfolio.dev"
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => toggleSectionEdit("personal", false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => handleSubmit(e, "personal")}
                                    disabled={saving}
                                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                                >
                                    {saving ? "Saving..." : "Save Personal Details"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* FLOATING ACTION BAR */}
                <div className="sticky bottom-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-3xl bg-slate-900/95 backdrop-blur-md px-6 py-4 text-white shadow-2xl border border-slate-800">
                    <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                        <p className="text-xs font-bold text-slate-200">
                            {saving
                                ? "Syncing all profile sections with Recruiter Search Engine..."
                                : isAnyEditing
                                ? "You have open edit sections. Click 'Save Complete Profile' to save and view your profile."
                                : "Candidate profile is fully synced and displayed. Click 'Edit Full Profile' or any section's edit button to modify."}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {isAnyEditing ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setAllEditMode(false)}
                                    className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-slate-200 transition cursor-pointer"
                                >
                                    View Mode
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSubmit()}
                                    disabled={saving}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-6 py-2.5 text-xs font-black text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] cursor-pointer shrink-0"
                                >
                                    <FiCheck size={15} />
                                    {saving ? "Saving Profile..." : "Save Complete Profile"}
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setAllEditMode(true)}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 text-xs font-black text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] cursor-pointer shrink-0"
                            >
                                <FiEdit2 size={15} />
                                <span>Edit Full Profile</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* AI ENGINE & LLM CONFIGURATION MODAL */}
            {showAiSettingsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                                    <FiZap size={18} />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900">
                                        HireSphere AI Assistant Settings
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Configure your AI text & headline generation engine
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAiSettingsModal(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-xs font-bold text-slate-700">
                                Choose AI Generation Engine:
                            </label>

                            <div
                                onClick={() => {
                                    const updated = { ...aiSettings, mode: "local" };
                                    setAiSettingsState(updated);
                                    saveAiSettings(updated);
                                }}
                                className={`p-4 rounded-2xl border cursor-pointer transition ${
                                    aiSettings.mode === "local"
                                        ? "border-indigo-600 bg-indigo-50/50 shadow-xs"
                                        : "border-slate-200 hover:border-slate-300"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black text-slate-900">
                                            ⚡ HireSphere Fast AI Engine
                                        </span>
                                        <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5">
                                            Default & Recommended
                                        </span>
                                    </div>
                                    <input
                                        type="radio"
                                        name="ai_engine"
                                        checked={aiSettings.mode === "local"}
                                        onChange={() => {}}
                                        className="text-indigo-600 focus:ring-indigo-500"
                                    />
                                </div>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                    Zero latency, 100% free, deterministic Naukri.com-grade ATS optimization algorithms. Runs completely client-side without any external API key or token limits.
                                </p>
                            </div>

                            <div
                                onClick={() => {
                                    const updated = { ...aiSettings, mode: "gemini" };
                                    setAiSettingsState(updated);
                                    saveAiSettings(updated);
                                }}
                                className={`p-4 rounded-2xl border cursor-pointer transition ${
                                    aiSettings.mode === "gemini"
                                        ? "border-indigo-600 bg-indigo-50/50 shadow-xs"
                                        : "border-slate-200 hover:border-slate-300"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black text-slate-900">
                                            🤖 Google Gemini Generative AI (LLM)
                                        </span>
                                        <span className="rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2 py-0.5">
                                            Generative LLM
                                        </span>
                                    </div>
                                    <input
                                        type="radio"
                                        name="ai_engine"
                                        checked={aiSettings.mode === "gemini"}
                                        onChange={() => {}}
                                        className="text-indigo-600 focus:ring-indigo-500"
                                    />
                                </div>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                    Uses live large language models for nuanced, bespoke career pitch writing and deep resume synthesis.
                                </p>

                                {aiSettings.mode === "gemini" && (
                                    <div className="mt-3 pt-3 border-t border-slate-100">
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                            Gemini API Key (Optional / Free Tier):
                                        </label>
                                        <input
                                            type="password"
                                            value={aiSettings.geminiApiKey || ""}
                                            onChange={(e) => {
                                                const updated = { ...aiSettings, geminiApiKey: e.target.value };
                                                setAiSettingsState(updated);
                                                saveAiSettings(updated);
                                            }}
                                            placeholder="AIzaSy..."
                                            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-indigo-600"
                                        />
                                        <p className="text-[10px] text-slate-500 mt-1">
                                            If left blank, it automatically falls back to the smart built-in generator.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setShowAiSettingsModal(false)}
                                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobSeekerProfile;
