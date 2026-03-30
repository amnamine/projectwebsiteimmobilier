from __future__ import annotations

from decimal import Decimal
from pathlib import Path

import joblib
import numpy as np
from django.contrib.auth import get_user_model
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from .models import Annonce, Estimation, Favori, Message
from .permissions import IsOwnerOrReadOnly
from .serializers import (
    AnnonceCreateSerializer,
    AnnonceSerializer,
    EstimationSerializer,
    FavoriSerializer,
    MessageSerializer,
    RegisterSerializer,
    UserPublicSerializer,
)


User = get_user_model()


class RegisterAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserPublicSerializer(user).data, status=status.HTTP_201_CREATED)


class MeAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserPublicSerializer(request.user).data)


class AnnonceViewSet(viewsets.ModelViewSet):
    queryset = Annonce.objects.all().select_related("user").prefetch_related("images")
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return AnnonceCreateSerializer
        return AnnonceSerializer

    def perform_create(self, serializer):
        serializer.save()

    def get_queryset(self):
        qs = super().get_queryset()
        # simple filters: wilaya, type_bien, transaction, prix_min, prix_max
        params = self.request.query_params
        wilaya = params.get("wilaya")
        type_bien = params.get("type_bien")
        transaction = params.get("transaction")
        prix_min = params.get("prix_min")
        prix_max = params.get("prix_max")
        if wilaya:
            qs = qs.filter(wilaya__icontains=wilaya)
        if type_bien:
            qs = qs.filter(type_bien=type_bien)
        if transaction:
            qs = qs.filter(transaction=transaction)
        if prix_min:
            qs = qs.filter(prix__gte=prix_min)
        if prix_max:
            qs = qs.filter(prix__lte=prix_max)
        return qs.order_by("-date_publication")

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def mine(self, request):
        qs = self.get_queryset().filter(user=request.user)
        return Response(AnnonceSerializer(qs, many=True).data)


class FavoriViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favori.objects.filter(user=self.request.user).select_related("annonce", "annonce__user").prefetch_related(
            "annonce__images"
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return (
            Message.objects.filter(expediteur=user) | Message.objects.filter(destinataire=user)
        ).select_related("expediteur", "destinataire", "annonce")

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        msg = self.get_object()
        if msg.destinataire_id != request.user.id:
            return Response({"detail": "Forbidden"}, status=403)
        msg.lu = True
        msg.save(update_fields=["lu"])
        return Response({"ok": True})


def _model_path(base_dir: Path) -> Path:
    return base_dir / "ml" / "model.joblib"


def _ensure_model_dir(p: Path) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)


def _train_model_from_annonces() -> Pipeline | None:
    qs = Annonce.objects.all().only("superficie", "nb_pieces", "wilaya", "type_bien", "prix")
    rows = list(qs.values("superficie", "nb_pieces", "wilaya", "type_bien", "prix"))
    if len(rows) < 5:
        return None
    X = rows
    y = np.array([float(r["prix"]) for r in rows], dtype=float)

    numeric_features = ["superficie", "nb_pieces"]
    categorical_features = ["wilaya", "type_bien"]
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", "passthrough", numeric_features),
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features),
        ]
    )
    model = LinearRegression()
    clf = Pipeline(steps=[("preprocess", preprocessor), ("model", model)])
    clf.fit(X, y)
    return clf


class EstimateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # inputs per UML: wilaya, superficie, nb_pieces, type_bien, etage, age
        data = request.data or {}
        required = ["wilaya", "superficie", "nb_pieces", "type_bien"]
        missing = [k for k in required if k not in data]
        if missing:
            return Response({"detail": f"Missing: {', '.join(missing)}"}, status=400)

        wilaya = str(data["wilaya"])
        superficie = float(data["superficie"])
        nb_pieces = int(data["nb_pieces"])
        type_bien = str(data["type_bien"])
        etage = int(data.get("etage", 0))
        age_bien = int(data.get("age", data.get("age_bien", 0)))

        base_dir = Path(__file__).resolve().parent.parent
        mp = _model_path(base_dir)
        _ensure_model_dir(mp)

        model = None
        if mp.exists():
            try:
                model = joblib.load(mp)
            except Exception:
                model = None

        if model is None:
            model = _train_model_from_annonces()
            if model is not None:
                joblib.dump(model, mp)

        # fallback heuristic if not enough data to train
        if model is None:
            base = 2500000.0
            price = base + (superficie * 35000.0) + (nb_pieces * 200000.0) + (etage * 25000.0) - (age_bien * 15000.0)
        else:
            X = [
                {
                    "superficie": superficie,
                    "nb_pieces": nb_pieces,
                    "wilaya": wilaya,
                    "type_bien": type_bien,
                }
            ]
            price = float(model.predict(X)[0])

        price = max(price, 0.0)
        est = Estimation.objects.create(
            user=request.user,
            wilaya=wilaya,
            superficie=superficie,
            nb_pieces=nb_pieces,
            type_bien=type_bien,
            etage=etage,
            age_bien=age_bien,
            prix_estime=Decimal(f"{price:.2f}"),
        )

        return Response(
            {
                "id": est.id,
                "prix": float(est.prix_estime),
                "fourchette": {"min": float(est.prix_estime) * 0.9, "max": float(est.prix_estime) * 1.1},
                "facteurs": {
                    "superficie": superficie,
                    "nb_pieces": nb_pieces,
                    "wilaya": wilaya,
                    "type_bien": type_bien,
                    "etage": etage,
                    "age_bien": age_bien,
                },
            }
        )
