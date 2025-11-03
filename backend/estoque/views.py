from rest_framework import viewsets, filters
from rest_framework.permissions import DjangoModelPermissions
from .models import Produto
from .serializers import ProdutoSerializer

class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer
    permission_classes = [DjangoModelPermissions]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["nome", "sku"]
    ordering_fields = ["nome", "quantidade", "preco", "atualizado_em"]
