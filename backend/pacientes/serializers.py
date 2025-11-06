from rest_framework import serializers
from .models import Paciente, Anamnese

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
