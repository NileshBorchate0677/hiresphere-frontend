/**
 * AI Career & Match Assistant for HireSphere Job Seekers
 * Inspired by Naukri.com AI Match, ATS Optimization & Profile Booster
 */

/**
 * AI Engine Configuration & Persistence
 */
export const getAiSettings = () => {
    try {
        const stored = localStorage.getItem("hiresphere_ai_settings");
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn("Could not read AI settings:", e);
    }
    return {
        mode: "local", // 'local' (HireSphere Fast AI) or 'gemini' (Google Gemini LLM)
        geminiApiKey: ""
    };
};

export const saveAiSettings = (settings) => {
    try {
        localStorage.setItem("hiresphere_ai_settings", JSON.stringify(settings));
    } catch (e) {
        console.warn("Could not save AI settings:", e);
    }
};

/**
 * Calculates AI Match Score between a Job and Candidate Profile
 */
export const calculateJobMatch = (job, profile) => {
    if (!job) return { score: 70, level: "Moderate Match", matchedSkills: [], missingSkills: [] };

    const jobSkills = (job.skills || job.requiredSkills || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

    const candidateSkills = (profile?.skills || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

    const matchedSkills = [];
    const missingSkills = [];

    jobSkills.forEach((skill) => {
        if (candidateSkills.some((cs) => cs.includes(skill) || skill.includes(cs))) {
            matchedSkills.push(skill);
        } else {
            missingSkills.push(skill);
        }
    });

    let score = 50; // base score

    // Skill match contribution (up to 35%)
    if (jobSkills.length > 0) {
        const skillRatio = matchedSkills.length / jobSkills.length;
        score += Math.round(skillRatio * 35);
    } else if (candidateSkills.length > 0) {
        // Fallback keyword check
        const hasKeywordMatch = candidateSkills.some((cs) =>
            (job.title || "").toLowerCase().includes(cs)
        );
        score += hasKeywordMatch ? 25 : 15;
    }

    // Experience match contribution (up to 15%)
    const candidateExp = Number(profile?.experience) || 0;
    const minJobExp = Number(job.minExperience || job.experienceRequired || 0);
    if (candidateExp >= minJobExp) {
        score += 15;
    } else if (candidateExp >= minJobExp - 1) {
        score += 8;
    }

    // Cap score between 45 and 98
    score = Math.min(98, Math.max(45, score));

    let level = "Moderate Match";
    let color = "text-amber-600 bg-amber-50 border-amber-200";
    if (score >= 85) {
        level = "High Match";
        color = "text-emerald-700 bg-emerald-50 border-emerald-200";
    } else if (score >= 70) {
        level = "Strong Match";
        color = "text-indigo-700 bg-indigo-50 border-indigo-200";
    }

    return {
        score,
        level,
        color,
        matchedSkills,
        missingSkills
    };
};

/**
 * Calculates Profile Completeness with TRUE Naukri.com 7-Section Breakdown:
 * 1. Basic Details & Contact (15%)
 * 2. Resume PDF Upload (15%)
 * 3. Resume Headline (10%)
 * 4. Key Skills (15%)
 * 5. Employment / Work History (15%)
 * 6. Academic Education (15%)
 * 7. Profile Summary / Bio (15%)
 * Total = 100%
 */
export const calculateProfileCompleteness = (profile) => {
    if (!profile) {
        return {
            percentage: 0,
            score: 0,
            missing: [
                { label: "Basic Details", boost: "+15%", sectionId: "sec-basic" },
                { label: "Resume PDF", boost: "+15%", sectionId: "sec-resume" },
                { label: "Resume Headline", boost: "+10%", sectionId: "sec-headline" },
                { label: "Key Skills", boost: "+15%", sectionId: "sec-skills" },
                { label: "Employment", boost: "+15%", sectionId: "sec-employment" },
                { label: "Education", boost: "+15%", sectionId: "sec-education" },
                { label: "Profile Summary", boost: "+15%", sectionId: "sec-summary" }
            ],
            sections: []
        };
    }

    // 1. Basic Details (Full Name + Mobile + Location)
    const hasBasic = Boolean(
        profile.fullName &&
        String(profile.fullName).trim().length >= 3 &&
        (profile.phoneNumber || profile.location)
    );

    // 2. Resume PDF Upload
    const hasResume = Boolean(
        (profile.resumeUrl && String(profile.resumeUrl).trim().length > 3) ||
        (profile.resumePath && String(profile.resumePath).trim().length > 3) ||
        (profile.resumeFileName && String(profile.resumeFileName).trim().length > 3)
    );

    // 3. Resume Headline
    const hasHeadline = Boolean(
        profile.headline &&
        String(profile.headline).trim().length >= 8
    );

    // 4. Key Skills (At least 3 valid skills)
    const skillsList = profile.skills
        ? (Array.isArray(profile.skills)
            ? profile.skills
            : String(profile.skills).split(",")
          )
            .map((s) => s.trim())
            .filter((s) => s.length >= 2)
        : [];
    const hasSkills = skillsList.length >= 3;

    // 5. Employment / Work History
    // Complete if child employment records exist OR explicit currentCompany & designation entered
    const hasEmployment = Boolean(
        (profile.employmentCount && profile.employmentCount > 0) ||
        (profile.currentCompany &&
            String(profile.currentCompany).trim().length >= 2 &&
            profile.currentDesignation &&
            String(profile.currentDesignation).trim().length >= 2) ||
        (profile.experience === 0 && profile.noticePeriod && profile.currentIndustry)
    );

    // 6. Education
    // Complete ONLY if child education records exist OR real college name and qualification are filled
    const hasEducation = Boolean(
        (profile.educationCount && profile.educationCount > 0) ||
        (profile.collegeName &&
            String(profile.collegeName).trim().length >= 4 &&
            (profile.highestQualification || profile.course))
    );

    // 7. Profile Summary / Bio (Must have meaningful content of at least 25 characters)
    const summaryText = profile.summary || profile.bio || "";
    const hasSummary = Boolean(String(summaryText).trim().length >= 25);

    const sections = [
        {
            name: "Basic Details",
            label: "Basic Details",
            boost: "+15%",
            weight: 15,
            sectionId: "sec-basic",
            isComplete: hasBasic
        },
        {
            name: "Resume PDF",
            label: "Resume PDF",
            boost: "+15%",
            weight: 15,
            sectionId: "sec-resume",
            isComplete: hasResume
        },
        {
            name: "Resume Headline",
            label: "Resume Headline",
            boost: "+10%",
            weight: 10,
            sectionId: "sec-headline",
            isComplete: hasHeadline
        },
        {
            name: "Key Skills",
            label: "Key Skills",
            boost: "+15%",
            weight: 15,
            sectionId: "sec-skills",
            isComplete: hasSkills
        },
        {
            name: "Employment",
            label: "Employment",
            boost: "+15%",
            weight: 15,
            sectionId: "sec-employment",
            isComplete: hasEmployment
        },
        {
            name: "Education",
            label: "Education",
            boost: "+15%",
            weight: 15,
            sectionId: "sec-education",
            isComplete: hasEducation
        },
        {
            name: "Profile Summary",
            label: "Profile Summary",
            boost: "+15%",
            weight: 15,
            sectionId: "sec-summary",
            isComplete: hasSummary
        }
    ];

    let completedWeight = 0;
    const missing = [];

    sections.forEach((sec) => {
        if (sec.isComplete) {
            completedWeight += sec.weight;
        } else {
            missing.push({ label: sec.label, boost: sec.boost, sectionId: sec.sectionId });
        }
    });

    const finalScore = Math.min(100, Math.max(0, completedWeight));

    return {
        percentage: finalScore,
        score: finalScore,
        missing,
        sections
    };
};

/**
 * AI In-Demand IT Skills Suggester based on Candidate Role & Existing Skills
 */
export const getAiRecommendedSkills = (role = "", existingSkills = []) => {
    const r = (role || "").toLowerCase();
    const existingLower = (existingSkills || []).map((s) => s.toLowerCase().trim());

    const catalog = {
        frontend: ["React.js", "TypeScript", "Tailwind CSS", "Next.js", "Redux Toolkit", "REST APIs", "GraphQL", "Jest"],
        backend: ["Java", "Spring Boot", "Microservices", "PostgreSQL", "Docker", "Kubernetes", "Kafka", "AWS", "Redis"],
        fullstack: ["Java", "Spring Boot", "React.js", "TypeScript", "PostgreSQL", "Docker", "AWS", "Microservices", "REST APIs", "Git"],
        cloud: ["AWS", "Terraform", "Docker", "Kubernetes", "CI/CD", "Linux", "Prometheus", "Python", "CloudWatch"],
        qa: ["Selenium", "Postman", "Cypress", "Java", "TestNG", "JIRA", "API Testing", "Playwright"],
        data: ["Python", "SQL", "Pandas", "Power BI", "Spark", "Machine Learning", "Airflow", "BigQuery"]
    };

    let targetPool = catalog.fullstack;
    if (r.includes("front") || r.includes("ui") || r.includes("react")) {
        targetPool = catalog.frontend;
    } else if (r.includes("cloud") || r.includes("devops") || r.includes("sre")) {
        targetPool = catalog.cloud;
    } else if (r.includes("qa") || r.includes("test")) {
        targetPool = catalog.qa;
    } else if (r.includes("data") || r.includes("analytics")) {
        targetPool = catalog.data;
    } else if (r.includes("back") || r.includes("java") || r.includes("spring")) {
        targetPool = catalog.backend;
    }

    // Return recommendations not yet added by the candidate
    return targetPool.filter((skill) => !existingLower.some((es) => es === skill.toLowerCase())).slice(0, 6);
};

/**
 * Generates ATS-friendly Naukri-style Profile Headlines
 */
export const generateAIProfileHeadlines = (profile) => {
    const role = profile?.currentDesignation || "Software Engineer";
    const expYears = Number(profile?.experience) || 0;
    const exp = expYears > 0 ? `${expYears}+ Years Experience` : "Passionate Tech Graduate / Fresher";
    const skillsList = profile?.skills
        ? (Array.isArray(profile.skills) ? profile.skills : profile.skills.split(","))
              .map((s) => s.trim())
              .filter(Boolean)
        : [];
    const skills = skillsList.slice(0, 4).join(" | ") || "Java | Spring Boot | React.js | SQL";
    const notice = profile?.noticePeriod || "Immediate Joiner";

    return [
        `${role} | ${skills} | ${exp} | ${notice}`,
        `Results-driven ${role} with expertise in ${skills} • Seeking High-Impact Roles in Top IT Hubs`,
        `${role} (${exp}) specializing in ${skills} • Ready for Immediate Onboarding`,
        `Experienced ${role} skilled in building robust enterprise solutions using ${skills} (${notice})`
    ];
};

/**
 * Generates AI ATS Professional Bio Summary with Tone Selection
 */
export const generateAIProfileSummary = (profile, tone = "professional") => {
    const role = profile?.currentDesignation || "Software Engineer";
    const expYears = Number(profile?.experience) || 0;
    const exp = expYears > 0 ? `${expYears} years` : "solid foundational academic and project";
    const skills = profile?.skills
        ? (Array.isArray(profile.skills) ? profile.skills.join(", ") : profile.skills)
        : "Java, Spring Boot, React.js, and Cloud Infrastructure";
    const qual = profile?.course || profile?.highestQualification || "Computer Science & Engineering";
    const company = profile?.currentCompany ? ` at ${profile.currentCompany}` : "";

    if (tone === "results") {
        return `Results-oriented ${role}${company} with ${exp} of hands-on experience driving software engineering excellence. Proven track record in designing resilient backends and intuitive frontends using ${skills}. Recognized for improving system uptime, automating CI/CD pipelines, and delivering scalable distributed architectures. Driven by measurable business impact and agile product delivery.`;
    }

    if (tone === "fresher" || expYears === 0) {
        return `Eager and highly motivated ${qual} graduate aspiring to excel as a ${role}. Strong conceptual and practical grasp of ${skills}, demonstrated through comprehensive full-stack academic capstones and hands-on projects. Fast learner adept at modern clean code patterns, algorithms, and agile methodologies. Eager to contribute fresh perspectives and technical zeal to a dynamic engineering team.`;
    }

    if (tone === "lead" || expYears >= 5) {
        return `Accomplished ${role}${company} with ${exp} of leadership and architectural expertise in delivering high-volume enterprise platforms. Proficient in architecting microservices with ${skills}. Adept at mentoring high-performing engineering squads, steering code reviews, and aligning technical roadmaps with business objectives.`;
    }

    // Default: Professional
    return `Dynamic and detail-oriented ${role}${company} with ${exp} of proven experience in architecting and delivering high-quality web applications. Proficient in ${skills} with a strong foundation in ${qual}. Adept at clean coding practices, Agile development, and building scalable cloud-ready architectures. Seeking challenging opportunities to drive software innovation and business value.`;
};

/**
 * Generates AI-Crafted Cover Letter / Recruiter Note
 */
export const generateAICoverLetter = (job, profile) => {
    const candidateName = profile?.fullName || "Candidate";
    const jobTitle = job?.title || "Software Engineer";
    const company = job?.companyName || "your prestigious organization";
    const expYears = Number(profile?.experience) || 0;
    const exp = expYears > 0 ? `${expYears} years` : "hands-on project";
    const currentRole = profile?.currentDesignation || "software engineer";
    const skills = profile?.skills
        ? (Array.isArray(profile.skills) ? profile.skills.slice(0, 4).join(", ") : profile.skills.split(",").slice(0, 4).join(", "))
        : "modern frameworks and cloud solutions";

    return `Dear Hiring Team at ${company},

I am writing to express my strong enthusiasm for the ${jobTitle} position. With over ${exp} of experience as a ${currentRole} specializing in ${skills}, I am confident in my ability to immediately contribute to your team's success.

Throughout my career, I have focused on engineering scalable, high-performance applications and collaborating across cross-functional engineering teams. Your opening for ${jobTitle} aligns seamlessly with my technical strengths and career goals.

I would welcome the opportunity to discuss how my hands-on background and dedication can add measurable value to ${company}. Thank you for your time and consideration.

Best regards,
${candidateName}`;
};
