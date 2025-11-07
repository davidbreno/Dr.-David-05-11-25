from rest_framework.routers import DefaultRouter

from . import views

app_name = "financeiro"

router = DefaultRouter()
router.register(r'lancamentos', views.LancamentoViewSet, basename='lancamento')
router.register(r'debitos', views.DebitoViewSet, basename='debito')

urlpatterns = router.urls
