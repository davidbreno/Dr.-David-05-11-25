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
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.units import cm
    REPORTLAB_AVAILABLE = True
except Exception:  # pragma: no cover
    REPORTLAB_AVAILABLE = False


def _fmt_currency(v):
    try:
        return f"R$ {float(v):.2f}"
    except Exception:
        return f"R$ {v}"


def _build_orcamento_story(orc):
    styles = getSampleStyleSheet()
    story = []

    title_style = styles['Heading1']
    title_style.fontName = 'Helvetica-Bold'
    title_style.fontSize = 16
    title_style.spaceAfter = 6

    h2 = styles['Heading2']
    h2.fontName = 'Helvetica-Bold'
    h2.fontSize = 12
    h2.spaceBefore = 6
    h2.spaceAfter = 4

    normal = styles['Normal']
    normal.fontName = 'Helvetica'
    normal.fontSize = 10

    # Cabeçalho
    story.append(Paragraph(f"Clínica Odontológica", title_style))
    story.append(Paragraph(f"Orçamento #{orc.id}", h2))
    story.append(Paragraph(f"Paciente: {orc.paciente.nome}", normal))
    story.append(Paragraph(f"Status: {orc.get_status_display()}", normal))
    story.append(Paragraph(f"Criado em: {orc.criado_em:%d/%m/%Y %H:%M}", normal))
    story.append(Spacer(1, 8))

    # Tabela de itens
    data = [["Dente", "Procedimento", "Valor (R$)"]]
    if orc.itens.exists():
        for it in orc.itens.all():
            data.append([str(it.dente or ''), it.procedimento or '', f"{float(it.valor):.2f}"])
    else:
        data.append(["—", "Sem itens cadastrados", "—"])

    table = Table(data, colWidths=[3*cm, 10*cm, 3*cm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
        ('TEXTCOLOR', (0,0), (-1,0), colors.black),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 10),
        ('GRID', (0,0), (-1,-1), 0.25, colors.grey),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (-1,1), (-1,-1), 'RIGHT'),
        ('FONTSIZE', (0,1), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(table)

    story.append(Spacer(1, 6))
    story.append(Paragraph(f"Total: <b>{_fmt_currency(orc.valor_total)}</b>", h2))
    return story

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

        # Gera um PDF com layout melhorado (tabela e cabeçalho)
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="orcamento_{orc.id}.pdf"'

        doc = SimpleDocTemplate(response, pagesize=A4, leftMargin=2*cm, rightMargin=2*cm, topMargin=1.8*cm, bottomMargin=1.8*cm)
        story = _build_orcamento_story(orc)
        doc.build(story)
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

    # Gera o mesmo PDF melhorado do endpoint da action
    try:  # pragma: no cover - proteção caso reportlab falhe em runtime
        doc = SimpleDocTemplate(response, pagesize=A4, leftMargin=2*cm, rightMargin=2*cm, topMargin=1.8*cm, bottomMargin=1.8*cm)
        story = _build_orcamento_story(orc)
        doc.build(story)
    except Exception as e:  # pragma: no cover
        return HttpResponse(f"Falha ao gerar PDF: {e}", status=500)

    return response
