import django_filters
from upload.models import Project

class ProjectFilterSet(django_filters.FilterSet):
    """FilterSet for Project model allowing filtering by name, status, date range, etc."""
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    updated_after = django_filters.DateTimeFilter(field_name='updated_at', lookup_expr='gte')
    updated_before = django_filters.DateTimeFilter(field_name='updated_at', lookup_expr='lte')

    name = django_filters.CharFilter(field_name='name', lookup_expr='icontains')
    status = django_filters.CharFilter(field_name='status', lookup_expr='exact')
    user = django_filters.NumberFilter(field_name='user__id', lookup_expr='exact')
    is_deleted = django_filters.BooleanFilter(field_name='is_deleted', lookup_expr='exact')
    is_archived = django_filters.BooleanFilter(field_name='is_archived', lookup_expr='exact')
    is_pinned = django_filters.BooleanFilter(field_name='is_pinned', lookup_expr='exact')
    is_favorite = django_filters.BooleanFilter(field_name='is_favorite', lookup_expr='exact')
    is_shared = django_filters.BooleanFilter(field_name='is_shared', lookup_expr='exact')

    class Meta:
        model = Project
        fields = [
            'name', 'status', 'user', 'is_deleted', 'is_archived', 
            'is_pinned', 'is_favorite', 'is_shared',
            'created_after', 'created_before', 'updated_after', 'updated_before'
        ] 