from django.db import models
from django.conf import settings
from django.utils.text import slugify

class Category(models.Model):
    name = models.CharField(unique=True, max_length=50)
    slug = models.SlugField(unique=True)
    

    class Meta:
        verbose_name_plural = "Categories"


    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    


class Product(models.Model):
    owner = models.ForeignKey(
    settings.AUTH_USER_MODEL,
    related_name='products',
    on_delete=models.CASCADE,
    null=True, blank=True)
    category = models.ForeignKey(Category, related_name='products', on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True,blank=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


    @property
    def in_stock(self):
        return self.stock > 0
    
    def save(self, *args, **kwargs):
       if not self.slug:
           self.slug = f"{slugify(self.name)}-{self.category.slug}"
       super().save(*args, **kwargs)