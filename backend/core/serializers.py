from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Annonce, Estimation, Favori, Image, Message


User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "telephone", "role"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "telephone", "role", "date_inscription"]


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ["id", "annonce", "url", "ordre"]
        read_only_fields = ["id"]


class AnnonceSerializer(serializers.ModelSerializer):
    user = UserPublicSerializer(read_only=True)
    images = ImageSerializer(many=True, read_only=True)

    class Meta:
        model = Annonce
        fields = [
            "id",
            "user",
            "titre",
            "description",
            "type_bien",
            "transaction",
            "prix",
            "superficie",
            "nb_pieces",
            "wilaya",
            "adresse",
            "statut",
            "date_publication",
            "images",
        ]
        read_only_fields = ["id", "user", "date_publication"]


class AnnonceCreateSerializer(serializers.ModelSerializer):
    images = serializers.ListField(
        child=serializers.URLField(),
        required=False,
        allow_empty=True,
        write_only=True,
        help_text="List of image URLs",
    )

    class Meta:
        model = Annonce
        fields = [
            "id",
            "titre",
            "description",
            "type_bien",
            "transaction",
            "prix",
            "superficie",
            "nb_pieces",
            "wilaya",
            "adresse",
            "statut",
            "images",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        image_urls = validated_data.pop("images", [])
        annonce = Annonce.objects.create(user=self.context["request"].user, **validated_data)
        for idx, url in enumerate(image_urls):
            Image.objects.create(annonce=annonce, url=url, ordre=idx)
        return annonce


class FavoriSerializer(serializers.ModelSerializer):
    annonce = AnnonceSerializer(read_only=True)
    annonce_id = serializers.PrimaryKeyRelatedField(
        source="annonce", queryset=Annonce.objects.all(), write_only=True
    )

    class Meta:
        model = Favori
        fields = ["id", "annonce", "annonce_id", "date_ajout"]
        read_only_fields = ["id", "date_ajout", "annonce"]


class MessageSerializer(serializers.ModelSerializer):
    expediteur = UserPublicSerializer(read_only=True)
    destinataire = UserPublicSerializer(read_only=True)
    destinataire_id = serializers.PrimaryKeyRelatedField(
        source="destinataire", queryset=User.objects.all(), write_only=True
    )
    annonce_id = serializers.PrimaryKeyRelatedField(source="annonce", queryset=Annonce.objects.all(), write_only=True)

    class Meta:
        model = Message
        fields = [
            "id",
            "expediteur",
            "destinataire",
            "destinataire_id",
            "annonce",
            "annonce_id",
            "contenu",
            "date_envoi",
            "lu",
        ]
        read_only_fields = ["id", "date_envoi", "lu", "annonce", "expediteur", "destinataire"]

    def create(self, validated_data):
        return Message.objects.create(expediteur=self.context["request"].user, **validated_data)


class EstimationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estimation
        fields = [
            "id",
            "wilaya",
            "superficie",
            "nb_pieces",
            "type_bien",
            "etage",
            "age_bien",
            "prix_estime",
            "date",
        ]
        read_only_fields = ["id", "prix_estime", "date"]

