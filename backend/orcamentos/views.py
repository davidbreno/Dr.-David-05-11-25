from rest_framework import viewsets, filters
from rest_framework.permissions import DjangoModelPermissions
from .models import Orcamento
from .serializers import OrcamentoSerializer

class OrcamentoViewSet(viewsets.ModelViewSet):
    queryset = Orcamento.objects.all()
    serializer_class = OrcamentoSerializer
    permission_classes = [DjangoModelPermissions]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["descricao", "paciente__nome", "status"]
    ordering_fields = ["criado_em", "valor_total", "status"]
