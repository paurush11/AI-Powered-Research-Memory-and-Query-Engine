import React, { useState, useEffect } from 'react';
import { HiX, HiCheck } from 'react-icons/hi';

interface EditModalProps<T = any> {
    initialData: T & { name?: string; description?: string; is_pinned?: boolean; is_favorite?: boolean };
    onSave: (updated: T) => void;
    onClose: () => void;
    isLoading: boolean;
    entityName?: string;
}

const EditModal = <T extends { name?: string; description?: string; is_pinned?: boolean; is_favorite?: boolean }>({
    initialData,
    onSave,
    onClose,
    isLoading,
    entityName = 'Item',
}: EditModalProps<T>) => {
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        description: initialData.description || '',
        is_pinned: initialData.is_pinned ?? false,
        is_favorite: initialData.is_favorite ?? false,
    });

    useEffect(() => {
        setFormData({
            name: initialData.name || '',
            description: initialData.description || '',
            is_pinned: initialData.is_pinned ?? false,
            is_favorite: initialData.is_favorite ?? false,
        });
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        onSave({
            ...initialData,
            name: formData.name.trim(),
            description: formData.description.trim() || undefined,
            is_pinned: formData.is_pinned,
            is_favorite: formData.is_favorite,
        } as T);
    };

    const handleClose = () => {
        // Reset form to original values
        setFormData({
            name: initialData.name || '',
            description: initialData.description || '',
            is_pinned: initialData.is_pinned ?? false,
            is_favorite: initialData.is_favorite ?? false,
        });
        onClose();
    };

    return (
        <div className="space-y-4">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                        {entityName} Name *
                    </label>
                    <input
                        type="text"
                        id="edit-name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Enter ${entityName.toLowerCase()} name`}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        id="edit-description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Enter ${entityName.toLowerCase()} description (optional)`}
                    />
                </div>

                <div className="space-y-2">
                    {('is_pinned' in initialData) && (
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="edit-pinned"
                                checked={formData.is_pinned}
                                onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="edit-pinned" className="ml-2 block text-sm text-gray-900">
                                Pin this {entityName.toLowerCase()}
                            </label>
                        </div>
                    )}
                    {('is_favorite' in initialData) && (
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="edit-favorite"
                                checked={formData.is_favorite}
                                onChange={(e) => setFormData({ ...formData, is_favorite: e.target.checked })}
                                className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                            />
                            <label htmlFor="edit-favorite" className="ml-2 block text-sm text-gray-900">
                                Mark as favorite
                            </label>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || !formData.name.trim()}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <HiCheck className="h-4 w-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditModal; 