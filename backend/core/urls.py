from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import AnnonceViewSet, EstimateAPIView, FavoriViewSet, MeAPIView, MessageViewSet, RegisterAPIView

router = DefaultRouter()
router.register(r"annonces", AnnonceViewSet, basename="annonce")
router.register(r"favoris", FavoriViewSet, basename="favori")
router.register(r"messages", MessageViewSet, basename="message")

urlpatterns = [
    path("", include(router.urls)),
    path("auth/register/", RegisterAPIView.as_view()),
    path("auth/login/", TokenObtainPairView.as_view()),
    path("auth/refresh/", TokenRefreshView.as_view()),
    path("auth/me/", MeAPIView.as_view()),
    path("estimate/", EstimateAPIView.as_view()),
]

