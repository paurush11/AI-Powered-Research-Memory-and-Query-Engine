import { useState, useEffect } from 'react';
import { HiDownload, HiExternalLink, HiEye, HiEyeOff } from 'react-icons/hi';
import { UploadedFile } from '@/types/file_upload';
import { useDownloadFile } from '@/api/file_upload/file_upload';

interface FileViewerProps {
    file: UploadedFile;
    fileBlobUrl?: string | null; // Optional prop for shared blob URL
    onDownload?: () => void; // Optional callback for download
    onOpen?: () => void; // Optional callback for open
    isDownloading?: boolean; // Optional loading state
}

// Custom hook for file operations (only used if not provided via props)
const useFileOperations = (file: UploadedFile) => {
    const downloadFileMutation = useDownloadFile();

    const downloadFile = async () => {
        try {
            const blob = await downloadFileMutation.mutateAsync({ file_id: file.id });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.file_name;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to download file:', err);
        }
    };

    const openInNewTab = async () => {
        try {
            const blob = await downloadFileMutation.mutateAsync({ file_id: file.id });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch (err) {
            console.error('Failed to open file:', err);
        }
    };

    return { downloadFile, openInNewTab, isDownloading: downloadFileMutation.isPending };
};

// Custom hook for file content loading (only used if not provided via props)
const useFileContent = (file: UploadedFile, shouldLoad: boolean) => {
    const [fileBlobUrl, setFileBlobUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const downloadFileMutation = useDownloadFile();

    useEffect(() => {
        const loadFileContent = async () => {
            if (!file.id || !shouldLoad) return;

            setIsLoading(true);
            setError(null);

            try {
                const blob = await downloadFileMutation.mutateAsync({ file_id: file.id });
                const url = URL.createObjectURL(blob);
                setFileBlobUrl(url);
            } catch (err) {
                console.error('Failed to load file content:', err);
                setError('Failed to load file content');
            } finally {
                setIsLoading(false);
            }
        };

        loadFileContent();

        return () => {
            if (fileBlobUrl) {
                URL.revokeObjectURL(fileBlobUrl);
            }
        };
    }, [file.id, shouldLoad]);

    return { fileBlobUrl, isLoading, error };
};

// File type detection utility
const getFileType = (file: UploadedFile) => {
    const isImage = file.file_type.startsWith('image/') ||
        ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(file.file_extension.toLowerCase());

    const isPDF = file.file_type === 'application/pdf' || file.file_extension.toLowerCase() === 'pdf';

    const isText = file.file_type.startsWith('text/') ||
        ['txt', 'md', 'json', 'xml', 'csv', 'log'].includes(file.file_extension.toLowerCase());

    return { isImage, isPDF, isText };
};

// Action buttons component
const FileActions = ({
    onDownload,
    onOpen,
    onFullscreen,
    isFullscreen,
    isDownloading
}: {
    onDownload: () => void;
    onOpen: () => void;
    onFullscreen: () => void;
    isFullscreen: boolean;
    isDownloading: boolean;
}) => (
    <div className="flex space-x-2">
        <button
            onClick={onDownload}
            disabled={isDownloading}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
        >
            <HiDownload className="h-4 w-4" />
            <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
        </button>
        <button
            onClick={onOpen}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
        >
            <HiExternalLink className="h-4 w-4" />
            <span>Open</span>
        </button>
        <button
            onClick={onFullscreen}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
        >
            {isFullscreen ? <HiEyeOff className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
            <span>{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
        </button>
    </div>
);

// Loading component
const LoadingView = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading file content...</span>
        </div>
    </div>
);

// Error component
const ErrorView = ({ error, onDownload }: { error: string; onDownload: () => void }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <div className="flex justify-center space-x-2">
                <button
                    onClick={onDownload}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Download File
                </button>
            </div>
        </div>
    </div>
);

// Image viewer component
const ImageViewer = ({
    file,
    fileBlobUrl,
    onDownload,
    onOpen,
    isDownloading
}: {
    file: UploadedFile;
    fileBlobUrl: string;
    onDownload: () => void;
    onOpen: () => void;
    isDownloading: boolean;
}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    return (
        <div className="rounded-lg border border-gray-200 p-4 flex flex-col flex-1 h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Image Preview</h3>
                <FileActions
                    onDownload={onDownload}
                    onOpen={onOpen}
                    onFullscreen={() => setIsFullscreen(!isFullscreen)}
                    isFullscreen={isFullscreen}
                    isDownloading={isDownloading}
                />
            </div>

            <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center' : 'relative'}`}>
                {isFullscreen && (
                    <button
                        onClick={() => setIsFullscreen(false)}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
                    >
                        <HiEyeOff className="h-6 w-6" />
                    </button>
                )}
                <img
                    src={fileBlobUrl}
                    alt={file.file_name}
                    className={`${isFullscreen ? 'max-h-full max-w-full object-contain' : 'w-full h-auto max-h-96 object-contain rounded-lg'}`}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const errorDiv = target.nextElementSibling as HTMLElement;
                        if (errorDiv) {
                            errorDiv.classList.remove('hidden');
                        }
                    }}
                />
                {!isFullscreen && (
                    <div className="hidden mt-4 p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-gray-500">Unable to display image preview</p>
                        <button
                            onClick={onOpen}
                            className="mt-2 text-blue-600 hover:text-blue-700"
                        >
                            Open in new tab
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// PDF viewer component
const PDFViewer = ({
    file,
    fileBlobUrl,
    onDownload,
    onOpen,
    isDownloading
}: {
    file: UploadedFile;
    fileBlobUrl: string;
    onDownload: () => void;
    onOpen: () => void;
    isDownloading: boolean;
}) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col flex-1 h-full">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">PDF Viewer</h3>
            <FileActions
                onDownload={onDownload}
                onOpen={onOpen}
                onFullscreen={() => { }} // PDF doesn't need fullscreen
                isFullscreen={false}
                isDownloading={isDownloading}
            />
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col flex-1 h-full">
            <iframe
                src={`${fileBlobUrl}#toolbar=0`}
                className="w-full h-full"
                title={file.file_name}
                onError={() => {
                    const iframe = document.querySelector('iframe');
                    if (iframe) {
                        iframe.style.display = 'none';
                        const fallback = iframe.nextElementSibling as HTMLElement;
                        if (fallback) {
                            fallback.classList.remove('hidden');
                        }
                    }
                }}
            />
            <div className="hidden p-8 text-center bg-gray-50">
                <p className="text-gray-500 mb-4">Unable to display PDF preview</p>
                <button
                    onClick={onOpen}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Open PDF in new tab
                </button>
            </div>
        </div>
    </div>
);

// Text viewer component
const TextViewer = ({
    file,
    fileBlobUrl,
    onDownload,
    onOpen,
    isDownloading
}: {
    file: UploadedFile;
    fileBlobUrl: string;
    onDownload: () => void;
    onOpen: () => void;
    isDownloading: boolean;
}) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Text Preview</h3>
            <FileActions
                onDownload={onDownload}
                onOpen={onOpen}
                onFullscreen={() => { }} // Text doesn't need fullscreen
                isFullscreen={false}
                isDownloading={isDownloading}
            />
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <iframe
                src={fileBlobUrl}
                className="w-full h-96"
                title={file.file_name}
                onError={() => {
                    const iframe = document.querySelector('iframe');
                    if (iframe) {
                        iframe.style.display = 'none';
                        const fallback = iframe.nextElementSibling as HTMLElement;
                        if (fallback) {
                            fallback.classList.remove('hidden');
                        }
                    }
                }}
            />
            <div className="hidden p-8 text-center bg-gray-50">
                <p className="text-gray-500 mb-4">Unable to display text preview</p>
                <button
                    onClick={onOpen}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Open text file in new tab
                </button>
            </div>
        </div>
    </div>
);

// Default file viewer component
const DefaultViewer = ({
    file,
    onDownload,
    onOpen,
    isDownloading
}: {
    file: UploadedFile;
    onDownload: () => void;
    onOpen: () => void;
    isDownloading: boolean;
}) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">File Preview</h3>
            <FileActions
                onDownload={onDownload}
                onOpen={onOpen}
                onFullscreen={() => { }} // Default doesn't need fullscreen
                isFullscreen={false}
                isDownloading={isDownloading}
            />
        </div>

        <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
            </div>
            <p className="text-gray-500 mb-2">Preview not available for this file type</p>
            <p className="text-sm text-gray-400 mb-4">{file.file_type}</p>
            <div className="flex justify-center space-x-2">
                <button
                    onClick={onDownload}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Download File
                </button>
                <button
                    onClick={onOpen}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                    Open File
                </button>
            </div>
        </div>
    </div>
);

// Main FileViewer component
const FileViewer = ({
    file,
    fileBlobUrl: externalFileBlobUrl,
    onDownload: externalOnDownload,
    onOpen: externalOnOpen,
    isDownloading: externalIsDownloading
}: FileViewerProps) => {
    const { isImage, isPDF, isText } = getFileType(file);
    const shouldLoadContent = isImage || isPDF || isText;

    // Use external props if provided, otherwise use internal hooks
    const { fileBlobUrl, isLoading, error } = useFileContent(file, shouldLoadContent && !externalFileBlobUrl);
    const { downloadFile, openInNewTab, isDownloading } = useFileOperations(file);

    // Use external props if provided, otherwise use internal values
    const finalFileBlobUrl = externalFileBlobUrl || fileBlobUrl;
    const finalOnDownload = externalOnDownload || downloadFile;
    const finalOnOpen = externalOnOpen || openInNewTab;
    const finalIsDownloading = externalIsDownloading !== undefined ? externalIsDownloading : isDownloading;

    // Show loading state
    if (isLoading) {
        return <LoadingView />;
    }

    // Show error state
    if (error) {
        return <ErrorView error={error} onDownload={finalOnDownload} />;
    }

    // Render appropriate viewer based on file type
    if (isImage && finalFileBlobUrl) {
        return (
            <ImageViewer
                file={file}
                fileBlobUrl={finalFileBlobUrl}
                onDownload={finalOnDownload}
                onOpen={finalOnOpen}
                isDownloading={finalIsDownloading}
            />
        );
    }

    if (isPDF && finalFileBlobUrl) {
        return (
            <PDFViewer
                file={file}
                fileBlobUrl={finalFileBlobUrl}
                onDownload={finalOnDownload}
                onOpen={finalOnOpen}
                isDownloading={finalIsDownloading}
            />
        );
    }

    if (isText && finalFileBlobUrl) {
        return (
            <TextViewer
                file={file}
                fileBlobUrl={finalFileBlobUrl}
                onDownload={finalOnDownload}
                onOpen={finalOnOpen}
                isDownloading={finalIsDownloading}
            />
        );
    }

    // Default viewer for unsupported file types
    return (
        <DefaultViewer
            file={file}
            onDownload={finalOnDownload}
            onOpen={finalOnOpen}
            isDownloading={finalIsDownloading}
        />
    );
};

export default FileViewer; 