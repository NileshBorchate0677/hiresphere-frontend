import api from "./api";

// ================================
// LOGIN
// ================================

export const loginUser = async (loginData) => {
    const response = await api.post(
        "/user/auth/login",
        loginData
    );

    return response.data;
};


// ================================
// REGISTER
// ================================

export const registerUser = async (registerData) => {
    const payload = {
        name: registerData.name || registerData.fullName,
        fullName: registerData.fullName || registerData.name,
        email: registerData.email?.trim(),
        password: registerData.password,
        role: registerData.role,
    };
    const response = await api.post(
        "/user/auth/register",
        payload
    );

    return response.data;
};


// ================================
// REFRESH ACCESS TOKEN
// ================================

export const refreshAccessToken = async () => {
    const response = await api.post(
        "/user/auth/refresh"
    );

    return response.data;
};


// ================================
// CHANGE PASSWORD
// ================================

export const changePassword = async (passwordData) => {
    const response = await api.put(
        "/user/auth/change-password",
        passwordData
    );

    return response.data;
};


// ================================
// LOGOUT
// ================================

export const logoutUser = async () => {
    const response = await api.post(
        "/user/auth/logout"
    );

    return response.data;
};


// ================================
// LOGOUT ALL DEVICES
// ================================

export const logoutAllDevices = async () => {
    const response = await api.post(
        "/user/auth/logoutAll"
    );

    return response.data;
};


// ================================
// FORGOT PASSWORD
// ================================

export const forgotPassword = async (email) => {
    const response = await api.post(
        "/user/auth/forgot-password",
        { email }
    );

    return response.data;
};


// ================================
// RESET PASSWORD WITH TOKEN
// ================================

export const resetPassword = async (token, newPassword) => {
    const response = await api.post(
        "/user/auth/reset-password",
        { token, newPassword }
    );

    return response.data;
};