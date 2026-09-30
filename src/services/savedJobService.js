import api from "./api";

/**
 * Save / Bookmark a job
 * POST /saved-jobs/{jobId}
 */
export const saveJob = async (jobId) => {
    const response = await api.post(`/saved-jobs/${jobId}`);
    return response.data;
};

/**
 * Remove a saved job
 * DELETE /saved-jobs/{jobId}
 */
export const removeSavedJob = async (jobId) => {
    const response = await api.delete(`/saved-jobs/${jobId}`);
    return response.data;
};

/**
 * Get all saved jobs for current user
 * GET /saved-jobs/my
 */
export const getMySavedJobs = async () => {
    const response = await api.get("/saved-jobs/my");
    return response.data;
};

/**
 * Check if a job is already saved
 * GET /saved-jobs/check/{jobId}
 */
export const isJobSaved = async (jobId) => {
    const response = await api.get(`/saved-jobs/check/${jobId}`);
    return response.data?.isSaved ?? false;
};
