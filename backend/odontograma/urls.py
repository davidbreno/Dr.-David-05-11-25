from rest_framework.routers import DefaultRouter
from . import views

app_name = "odontograma"

router = DefaultRouter()
router.register(r'', views.OdontogramaViewSet, basename='odontograma')

urlpatterns = router.urls
