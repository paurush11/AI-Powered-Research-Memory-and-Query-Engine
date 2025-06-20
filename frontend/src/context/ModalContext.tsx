import React, { createContext, useContext, useState, PropsWithChildren } from 'react';

interface ModalState {
    isOpen: boolean;
    open: () => void;
    close: () => void;
}

const ModalContext = createContext<ModalState | undefined>(undefined);

export const ModalProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);
    return (
        <ModalContext.Provider value={{ isOpen, open, close }}>
            {children}
        </ModalContext.Provider>
    );
};

export const useModal = (): ModalState => {
    const ctx = useContext(ModalContext);
    if (!ctx) throw new Error('useModal must be used within ModalProvider');
    return ctx;
}; 