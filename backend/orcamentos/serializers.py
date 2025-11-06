from rest_framework import serializers
from django.db import transaction
from .models import Orcamento, OrcamentoItem

class OrcamentoItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrcamentoItem
        fields = ["id", "dente", "procedimento", "valor", "criado_em"]
        read_only_fields = ["id", "criado_em"]


class OrcamentoSerializer(serializers.ModelSerializer):
    itens = OrcamentoItemSerializer(many=True, required=False)

    class Meta:
        model = Orcamento
        fields = [
            "id",
            "paciente",
            "descricao",
            "valor_total",
            "status",
            "criado_em",
            "atualizado_em",
            "itens",
        ]
        read_only_fields = ["id", "criado_em", "atualizado_em"]

    def _recalc_total(self, itens_data):
        total = 0
        for it in itens_data:
            try:
                total += float(it.get("valor") or 0)
            except Exception:
                pass
        return round(total, 2)

    @transaction.atomic
    def create(self, validated_data):
        itens_data = validated_data.pop("itens", [])
        # calcula total a partir dos itens, se informado substitui
        total = self._recalc_total(itens_data)
        validated_data["valor_total"] = total
        orc = Orcamento.objects.create(**validated_data)
        for it in itens_data:
            OrcamentoItem.objects.create(orcamento=orc, **it)
        return orc

    @transaction.atomic
    def update(self, instance, validated_data):
        itens_data = validated_data.pop("itens", None)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        if itens_data is not None:
            # substitui os itens
            instance.itens.all().delete()
            for it in itens_data:
                OrcamentoItem.objects.create(orcamento=instance, **it)
            instance.valor_total = self._recalc_total(itens_data)
        instance.save()
        return instance
