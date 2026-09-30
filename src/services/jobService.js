import api from "./api";

/*
 * =====================================================
 * GET ALL OPEN JOBS
 * Backend:
 * GET /Jobs/getAllJobs
 * =====================================================
 */
export const getAllJobs = async () => {

    const response = await api.get(
        "/Jobs/getAllJobs"
    );

    return response.data;
};


/*
 * =====================================================
 * SEARCH JOBS ADVANCED
 * Backend:
 * GET /Jobs/search?keyword=...&location=...&jobType=...&workplaceType=...&minSalary=...&experience=...&postedWithinDays=...
 * =====================================================
 */
export const searchJobs = async (params = {}) => {
    const response = await api.get("/Jobs/search", { params });
    return response.data;
};


/*
 * =====================================================
 * SEARCH JOBS PAGED
 * Backend:
 * GET /Jobs/search/paged
 * =====================================================
 */
export const searchJobsPaged = async (params = {}) => {
    const response = await api.get("/Jobs/search/paged", { params });
    return response.data;
};


/*
 * =====================================================
 * GET MY JOBS
 * Backend:
 * GET /Jobs/getMyJobs
 * =====================================================
 */
export const getMyJobs = async () => {

    const response = await api.get(
        "/Jobs/getMyJobs"
    );

    return response.data;
};


/*
 * =====================================================
 * GET JOB BY ID
 * Backend:
 * GET /Jobs/getJob/{jobId}
 * =====================================================
 */
export const getJobById = async (jobId) => {

    const response = await api.get(
        `/Jobs/getJob/${jobId}`
    );

    return response.data;
};


/*
 * =====================================================
 * CREATE JOB
 * Backend:
 * POST /Jobs/createJob
 * =====================================================
 */
export const createJob = async (jobData) => {

    const response = await api.post(
        "/Jobs/createJob",
        jobData
    );

    return response.data;
};


/*
 * =====================================================
 * UPDATE JOB
 * Backend:
 * PUT /Jobs/updateJob/{jobId}
 * =====================================================
 */
export const updateJob = async (
    jobId,
    jobData
) => {

    const response = await api.put(
        `/Jobs/updateJob/${jobId}`,
        jobData
    );

    return response.data;
};


/*
 * =====================================================
 * DELETE JOB
 * Backend:
 * DELETE /Jobs/deleteJob/{jobId}
 * =====================================================
 */
export const deleteJob = async (jobId) => {

    const response = await api.delete(
        `/Jobs/deleteJob/${jobId}`
    );

    return response.data;
};


/*
 * =====================================================
 * CLOSE JOB
 * Backend:
 * PATCH /Jobs/closeJob/{jobId}
 * =====================================================
 */
export const closeJob = async (jobId) => {

    const response = await api.patch(
        `/Jobs/closeJob/${jobId}`
    );

    return response.data;
};