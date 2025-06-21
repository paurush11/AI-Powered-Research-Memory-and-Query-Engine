from upload.models import Project, File
from upload.serializers.project import ProjectSerializer

class ProjectService:
    def create_project(self, project_data):
        serializer = ProjectSerializer(data=project_data)
        if serializer.is_valid():
            serializer.save()
            return serializer.data
        return None
    
    def attach_file_to_project(self, project_id, file_id):
        project = Project.objects.get(id=project_id) #type: ignore
        file = File.objects.get(id=file_id) #type: ignore
        project.files.add(file)
        project.save()
        return project

    def remove_file_from_project(self, project_id, file_id):
        project = Project.objects.get(id=project_id) #type: ignore
        file = File.objects.get(id=file_id) #type: ignore
        project.files.remove(file)
        project.save()
        return project
    
    def get_all_projects(self, user_id):
        return Project.objects.filter(user_id=user_id) #type: ignore
