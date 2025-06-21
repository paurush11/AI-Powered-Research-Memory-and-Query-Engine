import React from 'react';
import { createPortal } from 'react-dom';
import { useModalContext } from '../context/ModalContext';

const Modal: React.FC = () => {
    const { isOpen, title, content, close } = useModalContext();

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-md shadow-lg w-full max-w-lg mx-4">
                <header className="px-4 py-2 border-b flex justify-between items-center">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button className="text-gray-500 hover:text-gray-700" onClick={close}>
                        ✕
                    </button>
                </header>
                <div className="p-4">{content}</div>
            </div>
        </div>,
        document.body
    );
};

export default Modal; 