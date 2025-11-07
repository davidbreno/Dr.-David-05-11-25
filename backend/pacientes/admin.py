from django.contrib import admin
from .models import Paciente, Anamnese, Documento

class AnamneseInline(admin.StackedInline):
    model = Anamnese
    can_delete = False
    extra = 0
    max_num = 1
    fk_name = "paciente"


@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    list_display = ("nome", "cpf", "telefone", "email", "criado_em")
    search_fields = ("nome", "cpf", "email")
    list_filter = ("criado_em",)
    ordering = ("nome",)
    inlines = [AnamneseInline]


@admin.register(Anamnese)
class AnamneseAdmin(admin.ModelAdmin):
    list_display = ("paciente", "criado_em", "atualizado_em")
    search_fields = ("paciente__nome", "paciente__cpf")


@admin.register(Documento)
class DocumentoAdmin(admin.ModelAdmin):
    list_display = ("id", "paciente", "nome", "content_type", "tamanho", "criado_em")
    search_fields = ("paciente__nome", "nome", "content_type")
    list_filter = ("content_type", "criado_em")
    ordering = ("-criado_em",)
