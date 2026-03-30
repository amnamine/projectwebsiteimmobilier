from django.contrib import admin

from .models import Annonce, Estimation, Favori, Image, Message, User

admin.site.register(User)
admin.site.register(Annonce)
admin.site.register(Image)
admin.site.register(Favori)
admin.site.register(Message)
admin.site.register(Estimation)
