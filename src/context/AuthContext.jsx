import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import { getCurrentUser } from "../services/userService";

const AuthContext = createContext(null);


function AuthProvider({ children }) {

    // =====================================================
    // AUTH STATE
    // =====================================================

    const [accessToken, setAccessToken] = useState(
        localStorage.getItem("accessToken")
    );

    const [userRole, setUserRole] = useState(
        localStorage.getItem("userRole")
    );

    const [user, setUser] = useState(null);

    const [isAuthenticated, setIsAuthenticated] =
        useState(
            Boolean(
                localStorage.getItem("accessToken")
            )
        );

    const [userLoading, setUserLoading] =
        useState(true);


    // =====================================================
    // RESTORE CURRENT USER
    // =====================================================

    useEffect(() => {

        const restoreUser = async () => {

            const token =
                localStorage.getItem("accessToken");

            const storedRole =
                localStorage.getItem("userRole");


            // -------------------------------------------------
            // USER NOT LOGGED IN
            // -------------------------------------------------

            if (!token) {

                setAccessToken(null);
                setUserRole(null);
                setUser(null);
                setIsAuthenticated(false);
                setUserLoading(false);

                return;
            }


            // -------------------------------------------------
            // TOKEN EXISTS
            // -------------------------------------------------

            setAccessToken(token);
            setUserRole(storedRole);
            setIsAuthenticated(true);


            try {

                // Get logged-in user from backend
                const currentUser =
                    await getCurrentUser();


                if (currentUser) {

                    setUser(currentUser);


                    // -------------------------------------------------
                    // Synchronize Role
                    // -------------------------------------------------

                    if (currentUser.role) {

                        localStorage.setItem(
                            "userRole",
                            currentUser.role
                        );

                        setUserRole(
                            currentUser.role
                        );

                    }

                }

            } catch (error) {

                console.error(
                    "Failed to load current user:",
                    error
                );

                /*
                 * Do not remove the token here.
                 *
                 * ProtectedRoute / API interceptor
                 * can handle authentication problems.
                 */

                setUser(null);

            } finally {

                setUserLoading(false);

            }

        };


        restoreUser();

    }, []);


    // =====================================================
    // LOGIN
    // =====================================================

    const login = async (
        token,
        role
    ) => {

        // -------------------------------------------------
        // Save Access Token
        // -------------------------------------------------

        localStorage.setItem(
            "accessToken",
            token
        );


        // -------------------------------------------------
        // Save Role
        // -------------------------------------------------

        if (role) {

            localStorage.setItem(
                "userRole",
                role
            );

        }


        // -------------------------------------------------
        // Update React State
        // -------------------------------------------------

        setAccessToken(token);

        setUserRole(
            role || null
        );

        setIsAuthenticated(true);

        setUserLoading(true);


        // -------------------------------------------------
        // Get Current Logged-in User
        // -------------------------------------------------

        try {

            const currentUser =
                await getCurrentUser();


            if (currentUser) {

                // Store complete user object
                setUser(currentUser);


                // -------------------------------------------------
                // Synchronize Role From Backend
                // -------------------------------------------------

                if (currentUser.role) {

                    localStorage.setItem(
                        "userRole",
                        currentUser.role
                    );

                    setUserRole(
                        currentUser.role
                    );

                }

            }

        } catch (error) {

            console.error(
                "Failed to load logged-in user:",
                error
            );

            setUser(null);

        } finally {

            setUserLoading(false);

        }

    };


    // =====================================================
    // LOGOUT
    // =====================================================

    const logout = async () => {

        try {

            // Invalidate session on backend (deletes refreshToken cookie)
            const token = localStorage.getItem("accessToken");

            if (token) {

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

            // Remove authentication tokens and state

            localStorage.removeItem("accessToken");

            localStorage.removeItem("userRole");

            sessionStorage.clear();


            // Clear React state

            setAccessToken(null);

            setUserRole(null);

            setUser(null);

            setIsAuthenticated(false);

            setUserLoading(false);

        }

    };


    // =====================================================
    // AUTH CONTEXT
    // =====================================================

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


// =========================================================
// CUSTOM AUTH HOOK
// =========================================================

function useAuth() {

    const context =
        useContext(AuthContext);


    if (context === null) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );

    }


    return context;

}


// =========================================================
// EXPORTS
// =========================================================

export {
    AuthProvider,
    useAuth,
};

export default AuthContext;