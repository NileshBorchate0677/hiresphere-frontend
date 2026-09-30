/**
 * HireSphere LLM AI Engine (Gemini API Integration with Smart Fallback)
 * 
 * Provides production-grade AI intelligence for:
 * 1. AI Job Description & Role Requirements Generation
 * 2. AI Candidate Resume & Profile Match Analysis
 * 3. AI Screening Questions Generator
 * 4. AI Candidate Outreach / Interview Email Generator
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/**
 * Direct call to Gemini LLM API if key is present, else gracefully falls back to intelligent template heuristics
 */
export async function callGeminiLLM(prompt, fallbackGenerator) {
    if (GEMINI_API_KEY) {
        try {
            const res = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1000,
                    },
                }),
            });

            if (res.ok) {
                const data = await res.json();
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) return text.trim();
            }
        } catch (e) {
            console.warn("Gemini API call failed, falling back to local heuristic LLM engine:", e);
        }
    }

    // High-quality deterministic heuristic LLM simulator (instant & reliable)
    return fallbackGenerator();
}

/**
 * 1. Generate Job Description & Recommended Skills
 */
export async function generateJobDescriptionAI({ title, experience, location, jobType }) {
    const prompt = `You are an expert HR recruiter. Generate a professional job description and required skills list for an IT job with:
Title: ${title}
Experience: ${experience || "2-5"} years
Location: ${location || "India / Hybrid"}
Job Type: ${jobType || "Full Time"}

Provide clear sections:
1. About the Role
2. Key Responsibilities (4-5 bullet points)
3. Mandatory Technical Skills
4. Qualifications & Nice to Have`;

    return callGeminiLLM(prompt, () => {
        const titleLow = (title || "").toLowerCase();
        let roleType = "Software Engineer";
        let skills = "Java, Spring Boot, Microservices, REST APIs, SQL, Git";

        if (titleLow.includes("react") || titleLow.includes("front") || titleLow.includes("ui")) {
            roleType = "Frontend Developer";
            skills = "React.js, TypeScript, Next.js, Tailwind CSS, Redux, HTML5/CSS3, Jest, Webpack";
        } else if (titleLow.includes("python") || titleLow.includes("data") || titleLow.includes("ai") || titleLow.includes("ml")) {
            roleType = "Data / Python Engineer";
            skills = "Python, FastAPI, Pandas, PostgreSQL, Docker, AWS, Machine Learning, Scikit-learn";
        } else if (titleLow.includes("cloud") || titleLow.includes("devops")) {
            roleType = "DevOps & Cloud Engineer";
            skills = "AWS, Docker, Kubernetes, Terraform, CI/CD, Linux, Jenkins, Prometheus";
        } else if (titleLow.includes("node") || titleLow.includes("full") || titleLow.includes("mern")) {
            roleType = "Full Stack Engineer";
            skills = "Node.js, Express, React.js, MongoDB, TypeScript, REST APIs, Docker, Git";
        } else if (titleLow.includes("qa") || titleLow.includes("test")) {
            roleType = "QA Automation Engineer";
            skills = "Selenium, Cypress, Java/Python, TestNG, Postman, API Automation, JIRA, SQL";
        }

        const description = `About the Role:
We are seeking a talented and proactive ${title || roleType} to join our engineering division. In this position, you will design, develop, and deploy enterprise-grade software solutions while collaborating closely with product managers and cross-functional teams.

Key Responsibilities:
• Architect, implement, and maintain high-performance, robust, and scalable applications.
• Write clean, testable, and well-documented code adhering to industry best practices and code standards.
• Optimize application performance, resolve critical production bottlenecks, and ensure 99.9% uptime.
• Participate in Agile sprint cycles, daily standups, architectural reviews, and comprehensive code audits.
• Work in partnership with DevOps and QA to implement automated CI/CD deployment pipelines.

Required Technical Skills:
• Proven expertise with core stack: ${skills}.
• Hands-on familiarity with cloud environments, containerization, and relational/NoSQL databases.
• Strong analytical reasoning, problem-solving mindset, and effective communication skills.

Qualifications:
• Bachelor's or Master's degree in Computer Science, Information Technology, or equivalent practical experience.
• Minimum ${experience ? experience + " years" : "2+ years"} of industry track record in production systems.`;

        return {
            description,
            skills,
        };
    });
}

/**
 * 2. Analyze Candidate Profile Match with Job Description
 */
export async function analyzeCandidateMatchAI({ candidate, job }) {
    const prompt = `Analyze this candidate fit for the job:
Job Title: ${job?.title || "IT Role"}
Job Skills: ${job?.requiredSkills || "General IT skills"}
Job Exp: ${job?.experienceRequired || "0"} years

Candidate Name: ${candidate?.fullName || candidate?.name}
Candidate Exp: ${candidate?.experience || 0} years
Candidate Skills: ${candidate?.skills || "Not provided"}

Give a concise match assessment with:
1. Match Score (e.g., 88%)
2. Key Strengths
3. Potential Skill Gaps
4. Recommendation (Strong Hire / Consider / Not Recommended)`;

    return callGeminiLLM(prompt, () => {
        const candidateExp = Number(candidate?.experience || candidate?.experienceYears || 0);
        const reqExp = Number(job?.experienceRequired || 0);
        
        let score = 70;
        if (candidateExp >= reqExp) score += 15;
        else if (candidateExp >= reqExp - 1) score += 8;
        else score -= 10;

        const candidateSkills = String(candidate?.skills || "").toLowerCase();
        const jobSkills = String(job?.requiredSkills || "").toLowerCase();
        
        let matchingSkills = [];
        let missingSkills = [];
        if (jobSkills) {
            jobSkills.split(",").forEach(sk => {
                const s = sk.trim();
                if (!s) return;
                if (candidateSkills.includes(s)) {
                    matchingSkills.push(s);
                } else {
                    missingSkills.push(s);
                }
            });
        }

        if (matchingSkills.length > 0) score += 12;
        score = Math.min(Math.max(score, 60), 96);

        let recommendation = "Recommended for Interview";
        if (score >= 88) recommendation = "Strong Candidate (Top 10%)";
        else if (score < 70) recommendation = "Review Additional Credentials";

        return {
            score,
            recommendation,
            strengths: matchingSkills.length > 0 
                ? `Strong capability in ${matchingSkills.slice(0, 4).join(", ")}.` 
                : "Practical experience aligns well with primary role domain.",
            skillGaps: missingSkills.length > 0
                ? `Potential gap in: ${missingSkills.slice(0, 4).join(", ")}.`
                : "No major technical skill gaps identified.",
            insights: `${candidateExp >= reqExp ? "Meets or exceeds" : "Slightly below"} experience benchmark (${candidateExp} yrs vs ${reqExp} yrs required).`,
        };
    });
}

/**
 * 3. Generate Smart Interview Screening Questions
 */
export async function generateScreeningQuestionsAI(jobTitle, skills) {
    const list = [
        `How do you architect and manage state and asynchronous data flows in a production ${jobTitle || "software"} project?`,
        `Describe a challenging performance issue or production bug you encountered with ${skills ? skills.split(",")[0] : "your primary tech stack"} and how you diagnosed it.`,
        `How do you design database schemas or API contracts to maintain backward compatibility during zero-downtime deployments?`,
        `What strategies do you follow to ensure test-driven development, CI/CD automated validation, and high code quality?`,
    ];
    return list;
}

/**
 * 4. AI Market Salary Predictor (Benchmark CTC suggestion)
 */
export async function predictMarketSalaryAI({ title, experience, location }) {
    const prompt = `Based on Indian IT market compensation trends:
Title: ${title}
Experience: ${experience || "3"} years
Location: ${location || "India"}

Return realistic minimum and maximum annual salary in INR (numbers only, e.g. min: 800000, max: 1400000).`;

    return callGeminiLLM(prompt, () => {
        const exp = Number(experience || 2);
        const t = (title || "").toLowerCase();

        let baseMin = 400000;
        let baseMax = 700000;

        if (exp === 0) {
            baseMin = 350000;
            baseMax = 600000;
        } else if (exp <= 2) {
            baseMin = 450000;
            baseMax = 800000;
        } else if (exp <= 5) {
            baseMin = 800000;
            baseMax = 1500000;
        } else {
            baseMin = 1600000;
            baseMax = 2800000;
        }

        // Tech stack premium
        if (t.includes("ai") || t.includes("ml") || t.includes("cloud") || t.includes("devops") || t.includes("architect")) {
            baseMin = Math.round(baseMin * 1.25);
            baseMax = Math.round(baseMax * 1.3);
        }

        return {
            minSalary: baseMin,
            maxSalary: baseMax,
            reasoning: `Market benchmark for ${title || "IT Role"} with ${exp} yrs exp in India.`,
        };
    });
}

/**
 * 6. Generate Job Seeker Professional Summary for Profile
 */
export async function generateProfileSummaryAI({ name, title, experience, skills }) {
    const prompt = `Write a concise 3-4 sentence professional summary for a job seeker's profile:
Name: ${name || "the candidate"}
Current/Target Role: ${title || "Software Developer"}
Experience: ${experience || "2"} years
Skills: ${skills || "JavaScript, React, Node.js"}

The summary should be professional, confident, highlight value, and be suitable for a job portal profile. Keep it under 120 words.`;

    return callGeminiLLM(prompt, () => {
        const exp = Number(experience || 1);
        const t = (title || "Software Developer").trim();
        const sk = (skills || "").split(",").slice(0, 3).map(s => s.trim()).join(", ");

        let levelTag = exp <= 1 ? "A motivated and quick-learning fresher" : exp <= 4 ? "A results-driven professional" : "A seasoned senior professional";

        return `${levelTag} with ${exp > 0 ? exp + "+ years" : "hands-on internship"} of experience in ${t || "software development"}. Proficient in ${sk || "modern technologies"} with a demonstrated ability to deliver high-quality solutions in fast-paced, collaborative environments. Passionate about clean code, best practices, and continuous learning. Seeking a challenging opportunity to contribute meaningfully to a forward-thinking organization.`;
    });
}

/**
 * 7. AI-Drafted Cover Letter / Application Note for Job Seekers
 */
export async function generateCoverLetterAI({ candidateName, jobTitle, company, skills, experience }) {
    const prompt = `Write a professional cover letter note (max 180 words) for a job application:
Candidate: ${candidateName || "the candidate"}
Applying For: ${jobTitle || "Software Developer"}
Company: ${company || "the company"}
Experience: ${experience || "2"} years
Key Skills: ${skills || "JavaScript, React.js, Node.js"}

The note should be personalized, confident, and end with a call to interview.`;

    return callGeminiLLM(prompt, () => {
        const exp = Number(experience || 1);
        const skArr = (skills || "JavaScript, React.js").split(",").slice(0, 3).map(s => s.trim());

        return `Dear Hiring Team at ${company || "your company"},

I am excited to apply for the ${jobTitle || "Software Developer"} position. With ${exp > 0 ? exp + "+ years" : "hands-on"} of experience in ${skArr.join(", ")}, I have consistently delivered high-quality, scalable solutions aligned with business goals.

I am particularly drawn to this opportunity because of the exciting challenges it presents and the chance to contribute my expertise to a team that values excellence and innovation.

I look forward to discussing how my background and passion for technology align with your team's vision. Thank you for considering my application.

Warm regards,
${candidateName || "The Applicant"}`;
    });
}

/**
 * 5. Quick Skill Tag Recommendations for 1-click addition
 */
export function getQuickSkillSuggestions(title) {
    const t = (title || "").toLowerCase();
    if (t.includes("react") || t.includes("front") || t.includes("ui")) {
        return ["React.js", "TypeScript", "Tailwind CSS", "Redux Toolkit", "Next.js", "Jest", "HTML5", "REST APIs"];
    }
    if (t.includes("java") || t.includes("spring")) {
        return ["Java", "Spring Boot", "Microservices", "Hibernate", "PostgreSQL", "Docker", "Kafka", "REST APIs"];
    }
    if (t.includes("python") || t.includes("data") || t.includes("ai") || t.includes("ml")) {
        return ["Python", "FastAPI", "Pandas", "PostgreSQL", "Docker", "Machine Learning", "AWS", "PyTorch"];
    }
    if (t.includes("node") || t.includes("full") || t.includes("mern")) {
        return ["Node.js", "Express.js", "React.js", "MongoDB", "TypeScript", "Docker", "AWS", "Git"];
    }
    if (t.includes("devops") || t.includes("cloud")) {
        return ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Linux", "Jenkins", "Ansible"];
    }
    if (t.includes("qa") || t.includes("test")) {
        return ["Selenium", "Cypress", "Java/Python", "Postman", "TestNG", "JIRA", "API Testing", "Git"];
    }
    return ["JavaScript", "Python", "SQL", "Git", "REST APIs", "Agile", "Problem Solving", "Docker"];
}

/**
 * 8. AI Career Assistant & Interview Preparation Generator (LLM)
 */
export async function generateMockInterviewPrepAI({ roleTitle, skills, experienceYears }) {
    const prompt = `You are a Principal Tech Recruiter and Technical Interviewer at a top tier IT firm.
Prepare an interview preparation kit for a candidate with:
Target Role: ${roleTitle || "Software Engineer"}
Primary Skills: ${skills || "Full Stack Web Development"}
Experience: ${experienceYears || 2} years

Provide:
1. 3 Likely Technical Round Questions with quick bullet-point answer tips
2. 2 Behavioral / Situational Questions (STAR method tip)
3. 1 High-Impact Negotiation / Preparation Tip`;

    return callGeminiLLM(prompt, () => {
        const title = roleTitle || "Software Engineer";
        const skList = (skills || "JavaScript, React, Node.js").split(",").slice(0, 3).map(s => s.trim());
        const primary = skList[0] || "core architecture";

        return {
            technicalQuestions: [
                {
                    q: `How do you handle scalable architecture and state consistency when working with ${primary}?`,
                    tip: "Explain decoupled components, immutability, and state caching mechanisms."
                },
                {
                    q: `Walk me through a critical production bug you debugged. What was your root cause analysis?`,
                    tip: "Use metrics: reproduction step, log inspection, fix isolation, and rollback plan."
                },
                {
                    q: `How do you ensure secure, authenticated API communication with backward compatibility?`,
                    tip: "Mention JWT tokens, HTTPS, schema versioning (/v1, /v2), and rate limiting."
                }
            ],
            behavioralQuestions: [
                {
                    q: "Tell me about a time you disagreed with a senior engineer or product manager on an architectural approach.",
                    tip: "Focus on data-backed discussions, POC testing, and prioritizing business goals."
                },
                {
                    q: "How do you manage tight deadlines when requirements change mid-sprint?",
                    tip: "Emphasize transparent stakeholder communication and scope negotiation."
                }
            ],
            proTip: `For ${title} roles with ${experienceYears || 2}+ years, interviewers prioritize systemic problem solving over memorized syntax. Ground your answers in real business impact.`
        };
    });
}

/**
 * 9. AI Skill Gap & Career Growth Suggestions
 */
export function getSkillRoadmapAI(currentRole, skills) {
    const s = String(skills || "").toLowerCase();
    const suggestions = [];

    if (!s.includes("docker") && !s.includes("kubernetes")) {
        suggestions.push({
            skill: "Docker & Containerization",
            importance: "High Priority",
            reason: "85% of modern tech employers require basic containerization experience."
        });
    }
    if (!s.includes("aws") && !s.includes("cloud") && !s.includes("gcp") && !s.includes("azure")) {
        suggestions.push({
            skill: "Cloud Basics (AWS / GCP)",
            importance: "High Priority",
            reason: "Cloud deployment credentials increase candidate interview calls by 2.4×."
        });
    }
    if (!s.includes("ci/cd") && !s.includes("github actions")) {
        suggestions.push({
            skill: "CI/CD & Automated Testing",
            importance: "Medium Priority",
            reason: "Essential for moving from Junior to Mid/Senior software engineering levels."
        });
    }
    if (suggestions.length === 0) {
        suggestions.push({
            skill: "System Design & Microservices",
            importance: "High Priority",
            reason: "Top differentiator for high-paying product company interviews."
        });
    }
    return suggestions;
}
