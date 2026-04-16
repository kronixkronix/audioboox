import fitz  # PyMuPDF
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from .models import Book, Comment, Like, Rating, SavedBook, Playlist, Notification
from .serializers import (
    BookSerializer, BookListSerializer, CommentSerializer, RatingSerializer,
    PlaylistSerializer, NotificationSerializer
)

class IsUploaderOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.uploader == request.user

def _notify_followers(sender, notif_type, book, message):
    """Send notification to all followers of sender."""
    for follower in sender.followers.all():
        Notification.objects.create(
            recipient=follower,
            sender=sender,
            notif_type=notif_type,
            book=book,
            message=message
        )

def _notify_user(recipient, sender, notif_type, book, message):
    """Send notification to a specific user."""
    if recipient != sender:
        Notification.objects.create(
            recipient=recipient,
            sender=sender,
            notif_type=notif_type,
            book=book,
            message=message
        )

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all().order_by('-created_at')
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'author', 'description']

    def get_serializer_class(self):
        if self.action == 'list':
            return BookListSerializer
        return BookSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsUploaderOrReadOnly()]
        return [permissions.AllowAny()]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        book = serializer.save(uploader=self.request.user)
        if book.pdf_file:
            try:
                doc = fitz.open(book.pdf_file.path)
                blocks_data = []
                for page in doc[:50]:
                    blocks = page.get_text("blocks")
                    for b in blocks:
                        if b[6] == 0:
                            text = b[4].strip()
                            text = " ".join(text.splitlines())
                            if text and len(text) > 3:
                                blocks_data.append({"text": text})
                book.extracted_text = blocks_data
                book.save()
            except Exception as e:
                print("Error extracting text:", e)
        # Notify followers of uploader
        _notify_followers(
            sender=self.request.user,
            notif_type='book_uploaded',
            book=book,
            message=f"{self.request.user.username} uploaded a new book: {book.title}"
        )

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        book = self.get_object()
        like, created = Like.objects.get_or_create(book=book, user=request.user)
        if not created:
            like.delete()
            return Response({'status': 'unliked', 'likes_count': book.likes.count(), 'is_liked': False})
        # Notify book uploader
        _notify_user(
            recipient=book.uploader, sender=request.user,
            notif_type='new_like', book=book,
            message=f"{request.user.username} liked your book: {book.title}"
        )
        return Response({'status': 'liked', 'likes_count': book.likes.count(), 'is_liked': True})

    @action(detail=True, methods=['post', 'get'], permission_classes=[permissions.IsAuthenticatedOrReadOnly])
    def comment(self, request, pk=None):
        book = self.get_object()
        if request.method == 'GET':
            comments = book.comments.all()
            serializer = CommentSerializer(comments, many=True)
            return Response(serializer.data)
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, book=book)
            # Notify book uploader
            _notify_user(
                recipient=book.uploader, sender=request.user,
                notif_type='new_comment', book=book,
                message=f"{request.user.username} commented on your book: {book.title}"
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def rate(self, request, pk=None):
        book = self.get_object()
        stars = int(request.data.get('stars', 0))
        if not 1 <= stars <= 5:
            return Response({'error': 'Stars must be between 1 and 5'}, status=status.HTTP_400_BAD_REQUEST)
        rating, created = Rating.objects.update_or_create(
            book=book, user=request.user,
            defaults={'stars': stars}
        )
        from django.db.models import Avg
        avg = book.ratings.aggregate(avg=Avg('stars'))['avg']
        return Response({
            'status': 'rated',
            'stars': rating.stars,
            'avg_rating': round(avg, 1) if avg else 0,
            'ratings_count': book.ratings.count()
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def save_book(self, request, pk=None):
        book = self.get_object()
        saved, created = SavedBook.objects.get_or_create(book=book, user=request.user)
        if not created:
            saved.delete()
            return Response({'status': 'unsaved', 'is_saved': False})
        return Response({'status': 'saved', 'is_saved': True})

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def share(self, request, pk=None):
        book = self.get_object()
        return Response({'share_url': f"/book/{book.id}", 'title': book.title})


class PlaylistViewSet(viewsets.ModelViewSet):
    serializer_class = PlaylistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Playlist.objects.filter(owner=self.request.user).prefetch_related('books')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'])
    def add_book(self, request, pk=None):
        playlist = self.get_object()
        book_id = request.data.get('book_id')
        try:
            book = Book.objects.get(pk=book_id)
            playlist.books.add(book)
            return Response({'status': 'added', 'books_count': playlist.books.count()})
        except Book.DoesNotExist:
            return Response({'error': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def remove_book(self, request, pk=None):
        playlist = self.get_object()
        book_id = request.data.get('book_id')
        try:
            book = Book.objects.get(pk=book_id)
            playlist.books.remove(book)
            return Response({'status': 'removed', 'books_count': playlist.books.count()})
        except Book.DoesNotExist:
            return Response({'error': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'all marked read'})

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save()
        return Response({'status': 'read'})

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = Notification.objects.filter(recipient=request.user, is_read=False).count()
        return Response({'unread_count': count})


from django.contrib.auth import get_user_model

class UserProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = get_user_model().objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def retrieve(self, request, pk=None):
        User = get_user_model()
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        from .serializers import UserSerializer, BookListSerializer
        data = UserSerializer(user, context={'request': request}).data
        data['uploaded_books'] = BookListSerializer(
            user.uploaded_books.all()[:10], many=True, context={'request': request}
        ).data
        data['is_following'] = request.user.is_authenticated and request.user.follows.filter(pk=user.pk).exists()
        return Response(data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def follow(self, request, pk=None):
        User = get_user_model()
        try:
            target = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        if target == request.user:
            return Response({'error': 'Cannot follow yourself'}, status=status.HTTP_400_BAD_REQUEST)

        if request.user.follows.filter(pk=target.pk).exists():
            request.user.follows.remove(target)
            return Response({'status': 'unfollowed', 'is_following': False})
        else:
            request.user.follows.add(target)
            _notify_user(
                recipient=target, sender=request.user,
                notif_type='new_follower', book=None,
                message=f"{request.user.username} started following you"
            )
            return Response({'status': 'following', 'is_following': True})

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def saved_books(self, request):
        from .serializers import BookListSerializer
        saved = SavedBook.objects.filter(user=request.user).select_related('book')
        books = [s.book for s in saved]
        return Response(BookListSerializer(books, many=True, context={'request': request}).data)

    @action(detail=True, methods=['get'])
    def activity(self, request, pk=None):
        """Recent comments and likes by the user"""
        User = get_user_model()
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)
        from .serializers import CommentSerializer
        recent_comments = CommentSerializer(
            user.comments.all()[:10], many=True
        ).data
        return Response({'recent_comments': recent_comments})
