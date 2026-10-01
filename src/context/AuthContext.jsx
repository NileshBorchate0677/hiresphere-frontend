import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import { getCurrentUser } from "../services/userService";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
    const [accessToken, setAccessToken] = useState(() => {
        const token = localStorage.getItem("accessToken");
        return (token && token !== "[object Object]") ? token : null;
    });

    const [userRole, setUserRole] = useState(() => {
        return localStorage.getItem("userRole") || null;
    });

    const [user, setUser] = useState(null);

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const token = localStorage.getItem("accessToken");
        return Boolean(token && token !== "[object Object]");
    });

    const [userLoading, setUserLoading] = useState(true);

    useEffect(() => {
        const restoreUser = async () => {
            const token = localStorage.getItem("accessToken");
            const storedRole = localStorage.getItem("userRole");

            if (!token || token === "[object Object]") {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("userRole");
                localStorage.removeItem("refreshToken");
                setAccessToken(null);
                setUserRole(null);
                setUser(null);
                setIsAuthenticated(false);
                setUserLoading(false);
                return;
            }

            setAccessToken(token);
            setUserRole(storedRole);
            setIsAuthenticated(true);

            try {
                const currentUser = await getCurrentUser();
                if (currentUser) {
                    setUser(currentUser);
                    if (currentUser.role) {
                        localStorage.setItem("userRole", currentUser.role);
                        setUserRole(currentUser.role);
                    }
                } else if (storedRole) {
                    setUser({ role: storedRole });
                }
            } catch (error) {
                console.warn("Could not fetch /user/auth/me during restore:", error);
                if (storedRole) {
                    setUser({ role: storedRole });
                }
            } finally {
                setUserLoading(false);
            }
        };

        restoreUser();
    }, []);

    const login = async (tokenOrData, roleParam) => {
        let token = tokenOrData;
        let role = roleParam;
        let refreshToken = null;

        if (tokenOrData && typeof tokenOrData === "object") {
            token = tokenOrData.accessToken || tokenOrData.token;
            role = tokenOrData.role || tokenOrData.user?.role || roleParam;
            refreshToken = tokenOrData.refreshToken;
        }

        if (token && typeof token === "string" && token !== "[object Object]") {
            localStorage.setItem("accessToken", token);
            setAccessToken(token);
        }

        if (role) {
            localStorage.setItem("userRole", role);
            setUserRole(role);
        }

        if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken);
        }

        setIsAuthenticated(true);
        setUserLoading(false);

        try {
            const currentUser = await getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
                if (currentUser.role) {
                    localStorage.setItem("userRole", currentUser.role);
                    setUserRole(currentUser.role);
                }
            } else if (role) {
                setUser({ role: role });
            }
        } catch (error) {
            console.warn("Failed to load user profile on login:", error);
            if (role) {
                setUser({ role: role });
            }
        } finally {
            setUserLoading(false);
        }
    };

    const logout = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (token && token !== "[object Object]") {
                const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
                await fetch(`${apiBase}/user/auth/logout`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    credentials: "include"
                }).catch(() => {});
            }
        } catch (e) {
            // Ignore backend errors during logout cleanup
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("userRole");
            localStorage.removeItem("refreshToken");
            sessionStorage.clear();

            setAccessToken(null);
            setUserRole(null);
            setUser(null);
            setIsAuthenticated(false);
            setUserLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                accessToken,
                userRole,
                user,
                isAuthenticated,
                userLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

function useAuth() {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return context;
}

export {
    AuthProvider,
    useAuth,
};

export default AuthContext;