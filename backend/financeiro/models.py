from decimal import Decimal

from django.db import models
from django.db.models import Sum

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


class Debito(models.Model):
    class Status(models.TextChoices):
        PENDENTE = "pendente", "Pendente"
        PARCIAL = "parcial", "Parcial"
        PAGO = "pago", "Pago"

    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name="debitos")
    plano = models.CharField(max_length=80, blank=True)
    data_vencimento = models.DateField()
    dentista = models.CharField(max_length=120, blank=True)
    observacao = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDENTE)
    valor_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-data_vencimento", "-criado_em"]
        indexes = [
            models.Index(fields=["paciente", "status"]),
            models.Index(fields=["data_vencimento"]),
        ]

    def __str__(self) -> str:
        return f"Débito #{self.pk} - {self.paciente}"

    def atualizar_total(self):
        total = self.itens.aggregate(total=Sum("valor"))
        self.valor_total = total.get("total") or Decimal("0")
        self.save(update_fields=["valor_total", "atualizado_em"])


class DebitoItem(models.Model):
    debito = models.ForeignKey(Debito, on_delete=models.CASCADE, related_name="itens")
    procedimento = models.CharField(max_length=150)
    dentes_regiao = models.CharField(max_length=40, blank=True)
    valor = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]

    def __str__(self) -> str:
        return f"{self.procedimento} - R$ {self.valor}"


class DebitoDocumento(models.Model):
    debito = models.ForeignKey(Debito, on_delete=models.CASCADE, related_name="documentos")
    arquivo = models.FileField(upload_to="documentos/debitos/")
    nome = models.CharField(max_length=160, blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-criado_em"]

    def save(self, *args, **kwargs):
        if not self.nome and self.arquivo:
            self.nome = self.arquivo.name
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.nome or f"Documento #{self.pk}"
