from django.db import models

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
