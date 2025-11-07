from rest_framework import serializers
from .models import Paciente, Anamnese, Documento, Prescricao

class PacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente
        fields = "__all__"


class AnamneseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Anamnese
        fields = [
            "id",
            "paciente",
            "queixa_principal",
            "antecedentes_medicos",
            "alergias",
            "medicamentos",
            "possui_diabetes",
            "possui_hipertensao",
            "cardiopatia",
            "asma",
            "hemorragias",
            "anestesia_reacao",
            "fuma",
            "gravida",
            "pressao_sistolica",
            "pressao_diastolica",
            "batimentos",
            "outros",
            "criado_em",
            "atualizado_em",
        ]
        read_only_fields = ["id", "criado_em", "atualizado_em"]


class DocumentoSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Documento
        fields = [
            "id",
            "paciente",
            "arquivo",
            "nome",
            "content_type",
            "tamanho",
            "url",
            "criado_em",
        ]
        read_only_fields = ["id", "nome", "content_type", "tamanho", "url", "criado_em"]

    def get_url(self, obj):  # pragma: no cover
        try:
            request = self.context.get("request")
            if request is not None and obj.arquivo:
                return request.build_absolute_uri(obj.arquivo.url)
            return obj.arquivo.url if obj.arquivo else None
        except Exception:
            return None

    def create(self, validated_data):
        doc = Documento(**validated_data)
        f = validated_data.get("arquivo")
        if f is not None:
            doc.nome = getattr(f, "name", doc.nome)
            doc.content_type = getattr(f, "content_type", "")
            try:
                size = getattr(f, "size", None)
                if size is None and hasattr(f, "seek") and hasattr(f, "tell"):
                    pos = f.tell(); f.seek(0, 2); size = f.tell(); f.seek(pos)
                doc.tamanho = size or 0
            except Exception:
                doc.tamanho = 0
        doc.save()
        return doc


class PrescricaoItemSerializer(serializers.Serializer):
    classe_nome = serializers.CharField(required=False, allow_blank=True)
    nome = serializers.CharField()
    dose = serializers.CharField(allow_blank=True, required=False)
    frequencia = serializers.CharField(allow_blank=True, required=False)
    duracao = serializers.CharField(allow_blank=True, required=False)
    orientacoes = serializers.CharField(allow_blank=True, required=False)


class PrescricaoSerializer(serializers.ModelSerializer):
    itens = PrescricaoItemSerializer(many=True)

    class Meta:
        model = Prescricao
        fields = [
            "id",
            "paciente",
            "profissional",
            "cro",
            "observacoes",
            "itens",
            "criado_em",
            "atualizado_em",
        ]
        read_only_fields = ["id", "criado_em", "atualizado_em"]

    def validate_itens(self, value):
        if not value:
            raise serializers.ValidationError("Inclua ao menos um item na prescrição.")
        return value

    def create(self, validated_data):
        itens = validated_data.pop("itens", [])
        instance = Prescricao.objects.create(**validated_data, itens=itens)
        return instance

    def update(self, instance, validated_data):
        itens = validated_data.pop("itens", None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        if itens is not None:
            instance.itens = itens
        instance.save()
        return instance
