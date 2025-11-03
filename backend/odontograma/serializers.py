from rest_framework import serializers
from .models import Odontograma

class OdontogramaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Odontograma
        fields = "__all__"
