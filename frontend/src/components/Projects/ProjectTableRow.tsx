import React from 'react';
import { Project } from '@/types/projects';
import {
    HiPencil,
    HiStar,
    HiThumbUp,
    HiShare,
    HiArchive,
    HiTrash,
    HiEye,
    HiCheck,
    HiCheckCircle,
    HiDocumentText
} from 'react-icons/hi';
import ProjectStatusBadge from './ProjectStatusBadge';

interface ProjectTableRowProps {
    project: Project;
    isSelected: boolean;
    onEdit: (project: Project) => void;
    onTogglePin: (projectId: string) => void;
    onToggleFavorite: (projectId: string) => void;
    onToggleShare: (projectId: string) => void;
    onUpdateProjectStatus: (projectId: string, status: string) => void;
    onDelete: (projectId: string) => void;
    onView: (project: Project) => void;
    onSelect: (projectId: string) => void;
}

const ProjectTableRow: React.FC<ProjectTableRowProps> = ({
    project,
    isSelected,
    onEdit,
    onTogglePin,
    onToggleFavorite,
    onToggleShare,
    onUpdateProjectStatus,
    onDelete,
    onView,
    onSelect
}) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
                <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    checked={isSelected}
                    onChange={() => onSelect(project.id)}
                />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <HiEye className="h-5 w-5 text-blue-600 cursor-pointer" onClick={() => onView(project)} />
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
                <ProjectStatusBadge status={project.status} />
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
                    {project.status === 'archived' && (
                        <button
                            onClick={() => onUpdateProjectStatus(project.id, 'draft')}
                            className="text-gray-400 hover:text-gray-600 p-1"
                            title="Convert to draft"
                        >
                            <HiDocumentText className="h-4 w-4" />
                        </button>
                    )}
                    {project.status === 'published' && (
                        <button
                            onClick={() => onUpdateProjectStatus(project.id, 'draft')}
                            className="text-gray-400 hover:text-gray-600 p-1"
                            title="Convert to draft"
                        >
                            <HiDocumentText className="h-4 w-4" />
                        </button>
                    )}
                    {project.status === 'draft' && (
                        <button
                            onClick={() => onUpdateProjectStatus(project.id, 'published')}
                            className="text-gray-400 hover:text-gray-600 p-1"
                            title="Publish"
                        >
                            <HiCheckCircle className="h-4 w-4 text-green-500" />
                        </button>
                    )}
                    {project.status === 'draft' && (
                        <button
                            onClick={() => onUpdateProjectStatus(project.id, 'archived')}
                            className="text-gray-400 hover:text-gray-600 p-1"
                            title="Archive"
                        >
                            <HiArchive className="h-4 w-4 text-orange-500" />
                        </button>
                    )}

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
    );
};

export default ProjectTableRow; 