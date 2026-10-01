import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token && typeof token === "string" && token !== "[object Object]") {
            config.headers.Authorization = `Bearer ${token}`;
        }
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken && typeof refreshToken === "string" && refreshToken !== "[object Object]") {
            config.headers["X-Refresh-Token"] = refreshToken;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (originalRequest.url?.includes("/user/auth/refresh") || originalRequest.url?.includes("/user/auth/login")) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("userRole");
                localStorage.removeItem("refreshToken");
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const storedRefreshToken = localStorage.getItem("refreshToken");
                const response = await axios.post(
                    `${API_BASE_URL}/user/auth/refresh`,
                    {},
                    {
                        withCredentials: true,
                        headers: (storedRefreshToken && storedRefreshToken !== "[object Object]") ? { "X-Refresh-Token": storedRefreshToken } : {}
                    }
                );

                const newAccessToken = response.data?.accessToken;
                const newRefreshToken = response.data?.refreshToken;
                if (newAccessToken) {
                    localStorage.setItem("accessToken", newAccessToken);
                    if (newRefreshToken) {
                        localStorage.setItem("refreshToken", newRefreshToken);
                    }
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    processQueue(null, newAccessToken);
                    return api(originalRequest);
                } else {
                    processQueue(error, null);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.removeItem("accessToken");
                localStorage.removeItem("userRole");
                localStorage.removeItem("refreshToken");
                if (window.location.pathname !== "/login" && !window.location.pathname.startsWith("/login")) {
                    window.location.href = "/login";
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;