from django.db import models
from pacientes.models import Paciente

class Odontograma(models.Model):
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name="odontogramas")
    mapa = models.JSONField(default=dict, blank=True)
    anotacoes = models.TextField(blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-criado_em"]
        indexes = [models.Index(fields=["paciente"])]

    def __str__(self) -> str:
        return f"Odontograma #{self.id} - {self.paciente.nome}"
