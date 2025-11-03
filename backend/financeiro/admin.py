from django.contrib import admin
from .models import Lancamento

@admin.register(Lancamento)
class LancamentoAdmin(admin.ModelAdmin):
    list_display = ("id", "tipo", "categoria", "valor", "data", "status")
    list_filter = ("tipo", "status", "data")
    search_fields = ("categoria", "descricao")
