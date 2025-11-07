from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

class Paciente(models.Model):
    nome = models.CharField(max_length=120)
    cpf = models.CharField(max_length=14, unique=True)
    data_nascimento = models.DateField(null=True, blank=True)
    telefone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    endereco = models.TextField(blank=True)
    observacoes = models.TextField(blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["nome"]
        indexes = [models.Index(fields=["cpf"]), models.Index(fields=["nome"])]

    def __str__(self) -> str:
        return f"{self.nome} ({self.cpf})"


class Anamnese(models.Model):
    paciente = models.OneToOneField(Paciente, on_delete=models.CASCADE, related_name="anamnese")

    # Campos principais
    queixa_principal = models.TextField(blank=True)
    antecedentes_medicos = models.TextField(blank=True)
    alergias = models.TextField(blank=True)
    medicamentos = models.TextField(blank=True)

    # Condições
    possui_diabetes = models.BooleanField(default=False)
    possui_hipertensao = models.BooleanField(default=False)
    cardiopatia = models.BooleanField(default=False)
    asma = models.BooleanField(default=False)
    hemorragias = models.BooleanField(default=False)
    anestesia_reacao = models.BooleanField(default=False)
    fuma = models.BooleanField(default=False)
    gravida = models.BooleanField(default=False)

    # Sinais vitais simples
    pressao_sistolica = models.PositiveIntegerField(null=True, blank=True)
    pressao_diastolica = models.PositiveIntegerField(null=True, blank=True)
    batimentos = models.PositiveIntegerField(null=True, blank=True)

    outros = models.TextField(blank=True)

    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["paciente"]),
        ]

    def __str__(self) -> str:
        return f"Anamnese de {self.paciente.nome}"


class Documento(models.Model):
    """Documentos anexados ao cadastro do paciente."""
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name="documentos")
    arquivo = models.FileField(upload_to="documentos/%Y/%m/%d")
    nome = models.CharField(max_length=255, blank=True)
    content_type = models.CharField(max_length=120, blank=True)
    tamanho = models.PositiveIntegerField(default=0)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-criado_em"]
        indexes = [
            models.Index(fields=["paciente"]),
            models.Index(fields=["criado_em"]),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"Documento({self.id}) de {self.paciente.nome}: {self.nome or (self.arquivo.name if self.arquivo else '')}"


class Prescricao(models.Model):
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name="prescricoes")
    profissional = models.CharField(max_length=120, blank=True)
    cro = models.CharField(max_length=30, blank=True)
    observacoes = models.TextField(blank=True)
    itens = models.JSONField(default=list)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-criado_em"]
        indexes = [
            models.Index(fields=["paciente", "criado_em"]),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"Prescrição #{self.id} de {self.paciente.nome}"


class ConviteImportacao(models.Model):
    """Histórico de importações de contatos externos."""

    arquivo_nome = models.CharField(max_length=255)
    origem = models.CharField(max_length=120, blank=True)
    total_linhas = models.PositiveIntegerField(default=0)
    importados = models.PositiveIntegerField(default=0)
    atualizados = models.PositiveIntegerField(default=0)
    ignorados = models.PositiveIntegerField(default=0)
    erros = models.PositiveIntegerField(default=0)
    log = models.TextField(blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-criado_em"]

    def __str__(self) -> str:  # pragma: no cover
        return f"Importação {self.arquivo_nome} ({self.criado_em:%d/%m/%Y})"


class ConviteContato(models.Model):
    """Contatos externos importados para convites/mensagens em massa."""

    class Status(models.TextChoices):
        NOVO = "novo", "Nunca contatado"
        ENVIADO = "enviado", "Convite enviado"
        FALHA = "falha", "Falha no envio"

    nome = models.CharField(max_length=160)
    cpf = models.CharField(max_length=14, blank=True)
    cpf_normalizado = models.CharField(max_length=11, blank=True, db_index=True)
    telefone = models.CharField(max_length=32)
    telefone_normalizado = models.CharField(max_length=20, db_index=True)
    data_nascimento = models.DateField(null=True, blank=True)
    idade = models.PositiveIntegerField(null=True, blank=True)
    origem = models.CharField(max_length=120, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NOVO)
    ultima_mensagem_em = models.DateTimeField(null=True, blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["nome"]
        indexes = [
            models.Index(fields=["status", "ultima_mensagem_em"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["cpf_normalizado"],
                condition=models.Q(cpf_normalizado__isnull=False) & ~models.Q(cpf_normalizado=""),
                name="unique_convite_cpf",
            ),
            models.UniqueConstraint(
                fields=["telefone_normalizado"],
                condition=models.Q(telefone_normalizado__isnull=False) & ~models.Q(telefone_normalizado=""),
                name="unique_convite_telefone",
            ),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"Convite: {self.nome}"

    @staticmethod
    def _normalizar_digitos(valor: str) -> str:
        return "".join(ch for ch in (valor or "") if ch.isdigit())

    def atualizar_normalizados(self) -> None:
        self.cpf_normalizado = self._normalizar_digitos(self.cpf)
        self.telefone_normalizado = self._normalizar_digitos(self.telefone)

    def save(self, *args, **kwargs):  # pragma: no cover - simples
        self.atualizar_normalizados()
        if not self.idade and self.data_nascimento:
            hoje = timezone.localdate()
            anos = hoje.year - self.data_nascimento.year - (
                (hoje.month, hoje.day) < (self.data_nascimento.month, self.data_nascimento.day)
            )
            self.idade = max(anos, 0)
        super().save(*args, **kwargs)


class ConviteMensagem(models.Model):
    """Registro de mensagens enviadas para um contato importado."""

    class Status(models.TextChoices):
        ENVIADO = "enviado", "Enviado"
        FALHA = "falha", "Falhou"

    contato = models.ForeignKey(ConviteContato, on_delete=models.CASCADE, related_name="mensagens")
    conteudo = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ENVIADO)
    erro = models.TextField(blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-criado_em"]
        indexes = [
            models.Index(fields=["status", "criado_em"]),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"Mensagem para {self.contato.nome} ({self.status})"
