from rest_framework.routers import DefaultRouter
from . import views

app_name = "financeiro"

router = DefaultRouter()
router.register(r'', views.LancamentoViewSet, basename='lancamento')

urlpatterns = router.urls
