from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models


class Role(models.TextChoices):
    VISITEUR = "visiteur", "Visiteur"
    PROPRIETAIRE = "proprietaire", "Propriétaire"
    ACHETEUR = "acheteur", "Acheteur"
    ADMIN = "admin", "Admin"


class TypeBien(models.TextChoices):
    APPARTEMENT = "appartement", "Appartement"
    VILLA = "villa", "Villa"
    STUDIO = "studio", "Studio"
    DUPLEX = "duplex", "Duplex"
    MAISON = "maison", "Maison"
    TERRAIN = "terrain", "Terrain"
    GARAGE = "garage", "Garage"
    LOCAL = "local", "Local"


class Transaction(models.TextChoices):
    VENTE = "vente", "Vente"
    LOCATION = "location", "Location"


class StatutAnnonce(models.TextChoices):
    ACTIVE = "active", "Active"
    ARCHIVEE = "archivee", "Archivée"
    VENDUE = "vendue", "Vendue"
    LOUEE = "louee", "Louée"
    SUSPENDUE = "suspendue", "Suspendue"


class User(AbstractUser):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=32, choices=Role.choices, default=Role.VISITEUR)
    telephone = models.CharField(max_length=20, blank=True, default="")
    date_inscription = models.DateTimeField(auto_now_add=True)

    REQUIRED_FIELDS = ["email"]

    def __str__(self) -> str:
        return f"{self.username} ({self.role})"


class Annonce(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="annonces")
    titre = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    type_bien = models.CharField(max_length=32, choices=TypeBien.choices)
    transaction = models.CharField(max_length=16, choices=Transaction.choices)
    prix = models.DecimalField(max_digits=15, decimal_places=2)
    superficie = models.FloatField()
    nb_pieces = models.IntegerField()
    wilaya = models.CharField(max_length=50)
    adresse = models.TextField()
    statut = models.CharField(max_length=16, choices=StatutAnnonce.choices, default=StatutAnnonce.ACTIVE)
    date_publication = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.titre


class Image(models.Model):
    annonce = models.ForeignKey(Annonce, on_delete=models.CASCADE, related_name="images")
    url = models.URLField(max_length=255)
    ordre = models.IntegerField(default=0)

    class Meta:
        ordering = ["ordre", "id"]


class Favori(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="favoris")
    annonce = models.ForeignKey(Annonce, on_delete=models.CASCADE, related_name="favoris")
    date_ajout = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("user", "annonce")]


class Message(models.Model):
    expediteur = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="messages_envoyes"
    )
    destinataire = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="messages_recus"
    )
    annonce = models.ForeignKey(Annonce, on_delete=models.CASCADE, related_name="messages")
    contenu = models.TextField()
    date_envoi = models.DateTimeField(auto_now_add=True)
    lu = models.BooleanField(default=False)


class Estimation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="estimations")
    wilaya = models.CharField(max_length=50)
    superficie = models.FloatField()
    nb_pieces = models.IntegerField()
    type_bien = models.CharField(max_length=32, choices=TypeBien.choices)
    etage = models.IntegerField(default=0)
    age_bien = models.IntegerField(default=0)
    prix_estime = models.DecimalField(max_digits=15, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)


class MLModelMeta(models.Model):
    model_path = models.CharField(max_length=255)
    version = models.CharField(max_length=64, default="v1")
    accuracy = models.FloatField(default=0.0)
    date_train = models.DateTimeField(auto_now_add=True)

