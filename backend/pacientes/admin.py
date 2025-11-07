from django.contrib import admin
from .models import (
    Paciente,
    Anamnese,
    Documento,
    Prescricao,
    ConviteContato,
    ConviteImportacao,
    ConviteMensagem,
)

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


@admin.register(Prescricao)
class PrescricaoAdmin(admin.ModelAdmin):
    list_display = ("id", "paciente", "profissional", "cro", "criado_em")
    search_fields = ("paciente__nome", "paciente__cpf", "profissional", "cro")
    list_filter = ("criado_em",)
    ordering = ("-criado_em",)


@admin.register(ConviteContato)
class ConviteContatoAdmin(admin.ModelAdmin):
    list_display = (
        "nome",
        "telefone",
        "status",
        "origem",
        "ultima_mensagem_em",
        "criado_em",
    )
    search_fields = ("nome", "cpf", "telefone")
    list_filter = ("status", "origem", "criado_em")
    ordering = ("nome",)


@admin.register(ConviteImportacao)
class ConviteImportacaoAdmin(admin.ModelAdmin):
    list_display = (
        "arquivo_nome",
        "origem",
        "total_linhas",
        "importados",
        "atualizados",
        "erros",
        "criado_em",
    )
    search_fields = ("arquivo_nome", "origem")
    list_filter = ("origem", "criado_em")
    ordering = ("-criado_em",)


@admin.register(ConviteMensagem)
class ConviteMensagemAdmin(admin.ModelAdmin):
    list_display = ("contato", "status", "criado_em")
    search_fields = ("contato__nome", "contato__telefone")
    list_filter = ("status", "criado_em")
    ordering = ("-criado_em",)
