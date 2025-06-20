import React, { PropsWithChildren } from 'react';
import Navbar from './Navbar';

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto w-full px-4 lg:px-8">
                {children}
            </main>
        </div>
    );
};

export default Layout; 