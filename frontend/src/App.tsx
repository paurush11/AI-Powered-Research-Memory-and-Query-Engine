import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Layout from './components/Layout';
import Modal from './components/Modal';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import { useAuth } from './api/auth/auth';
import ProjectsPage from './components/Projects/ProjectsPage';
import { ModalProvider } from './context/ModalContext';

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

// Dashboard component
const Dashboard = () => {
    const { currentUser } = useAuth();

    return (
        <Layout>
            <div className="p-4 space-y-4">
                <h1 className="text-2xl font-bold">Research Memory</h1>
                <div>
                    <p className="text-gray-700">
                        Welcome back, {currentUser?.first_name || currentUser?.username || currentUser?.email}!
                        Upload your documents and start asking questions.
                    </p>
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h2 className="text-lg font-semibold text-green-800">Getting Started</h2>
                        <ul className="mt-2 text-green-700 space-y-1">
                            <li>• Upload documents using the file manager</li>
                            <li>• Ask questions about your uploaded content</li>
                            <li>• View your research history and analysis</li>
                        </ul>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        onClick={() => toast.success('This is a success toast!')}
                    >
                        Show Toast
                    </button>
                </div>
            </div>
            <Modal />
        </Layout>
    );
};

function App() {
    return (
        <ModalProvider>
            <Router>
                <Routes>
                    {/* Protected Routes */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Auth Routes */}
                    <Route
                        path="/login"
                        element={
                            <AuthRoute>
                                <LoginForm />
                            </AuthRoute>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <AuthRoute>
                                <RegisterForm />
                            </AuthRoute>
                        }
                    />

                    {/* Projects Route */}
                    <Route
                        path="/projects"
                        element={
                            <ProtectedRoute>
                                <ProjectsPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Catch all route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </ModalProvider>
    );
}

export default App; 