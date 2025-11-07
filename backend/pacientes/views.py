import csv
import io, os
import re
from datetime import datetime
from django.core.files.base import ContentFile
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from django.conf import settings
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import DjangoModelPermissions, AllowAny
from rest_framework.response import Response
from .models import (
    Paciente,
    Anamnese,
    Documento,
    Prescricao,
    ConviteContato,
    ConviteImportacao,
    ConviteMensagem,
)
from .serializers import (
    PacienteSerializer,
    AnamneseSerializer,
    DocumentoSerializer,
    PrescricaoSerializer,
    ConviteContatoSerializer,
    ConviteImportacaoSerializer,
    ConviteMensagemSerializer,
    ConviteEnvioSerializer,
)
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm
from reportlab.lib.utils import ImageReader
import copy

CSV_EXPECTED_COLUMNS = {"nome", "cpf", "telefone", "data_nascimento", "idade", "origem"}
CSV_REQUIRED_COLUMNS = {"nome", "telefone"}
IMPORT_MAX_LOG = 50


def _normalizar_digitos(valor: str) -> str:
    return "".join(ch for ch in (valor or "") if ch.isdigit())


def _parse_data(value: str):
    if not value:
        return None
    value = value.strip()
    if not value:
        return None
    formatos = ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y")
    for fmt in formatos:
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            continue
    return None


def _calcular_idade(data_nascimento):
    from django.utils import timezone

    if not data_nascimento:
        return None
    hoje = timezone.localdate()
    anos = hoje.year - data_nascimento.year - (
        (hoje.month, hoje.day) < (data_nascimento.month, data_nascimento.day)
    )
    return max(anos, 0)


def _normalize_header_text(text: str) -> str:
    return "".join(ch for ch in (text or "").lower() if ch.isalnum())


def _strip_decimal_tail(value: str) -> str:
    value = (value or "").strip()
    if not value:
        return value
    if "." in value:
        left, _, right = value.partition(".")
        if right.strip("0") == "":
            return left
    return value

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


class DocumentoViewSet(viewsets.ModelViewSet):
    queryset = Documento.objects.select_related("paciente").all()
    serializer_class = DocumentoSerializer
    permission_classes = [AllowAny]  # dev: liberar
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["nome", "content_type", "paciente__nome"]
    ordering_fields = ["criado_em", "tamanho"]
    
    # get_parser_classes padrão mantém multipart para upload; a action 'gerar' define parser via decorator

    def get_queryset(self):
        qs = super().get_queryset()
        paciente_id = self.request.query_params.get("paciente")
        if paciente_id:
            qs = qs.filter(paciente_id=paciente_id)
        return qs

    # ---------- Modelos prontos (Receita e Pós-operatório) ----------
    @action(detail=False, methods=["post"], url_path="gerar", parser_classes=[JSONParser, MultiPartParser, FormParser])
    def gerar(self, request):
        """Gera um PDF a partir de um modelo pronto e salva nos documentos do paciente.

        Body esperado (JSON or form):
        - paciente: ID do paciente
        - tipo: 'receita-basica' | 'pos-operatorio'
        """
        paciente_id = request.data.get("paciente")
        tipo = (request.data.get("tipo") or "").strip()

        if not paciente_id:
            return Response({"detail": "Campo 'paciente' é obrigatório."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            paciente = Paciente.objects.get(pk=paciente_id)
        except Paciente.DoesNotExist:
            return Response({"detail": "Paciente não encontrado."}, status=status.HTTP_404_NOT_FOUND)

        builders = {
            "receita-basica": self._build_receita_basica,
            "pos-operatorio": self._build_pos_operatorio,
            "termo-clareamento": self._build_termo_clareamento,
            "termo-implante": self._build_termo_implante,
            "termo-exodontia": self._build_termo_exodontia,
            "termo-hipertensao": self._build_termo_hipertensao,
        }
        if tipo not in builders:
            return Response({
                "detail": "Tipo inválido.",
                "tipos_suportados": list(builders.keys()),
            }, status=status.HTTP_400_BAD_REQUEST)

        # Monta o PDF em memória
        pdf_bytes, titulo = builders[tipo](paciente)

        # Salva como Documento do paciente
        hoje = datetime.now().strftime("%Y-%m-%d")
        filename = f"{titulo}_{paciente.nome}_{hoje}.pdf".replace(" ", "_")
        content = ContentFile(pdf_bytes, name=filename)
        doc = Documento(paciente=paciente)
        doc.arquivo.save(filename, content, save=True)
        doc.nome = titulo
        doc.content_type = "application/pdf"
        doc.tamanho = len(pdf_bytes)
        doc.save()

        data = DocumentoSerializer(doc, context={"request": request}).data
        return Response(data, status=status.HTTP_201_CREATED)

    # ---------- Helpers de geração de PDF ----------
    def _pdf_canvas(self):
        buf = io.BytesIO()
        c = canvas.Canvas(buf, pagesize=A4)
        return c, buf

    def _finish_pdf(self, c, buf):
        c.showPage(); c.save()
        return buf.getvalue()

    def _draw_header(self, c, titulo):
        w, h = A4
        # Logo opcional
        logo_path = getattr(settings, "CLINIC_LOGO_PATH", "") or ""
        if logo_path:
            try:
                p = logo_path
                if not os.path.isabs(p):
                    p = os.path.join(settings.BASE_DIR, p)
                if os.path.exists(p):
                    img = ImageReader(p)
                    # desenha no topo direito
                    c.drawImage(img, w - 5*cm, h - 3*cm, width=3*cm, height=3*cm, preserveAspectRatio=True, mask='auto')
            except Exception:
                pass

        c.setFont("Helvetica-Bold", 16)
        clinic_name = getattr(settings, "CLINIC_NAME", "Clínica Odontológica")
        c.drawString(2*cm, h - 2*cm, clinic_name)
        c.setFont("Helvetica", 10)
        address = getattr(settings, "CLINIC_ADDRESS", "Endereço: —")
        phone = getattr(settings, "CLINIC_PHONE", "Telefone: —")
        cro = getattr(settings, "CLINIC_CRO", "CRO: —")
        c.drawString(2*cm, h - 2.6*cm, f"{address} | {phone} | {cro}")
        c.setFont("Helvetica-Bold", 14)
        c.drawString(2*cm, h - 3.4*cm, titulo)
        c.line(2*cm, h - 3.6*cm, w - 2*cm, h - 3.6*cm)

    def _build_receita_basica(self, paciente):
        c, buf = self._pdf_canvas()
        w, h = A4
        self._draw_header(c, "Receita")

        y = h - 4.5*cm
        c.setFont("Helvetica", 12)
        data_txt = datetime.now().strftime("%d/%m/%Y")
        c.drawString(2*cm, y, f"Paciente: {paciente.nome}")
        y -= 0.8*cm
        c.drawString(2*cm, y, f"Data: {data_txt}")
        y -= 1.2*cm

        c.setFont("Helvetica-Bold", 12)
        c.drawString(2*cm, y, "Prescrições sugeridas:")
        y -= 0.8*cm
        c.setFont("Helvetica", 12)
        linhas = [
            "1) Ibuprofeno 400 mg — Tomar 1 comprimido de 8/8h por 3 dias, se dor.",
            "2) Dipirona 500 mg — Tomar 1 comprimido de 6/6h, se dor/Febre.",
            "3) Amoxicilina 500 mg — Tomar 1 cápsula de 8/8h por 7 dias (se indicado).",
            "4) Nimesulida 100 mg — Tomar 1 comprimido de 12/12h por 3 dias, após refeições.",
        ]
        for ln in linhas:
            c.drawString(2.2*cm, y, ln)
            y -= 0.7*cm

        y -= 1.0*cm
        c.setFont("Helvetica", 11)
        c.drawString(2*cm, y, "Observações: Suspender em caso de reação alérgica e procurar orientação médica.")

        # Assinatura
        y -= 2.0*cm
        c.line(10*cm, y, w - 2*cm, y)
        c.setFont("Helvetica", 11)
        c.drawString(10*cm, y - 0.6*cm, "Assinatura e carimbo do cirurgião-dentista")

        pdf = self._finish_pdf(c, buf)
        return pdf, "Receita"

    def _build_pos_operatorio(self, paciente):
        c, buf = self._pdf_canvas()
        w, h = A4
        self._draw_header(c, "Orientações Pós-operatórias")

        y = h - 4.5*cm
        c.setFont("Helvetica", 12)
        data_txt = datetime.now().strftime("%d/%m/%Y")
        c.drawString(2*cm, y, f"Paciente: {paciente.nome}")
        y -= 0.8*cm
        c.drawString(2*cm, y, f"Data: {data_txt}")
        y -= 1.2*cm

        c.setFont("Helvetica-Bold", 12)
        c.drawString(2*cm, y, "Cuidados e orientações:")
        y -= 0.8*cm
        c.setFont("Helvetica", 12)
        itens = [
            "• Morder a gaze por 30 a 60 minutos após o procedimento.",
            "• Aplicar gelo externo na região nas primeiras 24–48 horas (intervalos de 20 min).",
            "• Evitar esforços físicos intensos por 48 horas.",
            "• Evitar fumar e ingerir bebidas alcoólicas por 72 horas.",
            "• Manter a higiene oral com escovação suave; evitar bochechos vigorosos no primeiro dia.",
            "• Dieta pastosa e fria nas primeiras 24 horas; retomar conforme conforto.",
            "• Tomar as medicações prescritas conforme orientação.",
            "• Em caso de sangramento contínuo, dor intensa ou febre, contatar a clínica.",
        ]
        for ln in itens:
            c.drawString(2.2*cm, y, ln)
            y -= 0.7*cm

        y -= 1.0*cm
        c.setFont("Helvetica", 11)
        c.drawString(2*cm, y, "Estas orientações auxiliam na recuperação adequada e na redução de desconfortos.")

        # Assinatura
        y -= 2.0*cm
        c.line(10*cm, y, w - 2*cm, y)
        c.setFont("Helvetica", 11)
        c.drawString(10*cm, y - 0.6*cm, "Assinatura e carimbo do cirurgião-dentista")

        pdf = self._finish_pdf(c, buf)
        return pdf, "Pos-operatorio"

    # ---------------- Termos de consentimento ----------------
    def _paragraph(self, c, text, x, y, max_chars=95, leading=14):
        """Desenha um parágrafo simples quebrando por caracteres (aproximação)."""
        import textwrap
        lines = []
        for para in text.split("\n"):
            lines.extend(textwrap.wrap(para, max_chars) or [""])
        textobj = c.beginText()
        textobj.setTextOrigin(x, y)
        textobj.setLeading(leading)
        for ln in lines:
            textobj.textLine(ln)
        c.drawText(textobj)
        return y - leading * (len(lines))

    def _build_termo_clareamento(self, paciente):
        c, buf = self._pdf_canvas()
        w, h = A4
        self._draw_header(c, "Termo de Consentimento — Clareamento Dental")

        y = h - 4.6*cm
        c.setFont("Helvetica", 12)
        data_txt = datetime.now().strftime("%d/%m/%Y")
        y = self._paragraph(c, f"Paciente: {paciente.nome}\nData: {data_txt}", 2*cm, y)
        y -= 0.6*cm

        c.setFont("Helvetica-Bold", 12)
        c.drawString(2*cm, y, "Declaração:")
        y -= 0.6*cm
        c.setFont("Helvetica", 11)
        texto = (
            "Declaro ter sido informado(a) sobre o procedimento de clareamento dental, suas indicações, "
            "benefícios e possíveis efeitos colaterais, como sensibilidade dentária e irritação gengival. "
            "Compreendo que os resultados podem variar, que podem ser necessárias aplicações adicionais, e "
            "que restaurações pré-existentes não alteram sua cor." 
        )
        y = self._paragraph(c, texto, 2*cm, y)
        y -= 0.6*cm
        y = self._paragraph(c, "Autorizo a realização do procedimento e recebi orientações para cuidados domiciliares.", 2*cm, y)

        # Assinatura
        y -= 2.0*cm
        c.line(2*cm, y, 9*cm, y)
        c.drawString(2*cm, y - 0.5*cm, "Assinatura do(a) paciente ou responsável")
        c.line(11*cm, y, w - 2*cm, y)
        c.drawString(11*cm, y - 0.5*cm, "Assinatura do profissional")

        pdf = self._finish_pdf(c, buf)
        return pdf, "Termo_Clareamento"

    def _build_termo_implante(self, paciente):
        c, buf = self._pdf_canvas()
        w, h = A4
        self._draw_header(c, "Termo de Consentimento — Implante Dentário")
        y = h - 4.6*cm
        c.setFont("Helvetica", 12)
        data_txt = datetime.now().strftime("%d/%m/%Y")
        y = self._paragraph(c, f"Paciente: {paciente.nome}\nData: {data_txt}", 2*cm, y)
        y -= 0.6*cm
        c.setFont("Helvetica-Bold", 12)
        c.drawString(2*cm, y, "Informações e riscos:")
        y -= 0.6*cm
        c.setFont("Helvetica", 11)
        texto = (
            "Fui informado(a) sobre o procedimento cirúrgico de implante dentário, etapas de planejamento, "
            "instalação e reabilitação protética. Reconheço riscos inerentes como infecção, dor, edema, "
            "alterações de sensibilidade, perda de implante, fraturas e necessidade de procedimentos adicionais "
            "(ex.: enxerto). Compreendo alternativas terapêuticas e a importância do cuidado pós-operatório." 
        )
        y = self._paragraph(c, texto, 2*cm, y)
        y -= 0.6*cm
        y = self._paragraph(c, "Autorizo o procedimento e comprometo-me a seguir as orientações recebidas.", 2*cm, y)

        # Assinatura
        y -= 2.0*cm
        c.line(2*cm, y, 9*cm, y)
        c.drawString(2*cm, y - 0.5*cm, "Assinatura do(a) paciente ou responsável")
        c.line(11*cm, y, w - 2*cm, y)
        c.drawString(11*cm, y - 0.5*cm, "Assinatura do profissional")

        pdf = self._finish_pdf(c, buf)
        return pdf, "Termo_Implante"

    def _build_termo_exodontia(self, paciente):
        c, buf = self._pdf_canvas()
        w, h = A4
        self._draw_header(c, "Termo de Consentimento — Exodontia (Extração)")
        y = h - 4.6*cm
        c.setFont("Helvetica", 12)
        data_txt = datetime.now().strftime("%d/%m/%Y")
        y = self._paragraph(c, f"Paciente: {paciente.nome}\nData: {data_txt}", 2*cm, y)
        y -= 0.6*cm
        c.setFont("Helvetica-Bold", 12)
        c.drawString(2*cm, y, "Informações e riscos:")
        y -= 0.6*cm
        c.setFont("Helvetica", 11)
        texto = (
            "Compreendo que a exodontia pode envolver riscos como sangramento, infecção, dor, edema, trismo, "
            "exposição de seio maxilar, alterações de sensibilidade e fraturas. Fui orientado(a) sobre cuidados "
            "pós-operatórios, uso de medicações e retorno para acompanhamento. Estou ciente de alternativas quando aplicáveis." 
        )
        y = self._paragraph(c, texto, 2*cm, y)
        y -= 0.6*cm
        y = self._paragraph(c, "Autorizo a extração proposta e seguirei as recomendações fornecidas.", 2*cm, y)

        # Assinatura
        y -= 2.0*cm
        c.line(2*cm, y, 9*cm, y)
        c.drawString(2*cm, y - 0.5*cm, "Assinatura do(a) paciente ou responsável")
        c.line(11*cm, y, w - 2*cm, y)
        c.drawString(11*cm, y - 0.5*cm, "Assinatura do profissional")

        pdf = self._finish_pdf(c, buf)
        return pdf, "Termo_Exodontia"

    def _build_termo_hipertensao(self, paciente):
        c, buf = self._pdf_canvas()
        w, h = A4
        self._draw_header(c, "Termo de Consentimento — Paciente com Hipertensão")
        y = h - 4.6*cm
        c.setFont("Helvetica", 12)
        data_txt = datetime.now().strftime("%d/%m/%Y")
        y = self._paragraph(c, f"Paciente: {paciente.nome}\nData: {data_txt}", 2*cm, y)
        y -= 0.6*cm
        c.setFont("Helvetica-Bold", 12)
        c.drawString(2*cm, y, "Condições e cuidados:")
        y -= 0.6*cm
        c.setFont("Helvetica", 11)
        texto = (
            "Declaro estar ciente de minha condição de hipertensão arterial e informei medicações em uso. "
            "Fui orientado(a) sobre monitoramento de pressão arterial durante o atendimento, possíveis ajustes de "
            "anestésicos e necessidade de cuidados adicionais. Reconheço que, em situações de pressão elevada, "
            "o procedimento poderá ser adiado por segurança." 
        )
        y = self._paragraph(c, texto, 2*cm, y)
        y -= 0.6*cm
        y = self._paragraph(c, "Comprometo-me a seguir as recomendações e manter acompanhamento médico regular.", 2*cm, y)

        # Assinatura
        y -= 2.0*cm
        c.line(2*cm, y, 9*cm, y)
        c.drawString(2*cm, y - 0.5*cm, "Assinatura do(a) paciente ou responsável")
        c.line(11*cm, y, w - 2*cm, y)
        c.drawString(11*cm, y - 0.5*cm, "Assinatura do profissional")

        pdf = self._finish_pdf(c, buf)
        return pdf, "Termo_Hipertensao"


class PrescricaoViewSet(viewsets.ModelViewSet):
    queryset = Prescricao.objects.select_related("paciente").all()
    serializer_class = PrescricaoSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["paciente__nome", "profissional", "cro"]
    ordering_fields = ["criado_em", "atualizado_em"]

    def get_queryset(self):
        qs = super().get_queryset()
        paciente_id = self.request.query_params.get("paciente")
        if paciente_id:
            qs = qs.filter(paciente_id=paciente_id)
        return qs

    def perform_create(self, serializer):
        return serializer.save()

    @action(detail=True, methods=["post"], url_path="exportar")
    def exportar(self, request, pk=None):
        prescricao = self.get_object()
        pdf_bytes = self._build_prescricao_pdf(prescricao)
        pdf_bytes = self._apply_template(pdf_bytes)

        hoje = datetime.now().strftime("%Y-%m-%d")
        titulo = f"Prescrição"
        filename = f"prescricao_{prescricao.paciente.nome}_{prescricao.id}_{hoje}.pdf".replace(" ", "_")
        content = ContentFile(pdf_bytes, name=filename)
        doc = Documento(paciente=prescricao.paciente)
        doc.arquivo.save(filename, content, save=True)
        doc.nome = f"Prescrição #{prescricao.id}"
        doc.content_type = "application/pdf"
        doc.tamanho = len(pdf_bytes)
        doc.save()

        data = DocumentoSerializer(doc, context={"request": request}).data
        download_url = data.get("url") or data.get("arquivo")
        return Response(
            {
                "detail": "PDF gerado e salvo nos documentos do paciente.",
                "documento": data,
                "download_url": download_url,
            },
            status=status.HTTP_201_CREATED,
        )

    # --------- Helpers ---------
    def _pdf_canvas(self):
        buf = io.BytesIO()
        c = canvas.Canvas(buf, pagesize=A4)
        return c, buf

    def _finish_pdf(self, c, buf):
        c.showPage(); c.save()
        return buf.getvalue()

    def _draw_header(self, c, titulo, prescricao):
        w, h = A4
        logo_path = getattr(settings, "CLINIC_LOGO_PATH", "") or ""
        if logo_path:
            try:
                p = logo_path
                if not os.path.isabs(p):
                    p = os.path.join(settings.BASE_DIR, p)
                if os.path.exists(p):
                    img = ImageReader(p)
                    c.drawImage(img, w - 5 * cm, h - 3 * cm, width=3 * cm, height=3 * cm, preserveAspectRatio=True, mask='auto')
            except Exception:
                pass

        clinic_name = getattr(settings, "CLINIC_NAME", "Clínica Odontológica")
        address = getattr(settings, "CLINIC_ADDRESS", "Endereço: —")
        phone = getattr(settings, "CLINIC_PHONE", "Telefone: —")
        cro = getattr(settings, "CLINIC_CRO", "CRO: —")

        c.setFont("Helvetica-Bold", 16)
        c.drawString(2 * cm, h - 2 * cm, clinic_name)
        c.setFont("Helvetica", 10)
        c.drawString(2 * cm, h - 2.6 * cm, f"{address} | {phone} | {cro}")
        c.setFont("Helvetica-Bold", 14)
        c.drawString(2 * cm, h - 3.4 * cm, titulo)
        c.line(2 * cm, h - 3.6 * cm, w - 2 * cm, h - 3.6 * cm)

    def _draw_text_block(self, c, text, x, y, font="Helvetica", size=11, leading=14, max_chars=95):
        import textwrap

        c.setFont(font, size)
        lines = []
        for part in str(text).split("\n"):
            lines.extend(textwrap.wrap(part, max_chars) or [""])
        for line in lines:
            c.drawString(x, y, line)
            y -= leading / 10 * cm
        return y

    def _build_prescricao_pdf(self, prescricao):
        c, buf = self._pdf_canvas()
        w, h = A4
        self._draw_header(c, "Prescrição Odontológica", prescricao)

        y = h - 4.5 * cm
        data_txt = datetime.now().strftime("%d/%m/%Y")
        paciente = prescricao.paciente

        c.setFont("Helvetica", 12)
        c.drawString(2 * cm, y, f"Paciente: {paciente.nome}")
        y -= 0.7 * cm
        if paciente.cpf:
            c.drawString(2 * cm, y, f"CPF: {paciente.cpf}")
            y -= 0.7 * cm
        if paciente.data_nascimento:
            c.drawString(2 * cm, y, f"Data de nascimento: {paciente.data_nascimento.strftime('%d/%m/%Y')}")
            y -= 0.7 * cm
        c.drawString(2 * cm, y, f"Data da prescrição: {data_txt}")
        y -= 1.0 * cm

        c.setFont("Helvetica-Bold", 12)
        c.drawString(2 * cm, y, "Medicamentos prescritos:")
        y -= 0.8 * cm

        c.setFont("Helvetica", 11)
        for idx, item in enumerate(prescricao.itens or [], start=1):
            if y < 4 * cm:
                c.showPage()
                self._draw_header(c, "Prescrição Odontológica", prescricao)
                y = h - 4.5 * cm
                c.setFont("Helvetica", 11)
            c.drawString(2.1 * cm, y, f"{idx}. {item.get('nome', '—')}")
            y -= 0.6 * cm
            campos = [
                ("Classe", item.get("classe_nome")),
                ("Dose", item.get("dose")),
                ("Frequência", item.get("frequencia")),
                ("Duração", item.get("duracao")),
            ]
            for label, value in campos:
                if value:
                    c.drawString(2.4 * cm, y, f"{label}: {value}")
                    y -= 0.5 * cm
            orient = item.get("orientacoes")
            if orient:
                c.drawString(2.4 * cm, y, "Orientações:")
                y -= 0.5 * cm
                c.setFont("Helvetica", 10)
                wrapper = self._draw_text_block(c, orient, 2.6 * cm, y + 0.3 * cm, font="Helvetica", size=10, leading=13, max_chars=90)
                y = wrapper - 0.2 * cm
                c.setFont("Helvetica", 11)
            y -= 0.4 * cm

        if prescricao.observacoes:
            if y < 5 * cm:
                c.showPage()
                self._draw_header(c, "Prescrição Odontológica", prescricao)
                y = h - 4.5 * cm
            c.setFont("Helvetica-Bold", 11)
            c.drawString(2 * cm, y, "Observações adicionais:")
            y -= 0.6 * cm
            c.setFont("Helvetica", 10)
            y = self._draw_text_block(c, prescricao.observacoes, 2.2 * cm, y + 0.3 * cm, font="Helvetica", size=10, leading=13, max_chars=95) - 0.3 * cm

        y -= 1.2 * cm
        c.setFont("Helvetica", 11)
        responsavel = prescricao.profissional or getattr(settings, "CLINIC_RESPONSAVEL_PADRAO", "")
        cro = prescricao.cro or getattr(settings, "CLINIC_CRO", "")
        if responsavel:
            c.drawString(2 * cm, y, f"Profissional responsável: {responsavel}")
            y -= 0.6 * cm
        if cro:
            c.drawString(2 * cm, y, f"CRO: {cro}")
            y -= 0.8 * cm

        # Assinatura
        c.line(2 * cm, y, 10 * cm, y)
        c.drawString(2 * cm, y - 0.5 * cm, "Assinatura do profissional")

        pdf = self._finish_pdf(c, buf)
        return pdf

    def _apply_template(self, pdf_bytes: bytes) -> bytes:
        template_path = getattr(settings, "PRESCRIPTION_TEMPLATE_PATH", "") or ""
        if not template_path:
            return pdf_bytes
        try:
            from PyPDF2 import PdfReader, PdfWriter
        except ImportError:
            return pdf_bytes

        path = template_path
        if not os.path.isabs(path):
            path = os.path.join(settings.BASE_DIR, path)
        if not os.path.exists(path):
            return pdf_bytes

        try:
            with open(path, "rb") as template_file:
                template_reader = PdfReader(template_file)
                overlay_reader = PdfReader(io.BytesIO(pdf_bytes))
                writer = PdfWriter()
                total_template = len(template_reader.pages)
                for idx, overlay_page in enumerate(overlay_reader.pages):
                    base_index = idx if idx < total_template else total_template - 1
                    base_page = copy.copy(template_reader.pages[base_index])
                    base_page.merge_page(overlay_page)
                    writer.add_page(base_page)
                out_stream = io.BytesIO()
                writer.write(out_stream)
                return out_stream.getvalue()
        except Exception:
            return pdf_bytes

        return pdf_bytes


class ConviteImportacaoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ConviteImportacao.objects.all()
    serializer_class = ConviteImportacaoSerializer
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]
    http_method_names = ["get", "post", "head", "options"]

    def create(self, request, *args, **kwargs):
        arquivo = request.FILES.get("arquivo")
        if not arquivo:
            return Response(
                {"detail": "Envie um arquivo CSV utilizando o campo 'arquivo'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        origem = (request.data.get("origem") or "").strip() or "Importação CSV"
        try:
            conteudo = arquivo.read().decode("utf-8-sig")
        except UnicodeDecodeError:
            arquivo.seek(0)
            conteudo = arquivo.read().decode("latin-1")

        if not conteudo.strip():
            return Response({"detail": "O arquivo CSV está vazio."}, status=status.HTTP_400_BAD_REQUEST)

        stream = io.StringIO(conteudo)
        try:
            dialect = csv.Sniffer().sniff(conteudo, delimiters=",	;|")
            stream.seek(0)
            reader = csv.reader(stream, dialect)
        except csv.Error:
            stream.seek(0)
            reader = csv.reader(stream, delimiter=";")

        headers = next(reader, None)
        if headers is None:
            return Response({"detail": "O arquivo CSV não possui cabeçalho."}, status=status.HTTP_400_BAD_REQUEST)

        if len(headers) == 1:
            inline_headers = re.split(r"[;,]", headers[0])
            if len(inline_headers) > 1:
                headers = [parte.strip().strip(".") for parte in inline_headers if parte.strip().strip(".")]

        expected_order = ["nome", "cpf", "telefone", "data_nascimento", "idade", "origem"]
        index_by_name = {}

        for idx, header in enumerate(headers):
            normalized = _normalize_header_text(header)
            if not normalized:
                continue
            for expected in expected_order:
                key = expected.replace("_", "")
                if normalized == key or key in normalized:
                    index_by_name[expected] = idx

        for idx, expected in enumerate(expected_order):
            if expected not in index_by_name and idx < len(headers):
                index_by_name[expected] = idx

        missing_required = [col for col in CSV_REQUIRED_COLUMNS if col not in index_by_name]
        if missing_required:
            return Response(
                {
                    "detail": "Colunas obrigatórias ausentes no cabeçalho do CSV.",
                    "colunas_obrigatorias": sorted(CSV_REQUIRED_COLUMNS),
                    "colunas_ausentes": sorted(missing_required),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        matched_indexes = set(index_by_name.values())
        colunas_desconhecidas = [
            headers[idx]
            for idx in range(len(headers))
            if headers[idx] and idx not in matched_indexes
        ]

        def campo(row, chave):
            idx = index_by_name.get(chave)
            if idx is None or idx >= len(row):
                return ""
            return (row[idx] or "").strip()

        stats = {
            "total": 0,
            "importados": 0,
            "atualizados": 0,
            "ignorados": 0,
            "erros": 0,
        }
        erros = []

        with transaction.atomic():
            for linha, row in enumerate(reader, start=2):
                if not row or not any((valor or "").strip() for valor in row):
                    continue
                if len(row) < len(headers):
                    row = row + [""] * (len(headers) - len(row))
                stats["total"] += 1
                nome = campo(row, "nome")
                telefone_original = _strip_decimal_tail(campo(row, "telefone"))
                cpf_original = _strip_decimal_tail(campo(row, "cpf"))
                data_nascimento_raw = campo(row, "data_nascimento")
                idade_raw = _strip_decimal_tail(campo(row, "idade"))
                origem_csv = campo(row, "origem")
                origem_final = origem_csv or origem

                if not nome and not telefone_original and not cpf_original:
                    stats["ignorados"] += 1
                    continue

                if not nome:
                    stats["erros"] += 1
                    if len(erros) < IMPORT_MAX_LOG:
                        erros.append(f"Linha {linha}: campo 'nome' vazio.")
                    continue

                if not telefone_original:
                    stats["erros"] += 1
                    if len(erros) < IMPORT_MAX_LOG:
                        erros.append(f"Linha {linha}: campo 'telefone' vazio.")
                    continue

                telefone_normalizado = _normalizar_digitos(telefone_original)
                if not telefone_normalizado:
                    stats["erros"] += 1
                    if len(erros) < IMPORT_MAX_LOG:
                        erros.append(f"Linha {linha}: telefone inválido '{telefone_original}'.")
                    continue

                cpf_normalizado = _normalizar_digitos(cpf_original)
                data_nascimento = _parse_data(data_nascimento_raw)
                idade = None
                if idade_raw:
                    try:
                        idade = int(float(idade_raw))
                    except ValueError:
                        idade = None
                if idade is None and data_nascimento:
                    idade = _calcular_idade(data_nascimento)

                contato = None
                query = Q()
                if cpf_normalizado:
                    query |= Q(cpf_normalizado=cpf_normalizado)
                if telefone_normalizado:
                    query |= Q(telefone_normalizado=telefone_normalizado)
                if query:
                    contato = ConviteContato.objects.filter(query).first()

                if contato:
                    atualizado = False
                    if contato.nome != nome:
                        contato.nome = nome
                        atualizado = True
                    if cpf_original and contato.cpf != cpf_original:
                        contato.cpf = cpf_original
                        atualizado = True
                    if telefone_original and contato.telefone != telefone_original:
                        contato.telefone = telefone_original
                        atualizado = True
                    if data_nascimento and contato.data_nascimento != data_nascimento:
                        contato.data_nascimento = data_nascimento
                        atualizado = True
                    if idade is not None and contato.idade != idade:
                        contato.idade = idade
                        atualizado = True
                    if origem_csv and contato.origem != origem_csv:
                        contato.origem = origem_csv
                        atualizado = True
                    elif not contato.origem and origem and contato.origem != origem:
                        contato.origem = origem
                        atualizado = True
                    if atualizado:
                        contato.save()
                        stats["atualizados"] += 1
                    else:
                        stats["ignorados"] += 1
                    continue

                ConviteContato.objects.create(
                    nome=nome,
                    cpf=cpf_original,
                    telefone=telefone_original,
                    data_nascimento=data_nascimento,
                    idade=idade,
                    origem=origem_final,
                )
                stats["importados"] += 1

        importacao = ConviteImportacao.objects.create(
            arquivo_nome=getattr(arquivo, "name", "importacao.csv"),
            origem=origem,
            total_linhas=stats["total"],
            importados=stats["importados"],
            atualizados=stats["atualizados"],
            ignorados=stats["ignorados"],
            erros=stats["erros"],
            log="\n".join(erros),
        )

        serializer = self.get_serializer(importacao)
        payload = serializer.data
        payload["colunas_desconhecidas"] = colunas_desconhecidas
        payload["origem_utilizada"] = origem
        return Response(payload, status=status.HTTP_201_CREATED)


class ConviteContatoViewSet(viewsets.ModelViewSet):
    queryset = ConviteContato.objects.all()
    serializer_class = ConviteContatoSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["nome", "cpf", "telefone"]
    ordering_fields = ["criado_em", "ultima_mensagem_em", "nome"]
    ordering = ["nome"]
    http_method_names = ["get", "patch", "head", "options"]

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)
        search_value = self.request.query_params.get("search")
        if search_value:
            termo = search_value.strip()
            digits = _normalizar_digitos(termo)
            filtro = Q(nome__icontains=termo)
            if digits:
                filtro |= Q(cpf_normalizado__startswith=digits) | Q(telefone_normalizado__startswith=digits)
            qs = qs.filter(filtro)
        return qs

    def partial_update(self, request, *args, **kwargs):
        dados = request.data
        permitido = {"status"}
        if any(chave not in permitido for chave in dados.keys()):
            return Response(
                {"detail": "Apenas o campo 'status' pode ser atualizado."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().partial_update(request, *args, **kwargs)

    @action(detail=False, methods=["post"], url_path="enviar")
    def enviar(self, request):
        serializer = ConviteEnvioSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ids = serializer.validated_data["contatos"]
        mensagem = serializer.validated_data["mensagem"].strip()
        if not mensagem:
            return Response({"detail": "Informe a mensagem a ser enviada."}, status=status.HTTP_400_BAD_REQUEST)

        contatos = list(self.get_queryset().filter(id__in=ids))
        encontrados = {contato.id for contato in contatos}
        ids_faltantes = [i for i in ids if i not in encontrados]
        if ids_faltantes:
            return Response(
                {"detail": "Alguns contatos não foram encontrados.", "ids": ids_faltantes},
                status=status.HTTP_404_NOT_FOUND,
            )

        enviados = 0
        falhas = []
        agora = timezone.now()

        with transaction.atomic():
            for contato in contatos:
                ConviteMensagem.objects.create(
                    contato=contato,
                    conteudo=mensagem,
                    status=ConviteMensagem.Status.ENVIADO,
                )
                contato.status = ConviteContato.Status.ENVIADO
                contato.ultima_mensagem_em = agora
                contato.save(update_fields=["status", "ultima_mensagem_em", "atualizado_em"])
                enviados += 1

        return Response(
            {
                "detail": "Mensagens registradas com sucesso.",
                "enviados": enviados,
                "falhas": falhas,
            },
            status=status.HTTP_201_CREATED,
        )


class ConviteMensagemViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ConviteMensagem.objects.select_related("contato").all()
    serializer_class = ConviteMensagemSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["criado_em"]
    ordering = ["-criado_em"]

    def get_queryset(self):
        qs = super().get_queryset()
        contato_id = self.request.query_params.get("contato")
        if contato_id:
            qs = qs.filter(contato_id=contato_id)
        return qs

        serializer = self.get_serializer(importacao)
        return Response(
            {
                "detail": "Importação processada.",
                "resumo": stats,
                "colunas_desconhecidas": colunas_desconhecidas,
                "importacao": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )
