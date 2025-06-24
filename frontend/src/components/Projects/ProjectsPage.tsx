import React, { useState } from 'react';
import { HiPlus, HiSearch, HiFolder } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/api/auth/auth';
import { useProjects, useCreateProject, useBulkCreateProjects, useUpdateProject, useDeleteProject, useTogglePinProject, useToggleFavoriteProject, useToggleShareProject, useUpdateProjectStatus } from '@/api/project/projects';
import { Project, CreateProjectRequest } from '@/types/projects';
import { useModalContext } from '@/context/ModalContext';
import {
    ProjectTable,
    CreateProjectModal,
    EditProjectModal,
    DeleteProjectModal
} from '@/components/Projects';
import Modal from '../Modal';
import PageLayout from '../PageLayout';
import { useNavigate } from 'react-router-dom';

const ProjectsPage: React.FC<{ selectedTab: 'files' | 'analysis' | 'settings' }> = ({ selectedTab }) => {
    const { currentUser } = useAuth();
    const { data: projects = [], isLoading, refetch } = useProjects(!!currentUser?.id);
    const { openModal, close } = useModalContext();
    const navigate = useNavigate();
    // Mutations
    const createProjectMutation = useCreateProject();
    const bulkCreateProjectsMutation = useBulkCreateProjects();
    const updateProjectMutation = useUpdateProject();
    const deleteProjectMutation = useDeleteProject();
    const togglePinMutation = useTogglePinProject();
    const toggleFavoriteMutation = useToggleFavoriteProject();
    const toggleShareMutation = useToggleShareProject();
    const updateProjectStatusMutation = useUpdateProjectStatus();

    // State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Filter projects based on search and status
    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Handlers
    const handleCreateProject = (projectData: CreateProjectRequest) => {
        createProjectMutation.mutate(projectData, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                refetch();
                toast.success('Project created successfully!');
            },
        });
    };

    const handleBulkCreateProjects = (payload: {
        name: string;
        description?: string;
        user_id: string | null;
        number_of_projects: number;
        status?: 'draft' | 'published' | 'archived';
    }) => {
        bulkCreateProjectsMutation.mutate(payload, {
            onSuccess: (createdProjects) => {
                setIsCreateModalOpen(false);
                refetch();
                toast.success(`Successfully created ${createdProjects.length} projects`);
            },
        });
    };

    const handleEditProject = (project: Project) => {
        openModal(
            'Edit Project',
            <EditProjectModal
                project={project}
                onSave={(projectData) => {
                    updateProjectMutation.mutate(projectData, {
                        onSuccess: () => {
                            refetch();
                            toast.success('Project updated successfully');
                            close();
                        },
                    });
                }}
                onClose={close}
                isLoading={updateProjectMutation.isPending}
            />
        );
    };

    const handleTogglePin = (projectId: string) => {
        togglePinMutation.mutate(projectId, {
            onSuccess: () => refetch(),
        });
    };

    const handleToggleFavorite = (projectId: string) => {
        toggleFavoriteMutation.mutate(projectId, {
            onSuccess: () => refetch(),
        });
    };

    const handleToggleShare = (projectId: string) => {
        toggleShareMutation.mutate(projectId, {
            onSuccess: () => refetch(),
        });
    };

    const handleUpdateProjectStatus = (projectId: string, status: string) => {
        updateProjectStatusMutation.mutate({ id: projectId, status: status }, {
            onSuccess: () => refetch(),
        });
    };

    const handleDelete = (projectId: string) => {
        const handleConfirmDelete = () => {
            deleteProjectMutation.mutate(projectId, {
                onSuccess: () => {
                    refetch();
                    toast.success('Project deleted successfully.');
                    close();
                },
                onError: () => {
                    toast.error('Failed to delete project.');
                    close();
                }
            });
        };

        openModal(
            'Delete Project',
            <DeleteProjectModal
                onConfirm={handleConfirmDelete}
                onClose={close}
                isLoading={deleteProjectMutation.isPending}
            />
        );
    };

    const handleView = (project: Project) => {
        if (selectedTab === 'files') {
            navigate(`/projects/${project.id}`);
        } else if (selectedTab === 'analysis') {
            navigate(`/projects/analysis/${project.id}`);
        } else if (selectedTab === 'settings') {
            navigate(`/projects/settings/${project.id}`);
        }
    };

    return (
        <PageLayout
            title={`All Projects (${filteredProjects.length})`}
            subtitle="Manage your research projects"
            icon={<HiFolder className="h-6 w-6 text-blue-600" />}
            headerContent={
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <HiPlus className="h-4 w-4 mr-2" />
                    New Project
                </button>
            }
        >
            <div className="flex flex-col gap-6">
                {/* Filters and Search */}
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <HiSearch className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="sm:w-48">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Projects Table */}
                {filteredProjects.length > 0 ? (
                    <ProjectTable
                        projects={filteredProjects}
                        isLoading={isLoading}
                        onEdit={handleEditProject}
                        onTogglePin={handleTogglePin}
                        onToggleFavorite={handleToggleFavorite}
                        onToggleShare={handleToggleShare}
                        onUpdateProjectStatus={handleUpdateProjectStatus}
                        onDelete={handleDelete}
                        onView={handleView}
                    />
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                        {isLoading ? (
                            <div className="animate-pulse">
                                <div className="mx-auto h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
                            </div>
                        ) : searchTerm || statusFilter !== 'all' ? (
                            <div>
                                <HiSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                                <p className="text-gray-500 mb-4">
                                    No projects match your current search criteria.
                                </p>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                    }}
                                    className="text-blue-600 hover:text-blue-500 font-medium"
                                >
                                    Clear filters
                                </button>
                            </div>
                        ) : (
                            <div>
                                <HiPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                                <p className="text-gray-500 mb-4">
                                    Get started by creating your first project.
                                </p>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <HiPlus className="h-4 w-4 mr-2" />
                                    Create your first project
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create Project Modal */}
            <CreateProjectModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateProject}
                onBulkSubmit={handleBulkCreateProjects}
                isLoading={createProjectMutation.isPending || bulkCreateProjectsMutation.isPending}
                userId={currentUser?.id || null}
            />

            {/* Global Modal */}
            <Modal />
        </PageLayout>
    );
};

export default ProjectsPage; 