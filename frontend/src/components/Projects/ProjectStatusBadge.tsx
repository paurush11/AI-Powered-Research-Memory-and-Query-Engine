import React from 'react';

interface ProjectStatusBadgeProps {
    status: string;
    className?: string;
}

const ProjectStatusBadge: React.FC<ProjectStatusBadgeProps> = ({ status, className = '' }) => {
    const statusConfig = {
        draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
        published: { color: 'bg-green-100 text-green-800', label: 'Published' },
        archived: { color: 'bg-yellow-100 text-yellow-800', label: 'Archived' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} ${className}`}>
            {config.label}
        </span>
    );
};

export default ProjectStatusBadge; 