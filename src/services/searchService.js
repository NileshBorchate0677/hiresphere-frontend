import api from "./api";

/*
 * =========================
 * SEARCH JOBS
 * =========================
 */
export const searchJobs = async (searchParams = {}) => {
    const response = await api.get(
        "/jobs/search",
        {
            params: searchParams,
        }
    );

    return response.data;
};


/*
 * =========================
 * SEARCH BY KEYWORD
 * =========================
 */
export const searchJobsByKeyword = async (keyword) => {
    const response = await api.get(
        "/jobs/search",
        {
            params: {
                keyword: keyword,
            },
        }
    );

    return response.data;
};


/*
 * =========================
 * SEARCH BY LOCATION
 * =========================
 */
export const searchJobsByLocation = async (location) => {
    const response = await api.get(
        "/jobs/search",
        {
            params: {
                location: location,
            },
        }
    );

    return response.data;
};


/*
 * =========================
 * FILTER JOBS
 * =========================
 */
export const filterJobs = async (filters = {}) => {
    const response = await api.get(
        "/jobs/search",
        {
            params: filters,
        }
    );

    return response.data;
};