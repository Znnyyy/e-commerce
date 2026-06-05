from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.URLField(max_length=1000, null=True, blank=True)
    points = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username}'s profile"


@receiver(post_save, sender=User)
def ensure_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
    elif not hasattr(instance, 'profile'):
        UserProfile.objects.create(user=instance)
    else:
        instance.profile.save()
