from rest_framework import viewsets, filters
from rest_framework.permissions import DjangoModelPermissions
from .models import Odontograma
from .serializers import OdontogramaSerializer

class OdontogramaViewSet(viewsets.ModelViewSet):
    queryset = Odontograma.objects.all()
    serializer_class = OdontogramaSerializer
    permission_classes = [DjangoModelPermissions]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["paciente__nome", "anotacoes"]
    ordering_fields = ["criado_em", "atualizado_em"]
