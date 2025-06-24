import { HiUpload, HiSearch, HiDocument, HiTrash } from 'react-icons/hi';
import { UploadedFile } from '@/types/file_upload';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface MyFilesProps {
    projectId: string;
    handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    isUploading: boolean;
    files: UploadedFile[];
    handleFileDelete: (fileId: string) => void;
    selectedTab: 'files' | 'analysis' | 'settings';
}

const MyFiles = ({
    projectId,
    handleFileUpload,
    searchTerm,
    setSearchTerm,
    isUploading,
    files,
    handleFileDelete,
    selectedTab,
}: MyFilesProps) => {
    const navigate = useNavigate();
    const filteredFiles = useMemo(() => {
        return files.filter((file) => file.file_name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [files, searchTerm]);

    const handleFileClick = (fileId: string) => {
        if (selectedTab === 'files') {
            navigate(`/projects/${projectId}/files/${fileId}`);
        } else if (selectedTab === 'analysis') {
            navigate(`/analysis/${projectId}/files/${fileId}`);
        } else if (selectedTab === 'settings') {
            navigate(`/settings/${projectId}`);
        }
    }

    return (
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
                                    <button onClick={() => handleFileClick(file.id)}>
                                        <HiDocument className="h-5 w-5 text-gray-400" />
                                    </button>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{file.file_name}</p>
                                        <p className="text-xs text-gray-500">{file.file_size} • {file.file_type}</p>
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
};

export default MyFiles;