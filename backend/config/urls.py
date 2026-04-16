from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.routers import DefaultRouter
from books.views import BookViewSet, PlaylistViewSet, NotificationViewSet, UserProfileViewSet
from users.views import RegisterView, MeView
from audio.views import generate_tts
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'books', BookViewSet)
router.register(r'playlists', PlaylistViewSet, basename='playlist')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'profiles', UserProfileViewSet, basename='profile')

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth
    path('api/auth/register/', RegisterView.as_view(), name='auth_register'),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/me/', MeView.as_view(), name='auth_me'),

    # All REST APIs
    path('api/', include(router.urls)),

    # Audio TTS (must come before router to avoid conflict)
    path('api/books/<int:book_id>/tts/', generate_tts, name='generate_tts'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
