from django.contrib import admin
from .models import Paciente

@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    list_display = ("nome", "cpf", "telefone", "email", "criado_em")
    search_fields = ("nome", "cpf", "email")
    list_filter = ("criado_em",)
    ordering = ("nome",)
