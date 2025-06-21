import React, { PropsWithChildren } from 'react';
import { HiChevronRight, HiFolder } from 'react-icons/hi';

interface ProjectsLayoutProps extends PropsWithChildren {
    title?: string;
    subtitle?: string;
}

const ProjectsLayout: React.FC<ProjectsLayoutProps> = ({
    children,
    title = "Projects",
    subtitle = "Manage your research projects"
}) => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        {/* Breadcrumbs */}
                        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                            <span>Dashboard</span>
                            <HiChevronRight className="h-4 w-4" />
                            <span className="text-gray-900 font-medium">Projects</span>
                        </nav>

                        {/* Page Header */}
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <HiFolder className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                                <p className="text-sm text-gray-600">{subtitle}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </div>
        </div>
    );
};

export default ProjectsLayout; 