import api from "./api";

/*
 * =====================================================
 * APPLY FOR JOB
 * Backend:
 * POST /applications/apply/{jobId}
 * =====================================================
 */
export const applyForJob = async (
    jobId,
    applicationData = {}
) => {

    const response = await api.post(
        `/applications/apply/${jobId}`,
        applicationData
    );

    return response.data;
};


/*
 * =====================================================
 * GET MY APPLICATIONS
 * Backend:
 * GET /applications/myApplications
 * =====================================================
 */
export const getMyApplications = async () => {

    const response = await api.get(
        "/applications/myApplications"
    );

    return response.data;
};


/*
 * =====================================================
 * WITHDRAW APPLICATION
 * Backend:
 * DELETE /applications/withdraw/{applicationId}
 * =====================================================
 */
export const withdrawApplication = async (
    applicationId
) => {

    const response = await api.delete(
        `/applications/withdraw/${applicationId}`
    );

    return response.data;
};


/*
 * =====================================================
 * GET APPLICANTS FOR RECRUITER JOB
 * Backend:
 * GET /applications/job/{jobId}
 * =====================================================
 */
export const getApplicantsForJob = async (
    jobId
) => {

    const response = await api.get(
        `/applications/job/${jobId}`
    );

    return response.data;
};


/*
 * =====================================================
 * SHORTLIST APPLICATION
 * Backend:
 * PATCH /applications/{applicationId}/shortlist
 * =====================================================
 */
export const shortlistApplication = async (
    applicationId
) => {

    const response = await api.patch(
        `/applications/${applicationId}/shortlist`
    );

    return response.data;
};


/*
 * =====================================================
 * ACCEPT APPLICATION
 * Backend:
 * PATCH /applications/{applicationId}/accept
 * =====================================================
 */
export const acceptApplication = async (
    applicationId
) => {

    const response = await api.patch(
        `/applications/${applicationId}/accept`
    );

    return response.data;
};


/*
 * =====================================================
 * REJECT APPLICATION
 * Backend:
 * PATCH /applications/{applicationId}/reject
 * =====================================================
 */
export const rejectApplication = async (
    applicationId
) => {

    const response = await api.patch(
        `/applications/${applicationId}/reject`
    );

    return response.data;
};


/*
 * =====================================================
 * GET APPLICATION BY ID
 * Backend:
 * GET /applications/{applicationId}
 * =====================================================
 */
export const getApplicationById = async (
    applicationId
) => {

    const response = await api.get(
        `/applications/${applicationId}`
    );

    return response.data;
};

// Aliases
export const getApplicationsForJob = getApplicantsForJob;
export const shortlistCandidate = shortlistApplication;
export const acceptCandidate = acceptApplication;
export const rejectCandidate = rejectApplication;