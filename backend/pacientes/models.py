from django.db import models
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
