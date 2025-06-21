import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../store/useAuthStore';

const Navbar: React.FC = () => {
    const { currentUser, isAuthenticated, logout, isLoggingOut } = useAuthContext();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-white border-b shadow-sm">
            <div className="container mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
                <Link to="/" className="text-xl font-bold text-gray-800 hover:text-blue-600">
                    Research Memory
                </Link>

                <nav className="flex items-center space-x-4">
                    {isAuthenticated ? (
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">
                                Welcome, {currentUser?.first_name || currentUser?.username || currentUser?.email}
                            </span>
                            <Link to="/projects" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded text-sm">
                                Projects
                            </Link>
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
                            >
                                {isLoggingOut ? 'Logging out...' : 'Logout'}
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <Link
                                to="/login"
                                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded text-sm"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Navbar; 