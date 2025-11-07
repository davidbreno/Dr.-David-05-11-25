from django.contrib import admin

from .models import Debito, DebitoDocumento, DebitoItem, Lancamento


@admin.register(Lancamento)
class LancamentoAdmin(admin.ModelAdmin):
	list_display = ("id", "tipo", "categoria", "valor", "data", "status")
	list_filter = ("tipo", "status", "data")
	search_fields = ("categoria", "descricao")


class DebitoItemInline(admin.TabularInline):
	model = DebitoItem
	extra = 0


class DebitoDocumentoInline(admin.TabularInline):
	model = DebitoDocumento
	extra = 0


@admin.register(Debito)
class DebitoAdmin(admin.ModelAdmin):
	list_display = ("id", "paciente", "data_vencimento", "status", "valor_total", "plano")
	list_filter = ("status", "data_vencimento", "plano")
	search_fields = ("paciente__nome", "dentista", "plano")
	date_hierarchy = "data_vencimento"
	inlines = [DebitoItemInline, DebitoDocumentoInline]
