import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { RecruiterProvider } from "./context/RecruiterContext";
import { JobSeekerProvider } from "./context/JobSeekerContext";
import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/common/ErrorBoundary";


function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <AuthProvider>
                    <RecruiterProvider>
                        <JobSeekerProvider>
                            <AppRoutes />
                        </JobSeekerProvider>
                    </RecruiterProvider>
                </AuthProvider>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;