import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layouts (keep static for instant shell rendering)
import PublicLayout from "../layouts/PublicLayout";
import JobSeekerLayout from "../layouts/JobSeekerLayout";
import RecruiterLayout from "../layouts/RecruiterLayout";

// Guards
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";

// Suspense Loader
import PageLoader from "../components/common/PageLoader";

// Error Pages
const AccessDenied = lazy(() => import("../pages/error/AccessDenied"));

// 1. Public Pages (Lazy loaded chunks)
const PublicHome = lazy(() => import("../pages/public/PublicHome"));
const PublicExploreJobs = lazy(() => import("../pages/public/PublicExploreJobs"));
const PublicJobDetails = lazy(() => import("../pages/public/PublicJobDetails"));
const PublicAbout = lazy(() => import("../pages/public/PublicAbout"));
const PublicContact = lazy(() => import("../pages/public/PublicContact"));

// Auth Pages (Lazy loaded chunks)
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const ChangePassword = lazy(() => import("../pages/auth/ChangePassword"));

// 2. Job Seeker Pages (Lazy loaded chunks)
const JobSeekerDashboard = lazy(() => import("../pages/jobseeker/JobSeekerDashboard"));
const JobSeekerFindJobs = lazy(() => import("../pages/jobseeker/JobSeekerFindJobs"));
const JobSeekerJobDetails = lazy(() => import("../pages/jobseeker/JobSeekerJobDetails"));
const JobSeekerApplications = lazy(() => import("../pages/jobseeker/JobSeekerApplications"));
const JobSeekerSavedJobs = lazy(() => import("../pages/jobseeker/JobSeekerSavedJobs"));
const JobSeekerProfile = lazy(() => import("../pages/jobseeker/JobSeekerProfile"));
const JobSeekerNotifications = lazy(() => import("../pages/jobseeker/JobSeekerNotifications"));
const JobSeekerSettings = lazy(() => import("../pages/jobseeker/JobSeekerSettings"));
const ApplicationDetails = lazy(() => import("../pages/applications/ApplicationDetails"));

// 3. Recruiter ATS Pages (Lazy loaded chunks)
const RecruiterDashboard = lazy(() => import("../pages/recruiter/RecruiterDashboard"));
const MyJobs = lazy(() => import("../pages/recruiter/MyJobs"));
const RecruiterJobDetails = lazy(() => import("../pages/recruiter/RecruiterJobDetails"));
const CreateJob = lazy(() => import("../pages/recruiter/CreateJob"));
const EditJob = lazy(() => import("../pages/recruiter/EditJob"));
const RecruiterApplications = lazy(() => import("../pages/recruiter/RecruiterApplications"));
const RecruiterCandidates = lazy(() => import("../pages/recruiter/RecruiterCandidates"));
const RecruiterCandidateProfile = lazy(() => import("../pages/recruiter/RecruiterCandidateProfile"));
const RecruiterProfile = lazy(() => import("../pages/recruiter/RecruiterProfile"));
const RecruiterNotifications = lazy(() => import("../pages/recruiter/RecruiterNotifications"));
const RecruiterSettings = lazy(() => import("../pages/recruiter/RecruiterSettings"));

const AppRoutes = () => {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* =================================================
                    1. PUBLIC / GUEST MODULE (Wrapped with PublicLayout)
                ================================================= */}
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<PublicHome />} />
                    <Route path="/about" element={<PublicAbout />} />
                    <Route path="/contact" element={<PublicContact />} />
                    <Route path="/jobs" element={<PublicExploreJobs />} />
                    <Route path="/jobs/search" element={<PublicExploreJobs />} />
                    <Route path="/jobs/:jobId" element={<PublicJobDetails />} />
                    <Route path="/jobs/details/:jobId" element={<PublicJobDetails />} />
                </Route>

                {/* =================================================
                    AUTH STANDALONE PAGES (Guest Only)
                ================================================= */}
                <Route element={<PublicOnlyRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ForgotPassword />} />
                </Route>
                <Route path="/change-password" element={<ChangePassword />} />

                {/* =================================================
                    SECURITY & ERROR ROUTES
                ================================================= */}
                <Route path="/access-denied" element={<AccessDenied />} />
                <Route path="/unauthorized" element={<AccessDenied />} />

                {/* =================================================
                    AUTHENTICATED WORKSPACES
                ================================================= */}
                <Route element={<ProtectedRoute />}>

                    {/* =================================================
                        2. JOB SEEKER WORKSPACE (Wrapped with JobSeekerLayout)
                    ================================================= */}
                    <Route element={<RoleRoute allowedRoles={["JOB_SEEKER"]} />}>
                        <Route element={<JobSeekerLayout />}>
                            <Route
                                path="/jobseeker"
                                element={<Navigate to="/jobseeker/dashboard" replace />}
                            />
                            <Route
                                path="/jobseeker/dashboard"
                                element={<JobSeekerDashboard />}
                            />
                            <Route
                                path="/jobseeker/jobs"
                                element={<JobSeekerFindJobs />}
                            />
                            <Route
                                path="/jobseeker/jobs/:jobId"
                                element={<JobSeekerJobDetails />}
                            />
                            <Route
                                path="/jobseeker/applications"
                                element={<JobSeekerApplications />}
                            />
                            <Route
                                path="/jobseeker/saved-jobs"
                                element={<JobSeekerSavedJobs />}
                            />
                            <Route
                                path="/jobseeker/profile"
                                element={<JobSeekerProfile />}
                            />
                            <Route
                                path="/jobseeker/notifications"
                                element={<JobSeekerNotifications />}
                            />
                            <Route
                                path="/jobseeker/settings"
                                element={<JobSeekerSettings />}
                            />
                            <Route
                                path="/applications/details/:applicationId"
                                element={<ApplicationDetails />}
                            />
                        </Route>
                    </Route>

                    {/* =================================================
                        3. RECRUITER ATS WORKSPACE (Wrapped with RecruiterLayout)
                    ================================================= */}
                    <Route element={<RoleRoute allowedRoles={["RECRUITER"]} />}>
                        <Route element={<RecruiterLayout />}>
                            <Route
                                path="/recruiter"
                                element={<Navigate to="/recruiter/dashboard" replace />}
                            />
                            <Route
                                path="/recruiter/home"
                                element={<Navigate to="/recruiter/dashboard" replace />}
                            />
                            <Route
                                path="/recruiter/dashboard"
                                element={<RecruiterDashboard />}
                            />
                            <Route
                                path="/recruiter/jobs"
                                element={<MyJobs />}
                            />
                            <Route
                                path="/recruiter/jobs/:jobId"
                                element={<RecruiterJobDetails />}
                            />
                            <Route
                                path="/recruiter/jobs/create"
                                element={<CreateJob />}
                            />
                            <Route
                                path="/recruiter/jobs/edit"
                                element={<EditJob />}
                            />
                            <Route
                                path="/recruiter/jobs/edit/:jobId"
                                element={<EditJob />}
                            />
                            <Route
                                path="/recruiter/applications"
                                element={<RecruiterApplications />}
                            />
                            <Route
                                path="/recruiter/candidates"
                                element={<RecruiterCandidates />}
                            />
                            <Route
                                path="/recruiter/candidates/:candidateId"
                                element={<RecruiterCandidateProfile />}
                            />
                            <Route
                                path="/recruiter/profile"
                                element={<RecruiterProfile />}
                            />
                            <Route
                                path="/recruiter/notifications"
                                element={<RecruiterNotifications />}
                            />
                            <Route
                                path="/recruiter/settings"
                                element={<RecruiterSettings />}
                            />
                        </Route>
                    </Route>

                </Route>

                {/* =================================================
                    404 NOT FOUND
                ================================================= */}
                <Route
                    path="*"
                    element={
                        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
                            <div className="text-center max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 space-y-4">
                                <h1 className="text-6xl font-black text-indigo-600">404</h1>
                                <h2 className="text-base font-bold text-slate-800">Page Not Found</h2>
                                <p className="text-xs text-slate-500">
                                    The link you followed may be broken or the page may have been relocated.
                                </p>
                                <a
                                    href="/"
                                    className="inline-block rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition"
                                >
                                    Back to Homepage
                                </a>
                            </div>
                        </div>
                    }
                />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;