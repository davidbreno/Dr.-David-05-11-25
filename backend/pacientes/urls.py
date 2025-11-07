from rest_framework.routers import DefaultRouter
from . import views

app_name = "pacientes"

router = DefaultRouter()
# IMPORTANTE: registre 'anamneses' ANTES de '' para evitar que o detalhe de Paciente
# capture a URL '/anamneses/' como se fosse um pk.
router.register(r'documentos', views.DocumentoViewSet, basename='documento')
router.register(r'anamneses', views.AnamneseViewSet, basename='anamnese')
router.register(r'prescricoes', views.PrescricaoViewSet, basename='prescricao')
router.register(r'', views.PacienteViewSet, basename='paciente')

urlpatterns = router.urls
