from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.http import HttpResponse, JsonResponse
from books.models import Book
import os
import subprocess
import uuid

@api_view(['POST'])
@permission_classes([AllowAny])
def generate_tts(request, book_id):
    try:
        book = Book.objects.get(pk=book_id)
    except Book.DoesNotExist:
        return JsonResponse({'error': 'Book not found'}, status=404)

    blocks = book.extracted_text
    if not blocks or not isinstance(blocks, list):
        return JsonResponse({'error': 'No text extracted for this book'}, status=400)

    # Get paragraph index from payload (default to 0 for fallback)
    index = request.data.get('index', 0)
    try:
        index = int(index)
    except ValueError:
        return JsonResponse({'error': 'Invalid index'}, status=400)

    if index < 0 or index >= len(blocks):
        return JsonResponse({'error': 'Index out of bounds'}, status=400)

    input_text = blocks[index].get("text", "")
    if not input_text:
         return JsonResponse({'error': 'Empty paragraph'}, status=400)

    # Use Voice parameter, default to AriaNeural
    voice = request.data.get('voice', 'en-US-AriaNeural')
    
    # Run Edge-TTS via CLI safely
    temp_filename = f"/tmp/{uuid.uuid4()}.mp3"
    try:
        subprocess.run([
            "edge-tts",
            "--voice", voice,
            "--text", input_text,
            "--write-media", temp_filename
        ], check=True, capture_output=True)
        
        with open(temp_filename, 'rb') as f:
            audio_data = f.read()
        
        os.remove(temp_filename)
        
        http_response = HttpResponse(audio_data, content_type='audio/mpeg')
        http_response['Content-Disposition'] = f'attachment; filename="chunk_{index}.mp3"'
        return http_response
    except subprocess.CalledProcessError as e:
        return JsonResponse({'error': 'TTS Engine failure', 'details': e.stderr.decode()}, status=500)
    except Exception as e:
        return JsonResponse({'error': f'Exception occurred: {str(e)}'}, status=500)
