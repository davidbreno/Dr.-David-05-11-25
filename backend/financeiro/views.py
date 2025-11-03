from rest_framework import viewsets, filters
from rest_framework.permissions import DjangoModelPermissions
from .models import Lancamento
from .serializers import LancamentoSerializer

class LancamentoViewSet(viewsets.ModelViewSet):
    queryset = Lancamento.objects.all()
    serializer_class = LancamentoSerializer
    permission_classes = [DjangoModelPermissions]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["categoria", "descricao", "paciente__nome", "status", "tipo"]
    ordering_fields = ["data", "valor", "status", "criado_em"]
