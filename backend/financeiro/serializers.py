from decimal import Decimal

from rest_framework import serializers

from .models import Debito, DebitoDocumento, DebitoItem, Lancamento

class LancamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lancamento
        fields = "__all__"


class DebitoItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = DebitoItem
        fields = ("id", "procedimento", "dentes_regiao", "valor")


class DebitoDocumentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DebitoDocumento
        fields = ("id", "arquivo", "nome", "criado_em")


class DebitoSerializer(serializers.ModelSerializer):
    itens = DebitoItemSerializer(many=True)
    documentos = DebitoDocumentoSerializer(many=True, read_only=True)

    class Meta:
        model = Debito
        fields = (
            "id",
            "paciente",
            "plano",
            "data_vencimento",
            "dentista",
            "observacao",
            "status",
            "valor_total",
            "itens",
            "documentos",
            "criado_em",
            "atualizado_em",
        )
        extra_kwargs = {"valor_total": {"read_only": True}}

    def create(self, validated_data):
        itens_data = validated_data.pop("itens", [])
        debito = Debito.objects.create(**validated_data)
        total = Decimal("0")
        for item in itens_data:
            DebitoItem.objects.create(debito=debito, **item)
            total += Decimal(str(item.get("valor", 0) or 0))
        debito.valor_total = total
        debito.save(update_fields=["valor_total"])
        return debito

    def update(self, instance, validated_data):
        itens_data = validated_data.pop("itens", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if itens_data is not None:
            instance.itens.all().delete()
            total = Decimal("0")
            for item in itens_data:
                DebitoItem.objects.create(debito=instance, **item)
                total += Decimal(str(item.get("valor", 0) or 0))
            instance.valor_total = total
            instance.save(update_fields=["valor_total"])

        return instance
