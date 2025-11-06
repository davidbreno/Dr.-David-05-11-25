from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = "orcamentos"

router = DefaultRouter()
router.register(r'', views.OrcamentoViewSet, basename='orcamento')

urlpatterns = [
	# Rotas REST do ViewSet
	path('', include(router.urls)),
	# Endpoint RAW (Django) para PDF direto (sem Browsable API)
	path('<int:pk>/pdf/raw/', views.orcamento_pdf_raw, name='orcamento-pdf-raw'),
]
