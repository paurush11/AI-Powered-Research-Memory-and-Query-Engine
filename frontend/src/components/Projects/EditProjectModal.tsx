import React from 'react';
import EditModal from '../Modals/EditModal';
import { Project, UpdateProjectRequest } from '@/types/projects';

interface Props {
    project: Project;
    onSave: (projectData: UpdateProjectRequest) => void;
    onClose: () => void;
    isLoading: boolean;
}

const EditProjectModal: React.FC<Props> = ({ project, onSave, onClose, isLoading }) => {
    return (
        <EditModal
            initialData={project}
            onSave={onSave as any}
            onClose={onClose}
            isLoading={isLoading}
            entityName="Project"
        />
    );
};

export default EditProjectModal;