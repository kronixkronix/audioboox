from django.db import models
from django.conf import settings

class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    pdf_file = models.FileField(upload_to='books/pdfs/')
    cover_image = models.ImageField(upload_to='books/covers/', null=True, blank=True)
    description = models.TextField(blank=True)
    extracted_text = models.JSONField(blank=True, null=True, help_text="Structured JSON text extracted from PDF for TTS")
    uploader = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='uploaded_books')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Comment(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Comment by {self.user.username} on {self.book.title}"

class Like(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('book', 'user')

    def __str__(self):
        return f"{self.user.username} likes {self.book.title}"

class Rating(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ratings')
    stars = models.PositiveSmallIntegerField(default=1)  # 1-5
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('book', 'user')

    def __str__(self):
        return f"{self.user.username} rated {self.book.title} {self.stars}★"

class SavedBook(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='saves')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_books')
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('book', 'user')
        ordering = ['-saved_at']

    def __str__(self):
        return f"{self.user.username} saved {self.book.title}"

class Playlist(models.Model):
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='playlists')
    books = models.ManyToManyField(Book, related_name='playlists', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} by {self.owner.username}"

class Notification(models.Model):
    NOTIF_TYPES = [
        ('book_uploaded', 'New Book Uploaded'),
        ('new_comment', 'New Comment'),
        ('new_like', 'New Like'),
        ('new_follower', 'New Follower'),
    ]
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_notifications', null=True, blank=True)
    notif_type = models.CharField(max_length=30, choices=NOTIF_TYPES)
    book = models.ForeignKey(Book, on_delete=models.CASCADE, null=True, blank=True)
    message = models.CharField(max_length=500, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notif for {self.recipient.username}: {self.notif_type}"
