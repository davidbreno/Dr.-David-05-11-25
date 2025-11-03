from django.db import models
from pacientes.models import Paciente

class Orcamento(models.Model):
    class Status(models.TextChoices):
        RASCUNHO = "rascunho", "Rascunho"
        APROVADO = "aprovado", "Aprovado"
        REPROVADO = "reprovado", "Reprovado"

    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name="orcamentos")
    descricao = models.CharField(max_length=255, blank=True)
    valor_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.RASCUNHO)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-criado_em"]
        indexes = [models.Index(fields=["status"]), models.Index(fields=["paciente"])]

    def __str__(self) -> str:
        return f"Orçamento #{self.id} - {self.paciente.nome}"
