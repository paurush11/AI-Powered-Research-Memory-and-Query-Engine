import React from 'react';
import DeleteModal from '../Modals/DeleteModal';

interface Props {
    onConfirm: () => void;
    onClose: () => void;
    isLoading: boolean;
}

const DeleteProjectModal: React.FC<Props> = (props) => {
    return <DeleteModal {...props} entityName="Project" />;
};

export default DeleteProjectModal;