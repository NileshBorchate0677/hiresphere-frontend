import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getRecruiterProfile } from "../services/recruiterService";
import useAuth from "../hooks/useAuth";

const RecruiterContext = createContext(null);

export const RecruiterProvider = ({ children }) => {
    const { isAuthenticated, userRole } = useAuth();
    const [profile, setProfile] = useState(null);
    const [hasCompanyProfile, setHasCompanyProfile] = useState(null); // null = unknown/loading, false = no profile, true = exists
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [pendingActionMessage, setPendingActionMessage] = useState("");

    const checkProfile = useCallback(async () => {
        if (!isAuthenticated || userRole !== "RECRUITER") {
            setLoadingProfile(false);
            setHasCompanyProfile(null);
            setProfile(null);
            return null;
        }

        setLoadingProfile(true);
        try {
            const data = await getRecruiterProfile();
            if (data && (data.companyName || data.id)) {
                setProfile(data);
                setHasCompanyProfile(true);
                return data;
            } else {
                setProfile(null);
                setHasCompanyProfile(false);
                return null;
            }
        } catch (err) {
            // 404 or empty profile means no company profile created yet
            setProfile(null);
            setHasCompanyProfile(false);
            return null;
        } finally {
            setLoadingProfile(false);
        }
    }, [isAuthenticated, userRole]);

    useEffect(() => {
        checkProfile();
    }, [checkProfile]);

    /**
     * Call this before executing recruiter actions like posting a job, viewing applicants, etc.
     * Returns true if profile exists, false if blocked (and opens the creation popup).
     */
    const requireCompanyProfile = (customMessage = "Please complete your Company Profile before performing this action.") => {
        if (hasCompanyProfile === false) {
            setPendingActionMessage(customMessage);
            setShowProfileModal(true);
            return false;
        }
        return true;
    };

    const updateProfileLocally = (newProfile) => {
        setProfile(newProfile);
        setHasCompanyProfile(true);
        setShowProfileModal(false);
    };

    return (
        <RecruiterContext.Provider
            value={{
                profile,
                hasCompanyProfile,
                loadingProfile,
                checkProfile,
                showProfileModal,
                setShowProfileModal,
                pendingActionMessage,
                requireCompanyProfile,
                updateProfileLocally,
            }}
        >
            {children}
        </RecruiterContext.Provider>
    );
};

export const useRecruiter = () => {
    const context = useContext(RecruiterContext);
    if (!context) {
        throw new Error("useRecruiter must be used within a RecruiterProvider");
    }
    return context;
};

export default RecruiterContext;
