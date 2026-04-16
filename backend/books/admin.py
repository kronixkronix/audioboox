from django.contrib import admin
from .models import Book, Comment, Like, Rating, SavedBook, Playlist, Notification

admin.site.register(Book)
admin.site.register(Comment)
admin.site.register(Like)
admin.site.register(Rating)
admin.site.register(SavedBook)
admin.site.register(Playlist)
admin.site.register(Notification)
