import React, { PropsWithChildren } from 'react';
import Sidebar from './Sidebar';

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
    return (
        <div className="h-screen flex bg-gray-50 overflow-hidden">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

export default Layout; 