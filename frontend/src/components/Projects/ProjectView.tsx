import React, { useState } from 'react';
import { HiArrowLeft, HiUpload, HiTrash, HiSearch, HiDocument, HiChartBar, HiCog } from 'react-icons/hi';
import { Project } from '@/types/projects';
import ProjectsLayout from './ProjectsLayout';

interface ProjectViewProps {
    project: Project;
    onBack: () => void;
}

type TabType = 'files' | 'analysis' | 'settings';

const ProjectView: React.FC<ProjectViewProps> = ({ project, onBack }) => {
    const [activeTab, setActiveTab] = useState<TabType>('files');
    const [searchTerm, setSearchTerm] = useState('');
    const [files, setFiles] = useState<any[]>([]); // This would come from API
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            setIsUploading(true);
            // TODO: Implement file upload logic
            setTimeout(() => {
                setIsUploading(false);
                // Add uploaded files to the list
            }, 2000);
        }
    };

    const handleFileDelete = (fileId: string) => {
        // TODO: Implement file deletion logic
        setFiles(files.filter(file => file.id !== fileId));
    };

    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderFilesTab = () => (
        <div className="space-y-4">
            {/* File Upload Section */}
            <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                    <HiUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                        <label htmlFor="file-upload" className="cursor-pointer">
                            <span className="text-blue-600 hover:text-blue-500 font-medium">
                                Click to upload files
                            </span>
                            <span className="text-gray-500"> or drag and drop</span>
                        </label>
                        <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            multiple
                            className="sr-only"
                            onChange={handleFileUpload}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        PDF, DOC, TXT, or any text-based files up to 10MB
                    </p>
                </div>
            </div>

            {/* File Search */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {/* Files List */}
            <div className="bg-white rounded-lg border">
                {isUploading && (
                    <div className="p-4 border-b">
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-sm text-gray-600">Uploading files...</span>
                        </div>
                    </div>
                )}

                {filteredFiles.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {filteredFiles.map((file) => (
                            <li key={file.id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <HiDocument className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                        <p className="text-xs text-gray-500">{file.size} • {file.type}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleFileDelete(file.id)}
                                    className="text-red-400 hover:text-red-600 p-1"
                                >
                                    <HiTrash className="h-4 w-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-8 text-center">
                        <HiDocument className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No files</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm ? 'No files match your search.' : 'Get started by uploading some files.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderAnalysisTab = () => (
        <div className="space-y-6">
            {/* Analysis Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <HiDocument className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Files</p>
                            <p className="text-2xl font-semibold text-gray-900">{files.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <HiChartBar className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Analysis Status</p>
                            <p className="text-2xl font-semibold text-gray-900">Ready</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <HiCog className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Last Updated</p>
                            <p className="text-2xl font-semibold text-gray-900">Today</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analysis Actions */}
            <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                        <h4 className="font-medium text-gray-900">Document Summarization</h4>
                        <p className="text-sm text-gray-500 mt-1">Generate summaries of your documents</p>
                    </button>
                    <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                        <h4 className="font-medium text-gray-900">Keyword Extraction</h4>
                        <p className="text-sm text-gray-500 mt-1">Extract key terms and concepts</p>
                    </button>
                    <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                        <h4 className="font-medium text-gray-900">Topic Modeling</h4>
                        <p className="text-sm text-gray-500 mt-1">Discover main topics in your documents</p>
                    </button>
                    <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                        <h4 className="font-medium text-gray-900">Sentiment Analysis</h4>
                        <p className="text-sm text-gray-500 mt-1">Analyze sentiment across documents</p>
                    </button>
                </div>
            </div>

            {/* Analysis Results */}
            <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Analysis</h3>
                <div className="text-center py-8">
                    <HiChartBar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No analysis yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Upload files and run analysis to see results here.
                    </p>
                </div>
            </div>
        </div>
    );

    const renderSettingsTab = () => (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Project Settings</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Project Name</label>
                        <input
                            type="text"
                            value={project.name}
                            readOnly
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            value={project.description || ''}
                            readOnly
                            rows={3}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <input
                            type="text"
                            value={project.status}
                            readOnly
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const tabs = [
        { id: 'files', name: 'Files', icon: HiDocument },
        { id: 'analysis', name: 'Analysis', icon: HiChartBar },
        { id: 'settings', name: 'Settings', icon: HiCog },
    ];

    return (
        <ProjectsLayout title={project.name} subtitle={project.description}>
            {/* Back Button */}
            <div className="mb-6">
                <button
                    onClick={onBack}
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                    <HiArrowLeft className="h-4 w-4 mr-2" />
                    Back to Projects
                </button>
            </div>

            {/* Project Header */}
            <div className="bg-white rounded-lg border p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                        {project.description && (
                            <p className="text-gray-600 mt-1">{project.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${project.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                project.status === 'published' ? 'bg-green-100 text-green-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                {project.status}
                            </span>
                            <span className="text-sm text-gray-500">
                                Created {new Date(project.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {project.is_pinned && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Pinned
                            </span>
                        )}
                        {project.is_favorite && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Favorite
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{tab.name}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-96">
                {activeTab === 'files' && renderFilesTab()}
                {activeTab === 'analysis' && renderAnalysisTab()}
                {activeTab === 'settings' && renderSettingsTab()}
            </div>
        </ProjectsLayout>
    );
};

export default ProjectView; 