import React, { useState, useRef, useEffect } from 'react';
import { Project } from '@/types/projects';
import ProjectTableRow from './ProjectTableRow';
import ProjectTablePagination from './ProjectTablePagination';
import ProjectTableSkeleton from './ProjectTableSkeleton';
import { HiCheck, HiTrash } from 'react-icons/hi';
import { useBulkUpdateProjects, useBulkDeleteProjects, useProjects } from '@/api/project/projects';

interface ProjectTableProps {
    projects: Project[];
    isLoading: boolean;
    onEdit: (project: Project) => void;
    onTogglePin: (projectId: string) => void;
    onToggleFavorite: (projectId: string) => void;
    onToggleShare: (projectId: string) => void;
    onUpdateProjectStatus: (projectId: string, status: string) => void;
    onDelete: (projectId: string) => void;
    onView: (project: Project) => void;
    itemsPerPage?: number;
    className?: string;
}

const ProjectTable: React.FC<ProjectTableProps> = ({
    projects,
    isLoading,
    onEdit,
    onTogglePin,
    onToggleFavorite,
    onToggleShare,
    onUpdateProjectStatus,
    onDelete,
    onView,
    itemsPerPage = 10,
    className = ''
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
    const totalPages = Math.ceil(projects.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProjects = projects.slice(startIndex, endIndex);
    const bulkDeleteMutation = useBulkDeleteProjects()
    const bulkUpdateMutation = useBulkUpdateProjects()
    const { refetch } = useProjects()
    const selectAllRef = useRef<HTMLInputElement>(null);
    const everyProjectIsPinned = projects.filter(project => selectedProjects.includes(project.id)).every(project => project.is_pinned);
    const everyProjectIsFavorite = projects.filter(project => selectedProjects.includes(project.id)).every(project => project.is_favorite);
    const batchAction = 'update-status';
    const archiveAction = projects.filter(project => selectedProjects.includes(project.id)).every(project => project.status === 'archived');
    const publishAction = projects.filter(project => selectedProjects.includes(project.id)).every(project => project.status === 'published');
    const draftAction = projects.filter(project => selectedProjects.includes(project.id)).every(project => project.status === 'draft');

    useEffect(() => {
        if (selectAllRef.current) {
            selectAllRef.current.indeterminate = selectedProjects.length > 0 && selectedProjects.length < projects.length;
        }
    }, [selectedProjects, projects.length]);

    if (isLoading) {
        return <ProjectTableSkeleton rows={itemsPerPage} className={className} />;
    }

    const handleSelect = (projectId: string) => {
        setSelectedProjects(prev => prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]);
    }

    return (
        <div className={`bg-white shadow rounded-lg overflow-hidden ${className}`}>
            {/* Bulk-action toolbar */}
            {selectedProjects.length > 0 && (
                <div className="flex items-center justify-between bg-gray-50 border-b px-4 py-2">
                    <span className="text-sm text-gray-700">
                        {selectedProjects.length} selected
                    </span>
                    <div className="space-x-2">

                        {(archiveAction || publishAction) && (
                            <button
                                onClick={() => {
                                    bulkUpdateMutation.mutate({ project_ids: selectedProjects, action: 'update-status', action_value: true, status: 'draft' }, {
                                        onSuccess: () => {
                                            setSelectedProjects([]);
                                            refetch();
                                        }
                                    });
                                }}
                                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded"
                            >
                                <HiCheck className="h-4 w-4 mr-1" /> Convert to draft
                            </button>
                        )}
                        {draftAction && (
                            <>
                                <button
                                    onClick={() => {
                                        bulkUpdateMutation.mutate({ project_ids: selectedProjects, action: 'update-status', action_value: true, status: 'published' }, {
                                            onSuccess: () => {
                                                setSelectedProjects([]);
                                                refetch();
                                            }
                                        });
                                    }}
                                    className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded"
                                >
                                    <HiCheck className="h-4 w-4 mr-1" /> Publish
                                </button>
                                <button
                                    onClick={() => {
                                        bulkUpdateMutation.mutate({ project_ids: selectedProjects, action: 'update-status', action_value: true, status: 'archived' }, {
                                            onSuccess: () => {
                                                setSelectedProjects([]);
                                                refetch();
                                            }
                                        });
                                    }}
                                    className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded"
                                >
                                    <HiCheck className="h-4 w-4 mr-1" /> Archive
                                </button>
                            </>

                        )}

                        <button
                            onClick={() => {
                                bulkUpdateMutation.mutate({ project_ids: selectedProjects, action: 'pinned', action_value: !everyProjectIsPinned }, {
                                    onSuccess: () => {
                                        setSelectedProjects([]);
                                        refetch();
                                    }
                                });
                            }}
                            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded"
                        >
                            <HiCheck className="h-4 w-4 mr-1" /> {everyProjectIsPinned ? 'Unpin' : 'Pin'} Selected
                        </button>
                        <button
                            onClick={() => {
                                bulkUpdateMutation.mutate({ project_ids: selectedProjects, action: 'favorite', action_value: !everyProjectIsFavorite }, {
                                    onSuccess: () => {
                                        setSelectedProjects([]);
                                        refetch();
                                    }
                                });
                            }}
                            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded"
                        >
                            <HiCheck className="h-4 w-4 mr-1" /> {everyProjectIsFavorite ? 'Unfavorite' : 'Favorite'} Selected
                        </button>
                        <button
                            onClick={() => {
                                bulkDeleteMutation.mutate({ project_ids: selectedProjects }, {
                                    onSuccess: () => {
                                        setSelectedProjects([]);
                                        refetch();
                                    }
                                });
                            }}
                            className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-1.5 rounded"
                        >
                            <HiTrash className="h-4 w-4 mr-1" /> Delete Selected
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                    type="checkbox"
                                    ref={selectAllRef}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    checked={selectedProjects.length === projects.length && projects.length > 0}
                                    onChange={() => {
                                        if (selectedProjects.length === projects.length) {
                                            setSelectedProjects([]);
                                        } else {
                                            setSelectedProjects(projects.map(p => p.id));
                                        }
                                    }}
                                />
                            </th>
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
                            <ProjectTableRow
                                key={project.id}
                                project={project}
                                isSelected={selectedProjects.includes(project.id)}
                                onEdit={onEdit}
                                onTogglePin={onTogglePin}
                                onToggleFavorite={onToggleFavorite}
                                onToggleShare={onToggleShare}
                                onUpdateProjectStatus={onUpdateProjectStatus}
                                onDelete={onDelete}
                                onView={onView}
                                onSelect={handleSelect}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <ProjectTablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={projects.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};

export default ProjectTable; 