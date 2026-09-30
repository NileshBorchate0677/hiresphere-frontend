import api from "./api";

/**
 * Get logged-in user profile
 * GET /user/auth/me
 */
export const getCurrentUser = async () => {
    const response = await api.get("/user/auth/me");
    return response.data;
};

/**
 * Update user display name
 * PUT /user/auth/update-name
 */
export const updateUserName = async (name) => {
    const response = await api.put("/user/auth/update-name", { name });
    return response.data;
};

/**
 * Change password
 * PUT /user/auth/change-password
 */
export const changePassword = async (oldPassword, newPassword) => {
    const response = await api.put("/user/auth/change-password", {
        oldPassword,
        newPassword
    });
    return response.data;
};

export const updatePassword = async ({ currentPassword, newPassword }) => {
    return changePassword(currentPassword, newPassword);
};

/**
 * Get active sessions
 * GET /user/auth/sessions
 */
export const getMySessions = async () => {
    const response = await api.get("/user/auth/sessions");
    return response.data;
};

/**
 * Terminate a specific session
 * DELETE /user/auth/sessions/{sessionId}
 */
export const terminateSession = async (sessionId) => {
    const response = await api.delete(`/user/auth/sessions/${sessionId}`);
    return response.data;
};

/**
 * Delete account permanently
 * DELETE /user/auth/delete-account
 */
export const deleteAccount = async (password) => {
    const response = await api.delete("/user/auth/delete-account", {
        data: { password }
    });
    return response.data;
};