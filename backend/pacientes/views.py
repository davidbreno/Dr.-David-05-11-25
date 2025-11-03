from rest_framework import viewsets, filters
from rest_framework.permissions import DjangoModelPermissions
from .models import Paciente
from .serializers import PacienteSerializer

class PacienteViewSet(viewsets.ModelViewSet):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer
    permission_classes = [DjangoModelPermissions]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["nome", "cpf", "email", "telefone"]
    ordering_fields = ["nome", "criado_em", "atualizado_em"]
