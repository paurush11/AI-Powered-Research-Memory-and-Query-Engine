import { useProject } from '@/api/project/projects';
import React from 'react';
import { HiFolder } from 'react-icons/hi';
import { useParams } from 'react-router-dom';

import PageLayout from '../PageLayout';
import UploadFilesLayout from '../Upload/UploadFilesLayout';

const ProjectView: React.FC<{ selectedTab: 'files' | 'analysis' | 'settings' }> = ({ selectedTab }) => {
    const { projectId } = useParams();
    const { data: project } = useProject(projectId || '', Boolean(projectId));

    return (
        <PageLayout title={project?.name || ''} subtitle={project?.description || ''} icon={<HiFolder className="h-8 w-8 text-blue-500" />}>
            {<UploadFilesLayout projectId={projectId || ''} selectedTab={selectedTab} />}
        </PageLayout>
    );
};

export default ProjectView; 