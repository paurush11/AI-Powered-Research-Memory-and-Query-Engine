import React from 'react';

interface ProjectTableSkeletonProps {
    rows?: number;
    className?: string;
}

const ProjectTableSkeleton: React.FC<ProjectTableSkeletonProps> = ({ rows = 5, className = '' }) => {
    return (
        <div className={`bg-white shadow rounded-lg overflow-hidden ${className}`}>
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="animate-pulse flex space-x-4">
                    <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                    <div className="flex-1 space-y-6 py-1">
                        <div className="h-2 bg-gray-200 rounded"></div>
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="h-2 bg-gray-200 rounded col-span-2"></div>
                                <div className="h-2 bg-gray-200 rounded col-span-1"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Generate multiple skeleton rows */}
            {Array.from({ length: rows }, (_, index) => (
                <div key={index} className="px-6 py-4 border-b border-gray-200">
                    <div className="animate-pulse flex space-x-4">
                        <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                        <div className="flex-1 space-y-6 py-1">
                            <div className="h-2 bg-gray-200 rounded"></div>
                            <div className="space-y-3">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="h-2 bg-gray-200 rounded col-span-2"></div>
                                    <div className="h-2 bg-gray-200 rounded col-span-1"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProjectTableSkeleton; 