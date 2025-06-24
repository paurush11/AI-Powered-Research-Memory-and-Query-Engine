import React from 'react';
import { HiExclamation } from 'react-icons/hi';

interface DeleteModalProps {
    onConfirm: () => void;
    onClose: () => void;
    isLoading: boolean;
    entityName?: string; // default 'Item'
}

const DeleteModal: React.FC<DeleteModalProps> = ({ onConfirm, onClose, isLoading, entityName = 'Item' }) => {
    return (
        <div className="p-1">
            <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <HiExclamation className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Delete {entityName}
                    </h3>
                    <div className="mt-2">
                        <p className="text-sm text-gray-500">
                            Are you sure you want to delete this {entityName.toLowerCase()}? This action cannot be undone.
                        </p>
                    </div>
                </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    onClick={onConfirm}
                    disabled={isLoading}
                >
                    {isLoading ? 'Deleting...' : 'Delete'}
                </button>
                <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={onClose}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default DeleteModal; 