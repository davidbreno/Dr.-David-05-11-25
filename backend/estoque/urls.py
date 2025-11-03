from rest_framework.routers import DefaultRouter
from . import views

app_name = "estoque"

router = DefaultRouter()
router.register(r'', views.ProdutoViewSet, basename='produto')

urlpatterns = router.urls
