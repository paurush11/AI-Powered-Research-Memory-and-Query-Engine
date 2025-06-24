import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../store/useAuthStore';
import { useSidebarStore } from '../store/useSidebarStore';
import {
    HiMenu,
    HiX,
    HiHome,
    HiFolder,
    HiUser,
    HiLogout,
    HiCog,
    HiDocumentText,
    HiChat,
    HiUpload,
    HiChartBar
} from 'react-icons/hi';

const Sidebar: React.FC = () => {
    const { currentUser, isAuthenticated, logout, isLoggingOut } = useAuthContext();
    const navigate = useNavigate();
    const location = useLocation();
    const { isCollapsed, toggleSidebar, setCollapsed } = useSidebarStore();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        // Close sidebar on route change on mobile
        setIsMobileOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navigationItems = [
        { name: 'Dashboard', href: '/', icon: HiHome },
        { name: 'Projects', href: '/projects', icon: HiFolder },
        { name: 'Chat', href: '/chat', icon: HiChat },
        { name: 'Analysis', href: '/projects/analysis', icon: HiChartBar },
        { name: 'Settings', href: '/projects/settings', icon: HiCog },
    ];

    const isActiveRoute = (href: string) => {
        const path = location.pathname;

        // Root path – must match exactly
        if (href === '/') {
            return path === '/';
        }

        // Special-case projects so that "/projects" isn't highlighted on analysis/settings pages
        if (href === '/projects') {
            // "/projects" itself OR "/projects/:projectId" should be active
            // But NOT "/projects/analysis*" or "/projects/settings*"
            const segments = path.split('/').filter(Boolean); // remove leading slash
            if (segments[0] !== 'projects') return false;
            const second = segments[1];
            if (second === 'analysis' || second === 'settings') return false;
            return true;
        }

        // General case: exact match or nested path under the href
        return path === href || path.startsWith(`${href}/`);
    };

    if (!isAuthenticated) {
        return null;
    }

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <Link to="/" className={`flex items-center space-x-2 overflow-hidden`}>
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <HiDocumentText className="w-5 h-5 text-white" />
                    </div>
                    <span className={`text-xl font-bold text-gray-800 whitespace-nowrap ${(isCollapsed && !isMobileOpen) ? 'lg:hidden' : ''}`}>
                        Research MEM
                    </span>
                </Link>
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 hidden lg:block"
                >
                    <HiMenu className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
                >
                    <HiX className="w-5 h-5" />
                </button>
            </div>

            {/* User Info */}
            <div className={`p-4 border-b border-gray-200 ${isCollapsed ? 'lg:px-2' : ''}`}>
                <div className={`flex items-center ${isCollapsed ? 'lg:justify-center' : 'space-x-3'}`}>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <HiUser className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className={`flex-1 min-w-0 ${(isCollapsed && !isMobileOpen) ? 'lg:hidden' : ''}`}>
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {currentUser?.first_name || currentUser?.username || currentUser?.email}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {currentUser?.email}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-1">
                {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            title={isCollapsed ? item.name : undefined}
                            className={`flex items-center p-2 rounded-md text-sm font-medium transition-colors duration-200
                                ${isCollapsed ? 'justify-center' : 'space-x-3'}
                                ${isActiveRoute(item.href)
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }
                            `}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span className={(isCollapsed && !isMobileOpen) ? 'lg:hidden' : ''}>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    title={isCollapsed ? 'Logout' : undefined}
                    className={`w-full flex items-center p-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 transition-colors duration-200
                        ${isCollapsed ? 'justify-center' : 'space-x-3'}
                    `}
                >
                    <HiLogout className="w-5 h-5 flex-shrink-0" />
                    <span className={(isCollapsed && !isMobileOpen) ? 'lg:hidden' : ''}>
                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden transition-opacity ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMobileOpen(false)}
            />

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 bg-white shadow-lg z-50 transition-all duration-300 ease-in-out
                    lg:relative lg:transform-none
                    ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full'}
                    ${isCollapsed ? 'lg:w-18' : 'lg:w-64'}
                `}
            >
                {sidebarContent}
            </div>

            {/* Mobile menu button */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="fixed top-4 left-4 z-30 p-2 rounded-md bg-white shadow-lg border border-gray-200 lg:hidden"
            >
                <HiMenu className="w-5 h-5 text-gray-600" />
            </button>
        </>
    );
};

export default Sidebar;