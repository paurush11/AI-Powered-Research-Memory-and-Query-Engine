import React, { PropsWithChildren, ReactNode } from 'react';

interface PageLayoutProps extends PropsWithChildren {
    title: ReactNode;
    subtitle?: ReactNode;
    icon?: ReactNode;
    headerContent?: ReactNode;
    actions?: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({
    children,
    title,
    subtitle,
    icon,
    headerContent,
    actions
}) => {
    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <header className="bg-white shadow-sm border-b sticky top-0 ">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {icon && (
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        {icon}
                                    </div>
                                </div>
                            )}
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                                {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                            </div>
                        </div>
                        {headerContent && (
                            <div>
                                {headerContent}
                            </div>
                        )}
                        {actions && (
                            <div>
                                {actions}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </div>
        </div>
    );
};

export default PageLayout; 