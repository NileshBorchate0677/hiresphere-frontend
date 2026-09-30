import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { getJobSeekerProfile } from "../services/jobSeekerService";
import useAuth from "../hooks/useAuth";

const JobSeekerContext = createContext(null);

export const JobSeekerProvider = ({ children }) => {
    const { isAuthenticated, userRole } = useAuth();
    const [profile, setProfile] = useState(null);
    const [hasProfile, setHasProfile] = useState(null); // null = loading, true/false = known
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [pendingActionMessage, setPendingActionMessage] = useState("");

    // Track if we've already auto-shown the modal this session (don't spam every re-render)
    const autoShownRef = useRef(false);

    const checkProfile = useCallback(async () => {
        if (!isAuthenticated || userRole !== "JOB_SEEKER") {
            setLoadingProfile(false);
            setHasProfile(null);
            setProfile(null);
            autoShownRef.current = false;
            return null;
        }
        setLoadingProfile(true);
        try {
            const data = await getJobSeekerProfile();
            if (data && (data.fullName || data.id)) {
                setProfile(data);
                setHasProfile(true);
                autoShownRef.current = true; // profile exists, no need to show modal
                return data;
            } else {
                setProfile(null);
                setHasProfile(false);
                return null;
            }
        } catch (err) {
            setProfile(null);
            setHasProfile(false);
            return null;
        } finally {
            setLoadingProfile(false);
        }
    }, [isAuthenticated, userRole]);

    useEffect(() => {
        checkProfile();
    }, [checkProfile]);

    /**
     * Auto-show the profile completion modal once right after login
     * if the job seeker hasn't created a profile yet.
     */
    useEffect(() => {
        // Only trigger after we know the profile status (not loading)
        // and only once per session
        if (
            !loadingProfile &&
            hasProfile === false &&
            isAuthenticated &&
            userRole === "JOB_SEEKER" &&
            !autoShownRef.current
        ) {
            autoShownRef.current = true;
            // Small delay so the page renders first
            const timer = setTimeout(() => {
                setPendingActionMessage(
                    "Welcome to HireSphere! Please complete your candidate profile to start applying for jobs."
                );
                setShowProfileModal(true);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [loadingProfile, hasProfile, isAuthenticated, userRole]);

    /**
     * Call before any action requiring a profile (e.g. apply for job).
     * Returns true if profile exists; otherwise opens modal and returns false.
     */
    const requireProfile = (customMessage = "Please complete your profile before performing this action.") => {
        if (hasProfile === false) {
            setPendingActionMessage(customMessage);
            setShowProfileModal(true);
            return false;
        }
        return true;
    };

    const updateProfileLocally = (newProfile) => {
        setProfile(newProfile);
        setHasProfile(true);
        setShowProfileModal(false);
    };

    return (
        <JobSeekerContext.Provider
            value={{
                profile,
                hasProfile,
                loadingProfile,
                checkProfile,
                showProfileModal,
                setShowProfileModal,
                pendingActionMessage,
                requireProfile,
                updateProfileLocally,
            }}
        >
            {children}
        </JobSeekerContext.Provider>
    );
};

export const useJobSeeker = () => {
    const context = useContext(JobSeekerContext);
    if (!context) {
        throw new Error("useJobSeeker must be used within a JobSeekerProvider");
    }
    return context;
};

export default JobSeekerContext;
