from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import DjangoModelPermissions
from rest_framework.response import Response

from .models import Debito, DebitoDocumento, Lancamento
from .serializers import (
    DebitoDocumentoSerializer,
    DebitoSerializer,
    LancamentoSerializer,
)

class LancamentoViewSet(viewsets.ModelViewSet):
    queryset = Lancamento.objects.all()
    serializer_class = LancamentoSerializer
    permission_classes = [DjangoModelPermissions]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["categoria", "descricao", "paciente__nome", "status", "tipo"]
    ordering_fields = ["data", "valor", "status", "criado_em"]


class DebitoViewSet(viewsets.ModelViewSet):
    queryset = Debito.objects.prefetch_related("itens", "documentos").all()
    serializer_class = DebitoSerializer
    permission_classes = [DjangoModelPermissions]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["paciente__nome", "dentista", "plano", "itens__procedimento"]
    ordering_fields = ["data_vencimento", "valor_total", "status", "criado_em"]

    def get_queryset(self):
        qs = super().get_queryset()
        paciente_id = self.request.query_params.get("paciente")
        if paciente_id:
            qs = qs.filter(paciente_id=paciente_id)
        status_value = self.request.query_params.get("status")
        if status_value:
            qs = qs.filter(status=status_value)
        return qs

    @action(detail=True, methods=["post"], url_path="documentos")
    def upload_documento(self, request, pk=None):
        debito = self.get_object()
        serializer = DebitoDocumentoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(debito=debito)
        debito.atualizar_total()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["delete"], url_path="documentos/(?P<doc_id>[^/.]+)")
    def delete_documento(self, request, pk=None, doc_id=None):
        debito = self.get_object()
        try:
            documento = debito.documentos.get(pk=doc_id)
        except DebitoDocumento.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        documento.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
