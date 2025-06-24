import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Modal from './components/Modal';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import { useAuth } from './api/auth/auth';
import ProjectsPage from './components/Projects/ProjectsPage';
import { ModalProvider } from './context/ModalContext';
import ProjectView from './components/Projects/ProjectView';
import FileMetadata from './components/Upload/FileMetadata';
import Analysis from './components/Analysis/Analysis';
import ProjectSettings from './components/Settings/ProjectSettings';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-lg">Loading...</div>
                </div>
            </Layout>
        );
    }

    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Auth Route component (redirects authenticated users to dashboard)
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-lg">Loading...</div>
                </div>
            </Layout>
        );
    }

    return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
};

// Layout wrappers to avoid repetition
const ProtectedLayout = () => (
    <ProtectedRoute>
        <Layout>
            <Outlet />
        </Layout>
    </ProtectedRoute>
);

const AuthLayout = () => (
    <AuthRoute>
        <Layout>
            <Outlet />
        </Layout>
    </AuthRoute>
);


function App() {
    return (
        <ModalProvider>
            <Router>
                <Routes>
                    {/* Protected routes share ProtectedLayout */}
                    <Route element={<ProtectedLayout />}>
                        <Route index element={<ProjectsPage selectedTab="files" />} />
                        <Route path="projects" element={<ProjectsPage selectedTab="files" />} />
                        <Route path="projects/analysis" element={<ProjectsPage selectedTab="analysis" />} />
                        <Route path="projects/settings" element={<ProjectsPage selectedTab="settings" />} />
                        <Route path="projects/:projectId" element={<ProjectView selectedTab="files" />} />
                        <Route path="projects/:projectId/files/:fileId" element={<FileMetadata />} />
                        <Route path="projects/analysis/:projectId" element={<Analysis />} />
                        <Route path="projects/settings/:projectId" element={<ProjectSettings />} />
                    </Route>

                    {/* Auth routes share AuthLayout */}
                    <Route element={<AuthLayout />}>
                        <Route path="login" element={<LoginForm />} />
                        <Route path="register" element={<RegisterForm />} />
                    </Route>

                    {/* Catch all route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </ModalProvider>
    );
}

export default App; 