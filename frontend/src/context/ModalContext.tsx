import React, { createContext, useContext, useState, PropsWithChildren, ReactNode } from 'react';

interface ModalState {
    isOpen: boolean;
    title: string;
    content: ReactNode | null;
    open: () => void;
    close: () => void;
    openModal: (title: string, content: ReactNode) => void;
}

const ModalContext = createContext<ModalState | undefined>(undefined);

export const ModalProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState<ReactNode | null>(null);

    const open = () => setIsOpen(true);
    const close = () => {
        setIsOpen(false);
        setTitle('');
        setContent(null);
    };

    const openModal = (modalTitle: string, modalContent: ReactNode) => {
        setTitle(modalTitle);
        setContent(modalContent);
        setIsOpen(true);
    };

    return (
        <ModalContext.Provider value={{ isOpen, title, content, open, close, openModal }}>
            {children}
        </ModalContext.Provider>
    );
};

export const useModalContext = (): ModalState => {
    const ctx = useContext(ModalContext);
    if (!ctx) throw new Error('useModalContext must be used within ModalProvider');
    return ctx;
}; 