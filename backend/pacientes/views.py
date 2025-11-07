import io, os
from datetime import datetime
from django.core.files.base import ContentFile
from django.conf import settings
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import DjangoModelPermissions, AllowAny
from rest_framework.response import Response
from .models import Paciente, Anamnese, Documento
from .serializers import PacienteSerializer, AnamneseSerializer, DocumentoSerializer
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm
from reportlab.lib.utils import ImageReader

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
