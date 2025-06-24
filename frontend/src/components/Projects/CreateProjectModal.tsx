import React from 'react';
import CreateModal from '../Modals/CreateModal';
import { CreateProjectRequest } from '@/types/projects';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (project: CreateProjectRequest) => void;
    onBulkSubmit: (payload: {
        name: string;
        description?: string;
        user_id: string | null;
        number_of_projects: number;
        status?: 'draft' | 'published' | 'archived';
    }) => void;
    isLoading: boolean;
    userId: string | null;
    entityName?: string;
}

const CreateProjectModal: React.FC<Props> = (props) => {
    return <CreateModal {...props} entityName="Project" />;
};

export default CreateProjectModal;