from rest_framework import viewsets, filters, status
from rest_framework.permissions import DjangoModelPermissions, AllowAny
from rest_framework.response import Response
from .models import Paciente, Anamnese
from .serializers import PacienteSerializer, AnamneseSerializer

class PacienteViewSet(viewsets.ModelViewSet):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer
    permission_classes = [DjangoModelPermissions]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["nome", "cpf", "email", "telefone"]
    ordering_fields = ["nome", "criado_em", "atualizado_em"]


class AnamneseViewSet(viewsets.ModelViewSet):
    queryset = Anamnese.objects.select_related("paciente").all()
    serializer_class = AnamneseSerializer
    permission_classes = [AllowAny]  # liberar no dev; ajuste em prod
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["paciente__nome"]
    ordering_fields = ["criado_em", "atualizado_em"]

    def get_queryset(self):
        qs = super().get_queryset()
        paciente_id = self.request.query_params.get("paciente")
        if paciente_id:
            qs = qs.filter(paciente_id=paciente_id)
        return qs

    def create(self, request, *args, **kwargs):
        """Upsert por paciente: se já existir anamnese para o paciente, atualiza em vez de duplicar.

        Evita erro de unicidade do OneToOne quando a tela não carregou o ID existente.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        paciente = serializer.validated_data.get("paciente")
        existing = self.get_queryset().filter(paciente=paciente).first()

        if existing:
            # Atualiza campos informados
            for field, value in serializer.validated_data.items():
                setattr(existing, field, value)
            existing.save()
            out = self.get_serializer(existing)
            return Response(out.data, status=status.HTTP_200_OK)

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
