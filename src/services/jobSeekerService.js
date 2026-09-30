import api from "./api";


// =====================================================
// JOB SEEKER PROFILE
// =====================================================


// Get current logged-in Job Seeker profile
// Backend: GET /jobseeker/getProfile
export const getJobSeekerProfile = async () => {

    const response = await api.get(
        "/jobseeker/getProfile"
    );

    return response.data;
};


// Create Job Seeker profile
// Backend: POST /jobseeker/createProfile
export const createJobSeekerProfile = async (
    profileData
) => {

    const response = await api.post(
        "/jobseeker/createProfile",
        profileData
    );

    return response.data;
};


// Update Job Seeker profile
// Backend: PUT /jobseeker/updateProfile
export const updateJobSeekerProfile = async (
    profileData
) => {

    const response = await api.put(
        "/jobseeker/updateProfile",
        profileData
    );

    return response.data;
};


// Delete Job Seeker profile
// Backend: DELETE /jobseeker/deleteProfile
export const deleteJobSeekerProfile = async () => {

    const response = await api.delete(
        "/jobseeker/deleteProfile"
    );

    return response.data;
};


// Upload Job Seeker Resume PDF
// Backend: POST /jobseeker/resume/upload
export const uploadJobSeekerResume = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(
        "/jobseeker/resume/upload",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};

export const uploadResume = uploadJobSeekerResume;



// =====================================================
// JOB SEEKER EDUCATION
// =====================================================


// Get all education records
// Backend: GET /jobseeker/education
export const getJobSeekerEducation = async () => {

    const response = await api.get(
        "/jobseeker/education"
    );

    return response.data;
};


// Add education
// Backend: POST /jobseeker/education
export const addJobSeekerEducation = async (
    educationData
) => {

    const response = await api.post(
        "/jobseeker/education",
        educationData
    );

    return response.data;
};


// Update education
// Backend: PUT /jobseeker/education/{educationId}
export const updateJobSeekerEducation = async (
    educationId,
    educationData
) => {

    const response = await api.put(
        `/jobseeker/education/${educationId}`,
        educationData
    );

    return response.data;
};


// Delete education
// Backend: DELETE /jobseeker/education/{educationId}
export const deleteJobSeekerEducation = async (
    educationId
) => {

    const response = await api.delete(
        `/jobseeker/education/${educationId}`
    );

    return response.data;
};


// =====================================================
// JOB SEEKER EMPLOYMENT / WORK EXPERIENCE
// =====================================================

// Get all employment records
// Backend: GET /jobseeker/portfolio/experiences
export const getJobSeekerExperiences = async () => {
    const response = await api.get("/jobseeker/portfolio/experiences");
    return response.data;
};

// Add employment record
// Backend: POST /jobseeker/portfolio/experiences
export const addJobSeekerExperience = async (experienceData) => {
    const response = await api.post("/jobseeker/portfolio/experiences", experienceData);
    return response.data;
};

// Update employment record
// Backend: PUT /jobseeker/portfolio/experiences/{experienceId}
export const updateJobSeekerExperience = async (experienceId, experienceData) => {
    const response = await api.put(`/jobseeker/portfolio/experiences/${experienceId}`, experienceData);
    return response.data;
};

// Delete employment record
// Backend: DELETE /jobseeker/portfolio/experiences/{experienceId}
export const deleteJobSeekerExperience = async (experienceId) => {
    const response = await api.delete(`/jobseeker/portfolio/experiences/${experienceId}`);
    return response.data;
};


// =====================================================
// JOB SEEKER PROJECTS
// =====================================================

// Get all project records
// Backend: GET /jobseeker/portfolio/projects
export const getJobSeekerProjects = async () => {
    const response = await api.get("/jobseeker/portfolio/projects");
    return response.data;
};

// Add project record
// Backend: POST /jobseeker/portfolio/projects
export const addJobSeekerProject = async (projectData) => {
    const response = await api.post("/jobseeker/portfolio/projects", projectData);
    return response.data;
};

// Update project record
// Backend: PUT /jobseeker/portfolio/projects/{projectId}
export const updateJobSeekerProject = async (projectId, projectData) => {
    const response = await api.put(`/jobseeker/portfolio/projects/${projectId}`, projectData);
    return response.data;
};

// Delete project record
// Backend: DELETE /jobseeker/portfolio/projects/{projectId}
export const deleteJobSeekerProject = async (projectId) => {
    const response = await api.delete(`/jobseeker/portfolio/projects/${projectId}`);
    return response.data;
};


// =====================================================
// STANDARDIZED TAXONOMY
// =====================================================

// Backend: GET /jobseeker/taxonomy
export const getJobSeekerTaxonomy = async () => {
    const response = await api.get("/jobseeker/taxonomy");
    return response.data;
};