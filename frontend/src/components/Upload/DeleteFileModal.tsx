import React from 'react';
import DeleteModal from '../Modals/DeleteModal';

interface Props {
    onConfirm: () => void;
    onClose: () => void;
    isLoading: boolean;
}

const DeleteFileModal: React.FC<Props> = (props) => {
    return <DeleteModal {...props} entityName="File" />;
};

export default DeleteFileModal;