from django.db import models

class Produto(models.Model):
    nome = models.CharField(max_length=150)
    sku = models.CharField(max_length=40, unique=True)
    quantidade = models.IntegerField(default=0)
    custo = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    preco = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    unidade = models.CharField(max_length=20, default="un")
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["nome"]
        indexes = [models.Index(fields=["sku"]), models.Index(fields=["nome"])]

    def __str__(self) -> str:
        return f"{self.nome} ({self.sku})"
