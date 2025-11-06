from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from .models import Orcamento
from .serializers import OrcamentoSerializer

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas
    REPORTLAB_AVAILABLE = True
except Exception:  # pragma: no cover
    REPORTLAB_AVAILABLE = False

class OrcamentoViewSet(viewsets.ModelViewSet):
    queryset = Orcamento.objects.all()
    serializer_class = OrcamentoSerializer
    # Ambiente de desenvolvimento: liberar sem autenticação para evitar bloqueios na UI
    # Ajuste para [IsAuthenticatedOrReadOnly] ou [DjangoModelPermissions] em produção.
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["descricao", "paciente__nome", "status"]
    ordering_fields = ["criado_em", "valor_total", "status"]

    @action(detail=True, methods=["post"], url_path="aprovar")
    def aprovar(self, request, pk=None):
        orc = self.get_object()
        orc.status = orc.Status.APROVADO
        orc.save(update_fields=["status", "atualizado_em"])
        return Response(self.get_serializer(orc).data)

    @action(detail=True, methods=["post"], url_path="reprovar")
    def reprovar(self, request, pk=None):
        orc = self.get_object()
        orc.status = orc.Status.REPROVADO
        orc.save(update_fields=["status", "atualizado_em"])
        return Response(self.get_serializer(orc).data)

    @action(detail=True, methods=["get"], url_path="pdf")
    def pdf(self, request, pk=None):
        orc = self.get_object()
        if not REPORTLAB_AVAILABLE:
            return Response({"detail": "PDF indisponível (reportlab não instalado)."}, status=status.HTTP_501_NOT_IMPLEMENTED)

        # Gera um PDF simples com cabeçalho e itens
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="orcamento_{orc.id}.pdf"'
        p = canvas.Canvas(response, pagesize=A4)
        width, height = A4

        y = height - 50
        p.setFont("Helvetica-Bold", 16)
        p.drawString(40, y, f"Orçamento #{orc.id}")
        y -= 22
        p.setFont("Helvetica", 12)
        p.drawString(40, y, f"Paciente: {orc.paciente.nome}")
        y -= 18
        p.drawString(40, y, f"Status: {orc.get_status_display()}")
        y -= 18
        p.drawString(40, y, f"Criado em: {orc.criado_em:%d/%m/%Y %H:%M}")
        y -= 28

        p.setFont("Helvetica-Bold", 12)
        p.drawString(40, y, "Itens")
        y -= 18
        p.setFont("Helvetica", 11)
        if orc.itens.exists():
            for it in orc.itens.all():
                line = f"Dente {it.dente} — {it.procedimento}  (R$ {it.valor})"
                p.drawString(48, y, line)
                y -= 16
                if y < 80:
                    p.showPage(); y = height - 50
        else:
            p.drawString(48, y, "— Sem itens cadastrados —")
            y -= 16

        y -= 10
        p.setFont("Helvetica-Bold", 12)
        p.drawString(40, y, f"Total: R$ {orc.valor_total}")
        p.showPage()
        p.save()
        return response


def orcamento_pdf_raw(request, pk: int):
    """Endpoint Django puro para retornar o PDF diretamente (sem Browsable API).

    Útil para abrir com window.open ou link direto no navegador, evitando a
    página de navegação do DRF para actions.
    """
    orc = get_object_or_404(Orcamento, pk=pk)
    if not REPORTLAB_AVAILABLE:  # pragma: no cover
        return HttpResponse("PDF indisponível (reportlab não instalado).", status=501)

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="orcamento_{orc.id}.pdf"'

    # Gera o PDF simples (mesma lógica da action acima)
    try:  # pragma: no cover - proteção caso reportlab falhe em runtime
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
        width, height = A4
        p = canvas.Canvas(response, pagesize=A4)

        y = height - 50
        p.setFont("Helvetica-Bold", 16)
        p.drawString(40, y, f"Orçamento #{orc.id}")
        y -= 22
        p.setFont("Helvetica", 12)
        p.drawString(40, y, f"Paciente: {orc.paciente.nome}")
        y -= 18
        p.drawString(40, y, f"Status: {orc.get_status_display()}")
        y -= 18
        p.drawString(40, y, f"Criado em: {orc.criado_em:%d/%m/%Y %H:%M}")
        y -= 28

        p.setFont("Helvetica-Bold", 12)
        p.drawString(40, y, "Itens")
        y -= 18
        p.setFont("Helvetica", 11)
        if orc.itens.exists():
            for it in orc.itens.all():
                line = f"Dente {it.dente} — {it.procedimento}  (R$ {it.valor})"
                p.drawString(48, y, line)
                y -= 16
                if y < 80:
                    p.showPage(); y = height - 50
        else:
            p.drawString(48, y, "— Sem itens cadastrados —")
            y -= 16

        y -= 10
        p.setFont("Helvetica-Bold", 12)
        p.drawString(40, y, f"Total: R$ {orc.valor_total}")
        p.showPage()
        p.save()
    except Exception as e:  # pragma: no cover
        return HttpResponse(f"Falha ao gerar PDF: {e}", status=500)

    return response
