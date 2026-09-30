import api from "./api";

/*
 * =========================
 * GET RECRUITER PROFILE
 * =========================
 */
export const getRecruiterProfile = async () => {
    const response = await api.get(
        "/recruiter/getRecruiterProfile"
    );

    return response.data;
};


/*
 * =========================
 * CREATE RECRUITER PROFILE
 * =========================
 */
export const createRecruiterProfile = async (profileData) => {
    const response = await api.post(
        "/recruiter/recuiterProfileCreate",
        profileData
    );

    return response.data;
};


/*
 * =========================
 * UPDATE RECRUITER PROFILE
 * =========================
 */
export const updateRecruiterProfile = async (profileData) => {
    const response = await api.put(
        "/recruiter/updateProfile",
        profileData
    );

    return response.data;
};


/*
 * =========================
 * DELETE RECRUITER PROFILE
 * =========================
 */
export const deleteRecruiterProfile = async () => {
    const response = await api.delete(
        "/recruiter/deleteProfile"
    );

    return response.data;
};

/*
 * =========================
 * GET RECRUITER ANALYTICS
 * =========================
 */
export const getRecruiterAnalytics = async () => {
    const response = await api.get("/analytics/recruiter");
    return response.data;
};

/*
 * ==========================================
 * NAUKRI RESDEX CANDIDATE SEARCH & SOURCING
 * ==========================================
 */
export const searchCandidates = async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.skill) queryParams.append("skill", params.skill);
    if (params.location) queryParams.append("location", params.location);
    if (params.minExp !== undefined && params.minExp !== "") queryParams.append("minExp", params.minExp);
    if (params.maxExp !== undefined && params.maxExp !== "") queryParams.append("maxExp", params.maxExp);
    if (params.company) queryParams.append("company", params.company);
    if (params.designation) queryParams.append("designation", params.designation);
    if (params.noticePeriod) queryParams.append("noticePeriod", params.noticePeriod);
    if (params.workMode) queryParams.append("workMode", params.workMode);
    if (params.maxExpectedSalary) queryParams.append("maxExpectedSalary", params.maxExpectedSalary);

    const queryStr = queryParams.toString();
    const url = queryStr ? `/recruiter/candidates/search?${queryStr}` : `/recruiter/candidates/search`;
    const response = await api.get(url);
    return response.data;
};

/*
 * ==========================================
 * GET CANDIDATE PROFILE DOSSIER BY ID
 * ==========================================
 */
export const getCandidateProfileById = async (profileId) => {
    const response = await api.get(`/recruiter/candidates/${profileId}`);
    return response.data;
};