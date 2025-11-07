from rest_framework import serializers
from .models import (
    Paciente,
    Anamnese,
    Documento,
    Prescricao,
    ConviteContato,
    ConviteImportacao,
    ConviteMensagem,
)

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


class ConviteContatoSerializer(serializers.ModelSerializer):
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = ConviteContato
        fields = [
            "id",
            "nome",
            "cpf",
            "telefone",
            "data_nascimento",
            "idade",
            "origem",
            "status",
            "status_label",
            "ultima_mensagem_em",
            "criado_em",
            "atualizado_em",
        ]
        read_only_fields = [
            "id",
            "status_label",
            "ultima_mensagem_em",
            "criado_em",
            "atualizado_em",
        ]


class ConviteImportacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConviteImportacao
        fields = [
            "id",
            "arquivo_nome",
            "origem",
            "total_linhas",
            "importados",
            "atualizados",
            "ignorados",
            "erros",
            "log",
            "criado_em",
        ]
        read_only_fields = fields


class ConviteMensagemSerializer(serializers.ModelSerializer):
    contato_nome = serializers.CharField(source="contato.nome", read_only=True)

    class Meta:
        model = ConviteMensagem
        fields = [
            "id",
            "contato",
            "contato_nome",
            "conteudo",
            "status",
            "erro",
            "criado_em",
        ]
        read_only_fields = ["id", "contato", "contato_nome", "status", "erro", "criado_em"]


class ConviteEnvioSerializer(serializers.Serializer):
    contatos = serializers.ListField(
        child=serializers.IntegerField(min_value=1), allow_empty=False, write_only=True
    )
    mensagem = serializers.CharField(allow_blank=False)

    def validate_contatos(self, value):
        if len(set(value)) != len(value):
            raise serializers.ValidationError("Remova contatos duplicados da seleção.")
        return value
