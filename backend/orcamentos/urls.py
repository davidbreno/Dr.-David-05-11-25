from rest_framework.routers import DefaultRouter
from . import views

app_name = "orcamentos"

router = DefaultRouter()
router.register(r'', views.OrcamentoViewSet, basename='orcamento')

urlpatterns = router.urls
