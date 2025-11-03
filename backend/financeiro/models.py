from django.db import models
from pacientes.models import Paciente

class Lancamento(models.Model):
    class Tipo(models.TextChoices):
        RECEITA = "receita", "Receita"
        DESPESA = "despesa", "Despesa"
    class Status(models.TextChoices):
        PENDENTE = "pendente", "Pendente"
        PAGO = "pago", "Pago"

    tipo = models.CharField(max_length=7, choices=Tipo.choices)
    categoria = models.CharField(max_length=80)
    paciente = models.ForeignKey(Paciente, on_delete=models.SET_NULL, null=True, blank=True, related_name="lancamentos")
    valor = models.DecimalField(max_digits=12, decimal_places=2)
    data = models.DateField()
    status = models.CharField(max_length=8, choices=Status.choices, default=Status.PENDENTE)
    descricao = models.TextField(blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-data", "-criado_em"]
        indexes = [models.Index(fields=["tipo"]), models.Index(fields=["status"]), models.Index(fields=["data"])]

    def __str__(self) -> str:
        return f"{self.tipo} {self.valor} em {self.data}"
