import React, { useState } from 'react'
import { attachFileRequest, deleteFileRequest, useUploadFile } from '@/api/file_upload/file_upload';
import { UploadedFile } from '@/types/file_upload';
import MyFiles from './MyFiles';
import { useFetchProjectFiles } from '@/api/project/projects';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageLayout from '../PageLayout';
import { HiDocument } from 'react-icons/hi';

interface UploadFilesLayoutProps {
    projectId?: string;
    selectedTab: 'files' | 'analysis' | 'settings';
}

const UploadFilesLayout: React.FC<UploadFilesLayoutProps> = ({ projectId: propProjectId, selectedTab }) => {
    const { projectId: paramProjectId } = useParams();
    const projectId = propProjectId || paramProjectId || '';
    const [isUploading, setIsUploading] = useState(false);
    const [optimisticFiles, setOptimisticFiles] = useState<UploadedFile[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { mutate: uploadFile } = useUploadFile();
    const {
        data: fetchedFiles = [],
        isLoading: isFetchingFiles,
        error: fetchError,
    } = useFetchProjectFiles(projectId, Boolean(projectId));

    const displayedFiles = [...fetchedFiles, ...optimisticFiles];

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;
        if (selectedFiles) {
            setIsUploading(true);
            for (const file of selectedFiles) {
                const payload = {
                    file,
                };
                uploadFile(payload, {
                    onSuccess: (uploadedFile) => {
                        if (projectId) {
                            attachFileRequest(projectId, uploadedFile.id).then(() => {
                                setOptimisticFiles(prev => [...prev, uploadedFile]);
                            });
                        }
                    },
                    onSettled: () => {
                        setIsUploading(false);
                    }
                });
            }
        }
    };

    const queryClient = useQueryClient();

    const handleFileDelete = (fileId: string) => {
        setOptimisticFiles(prev => prev.filter(file => file.id !== fileId));
        deleteFileRequest(fileId).then(() => {
            queryClient.setQueryData(['projects', 'files', projectId], (old: UploadedFile[] | undefined) =>
                (old ?? []).filter(f => f.id !== fileId)
            );
        });
    };


    return (

        <div>
            {isFetchingFiles && (
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}
            {fetchError && (
                <div className="flex items-center justify-center h-full">
                    <div className="text-red-500">Error fetching files</div>
                </div>
            )}

            <MyFiles
                handleFileUpload={handleFileUpload}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                isUploading={isUploading}
                files={displayedFiles}
                handleFileDelete={handleFileDelete}
                projectId={projectId}
                selectedTab={selectedTab || 'files'}
            />
        </div>

    )
}

export default UploadFilesLayout