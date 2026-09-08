from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    phone_number=models.CharField(null=True,blank=True, max_length=20)
    address = models.TextField(blank=True, null=True)
    is_seller = models.BooleanField(default=False, blank=False)
    def __str__(self):
        return self.username