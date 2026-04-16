from rest_framework import serializers
from .models import Book, Comment, Like, Rating, SavedBook, Playlist, Notification
from django.contrib.auth import get_user_model
from django.db.models import Avg

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'followers_count', 'following_count']

    def get_followers_count(self, obj):
        return obj.followers.count()

    def get_following_count(self, obj):
        return obj.follows.count()

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'book', 'user', 'text', 'created_at']
        read_only_fields = ['book']

class RatingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Rating
        fields = ['id', 'book', 'user', 'stars', 'created_at']
        read_only_fields = ['book', 'user']

class BookSerializer(serializers.ModelSerializer):
    uploader = UserSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()
    ratings_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    user_rating = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'author', 'pdf_file', 'cover_image', 'description',
            'extracted_text', 'uploader', 'created_at',
            'likes_count', 'comments_count', 'avg_rating', 'ratings_count',
            'is_liked', 'is_saved', 'user_rating'
        ]
        read_only_fields = ['extracted_text', 'uploader']

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_avg_rating(self, obj):
        avg = obj.ratings.aggregate(avg=Avg('stars'))['avg']
        return round(avg, 1) if avg else 0

    def get_ratings_count(self, obj):
        return obj.ratings.count()

    def _get_user(self):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user
        return None

    def get_is_liked(self, obj):
        user = self._get_user()
        if user:
            return obj.likes.filter(user=user).exists()
        return False

    def get_is_saved(self, obj):
        user = self._get_user()
        if user:
            return obj.saves.filter(user=user).exists()
        return False

    def get_user_rating(self, obj):
        user = self._get_user()
        if user:
            r = obj.ratings.filter(user=user).first()
            return r.stars if r else 0
        return 0

class BookListSerializer(serializers.ModelSerializer):
    uploader = UserSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'cover_image', 'uploader', 'likes_count', 'avg_rating', 'created_at']

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_avg_rating(self, obj):
        avg = obj.ratings.aggregate(avg=Avg('stars'))['avg']
        return round(avg, 1) if avg else 0

class PlaylistSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    books = BookListSerializer(many=True, read_only=True)
    books_count = serializers.SerializerMethodField()

    class Meta:
        model = Playlist
        fields = ['id', 'name', 'owner', 'books', 'books_count', 'created_at']
        read_only_fields = ['owner']

    def get_books_count(self, obj):
        return obj.books.count()

class NotificationSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    book_title = serializers.CharField(source='book.title', read_only=True, default=None)

    class Meta:
        model = Notification
        fields = ['id', 'sender', 'notif_type', 'book', 'book_title', 'message', 'is_read', 'created_at']
