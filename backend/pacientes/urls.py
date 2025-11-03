from rest_framework.routers import DefaultRouter
from . import views

app_name = "pacientes"

router = DefaultRouter()
router.register(r'', views.PacienteViewSet, basename='paciente')

urlpatterns = router.urls
