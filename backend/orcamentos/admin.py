from django.contrib import admin
from .models import Orcamento, OrcamentoItem


class OrcamentoItemInline(admin.TabularInline):
	model = OrcamentoItem
	extra = 0


@admin.register(Orcamento)
class OrcamentoAdmin(admin.ModelAdmin):
	list_display = ("id", "paciente", "status", "valor_total", "criado_em")
	list_filter = ("status", "criado_em")
	search_fields = ("descricao", "paciente__nome")
	inlines = [OrcamentoItemInline]


@admin.register(OrcamentoItem)
class OrcamentoItemAdmin(admin.ModelAdmin):
	list_display = ("id", "orcamento", "dente", "procedimento", "valor")
	search_fields = ("procedimento",)
