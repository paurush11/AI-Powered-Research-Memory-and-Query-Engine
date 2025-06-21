import React, { useState } from 'react';
import { Project } from '@/types/projects';
import {
    HiPencil,
    HiStar,
    HiThumbUp,
    HiShare,
    HiArchive,
    HiTrash,
    HiChevronLeft,
    HiChevronRight,
    HiEye
} from 'react-icons/hi';

interface ProjectTableProps {
    projects: Project[];
    isLoading: boolean;
    onEdit: (project: Project) => void;
    onTogglePin: (projectId: string) => void;
    onToggleFavorite: (projectId: string) => void;
    onToggleShare: (projectId: string) => void;
    onArchive: (projectId: string) => void;
    onDelete: (projectId: string) => void;
    onView: (project: Project) => void;
}

const ProjectTable: React.FC<ProjectTableProps> = ({
    projects,
    isLoading,
    onEdit,
    onTogglePin,
    onToggleFavorite,
    onToggleShare,
    onArchive,
    onDelete,
    onView
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
            published: { color: 'bg-green-100 text-green-800', label: 'Published' },
            archived: { color: 'bg-yellow-100 text-yellow-800', label: 'Archived' }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const totalPages = Math.ceil(projects.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProjects = projects.slice(startIndex, endIndex);

    if (isLoading) {
        return (
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="animate-pulse flex space-x-4">
                        <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                        <div className="flex-1 space-y-6 py-1">
                            <div className="h-2 bg-gray-200 rounded"></div>
                            <div className="space-y-3">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="h-2 bg-gray-200 rounded col-span-2"></div>
                                    <div className="h-2 bg-gray-200 rounded col-span-1"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Project
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Updated
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentProjects.map((project) => (
                            <tr key={project.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                <HiEye className="h-5 w-5 text-blue-600" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {project.name}
                                                {project.is_pinned && (
                                                    <HiThumbUp className="inline ml-2 h-4 w-4 text-blue-500" />
                                                )}
                                                {project.is_favorite && (
                                                    <HiStar className="inline ml-1 h-4 w-4 text-yellow-500" />
                                                )}
                                            </div>
                                            {project.description && (
                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                    {project.description}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(project.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(project.created_at)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(project.updated_at)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button
                                            onClick={() => onView(project)}
                                            className="text-blue-600 hover:text-blue-900 p-1"
                                            title="View"
                                        >
                                            <HiEye className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onEdit(project)}
                                            className="text-gray-600 hover:text-gray-900 p-1"
                                            title="Edit"
                                        >
                                            <HiPencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onTogglePin(project.id)}
                                            className={`p-1 ${project.is_pinned ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                            title={project.is_pinned ? 'Unpin' : 'Pin'}
                                        >
                                            <HiThumbUp className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onToggleFavorite(project.id)}
                                            className={`p-1 ${project.is_favorite ? 'text-yellow-600' : 'text-gray-400 hover:text-gray-600'}`}
                                            title={project.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                                        >
                                            <HiStar className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onToggleShare(project.id)}
                                            className={`p-1 ${project.is_shared ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
                                            title={project.is_shared ? 'Unshare' : 'Share'}
                                        >
                                            <HiShare className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onArchive(project.id)}
                                            className="text-gray-400 hover:text-gray-600 p-1"
                                            title="Archive"
                                        >
                                            <HiArchive className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(project.id)}
                                            className="text-red-400 hover:text-red-600 p-1"
                                            title="Delete"
                                        >
                                            <HiTrash className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                                <span className="font-medium">{Math.min(endIndex, projects.length)}</span> of{' '}
                                <span className="font-medium">{projects.length}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <HiChevronLeft className="h-5 w-5" />
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page
                                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <HiChevronRight className="h-5 w-5" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectTable; 