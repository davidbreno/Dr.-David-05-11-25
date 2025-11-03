from django.contrib import admin
from .models import Odontograma

@admin.register(Odontograma)
class OdontogramaAdmin(admin.ModelAdmin):
    list_display = ("id", "paciente", "criado_em", "atualizado_em")
    search_fields = ("paciente__nome",)
    list_filter = ("criado_em",)
