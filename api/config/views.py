from django.http import JsonResponse
from django.db import connection

def health_check(request):
    """R1: Valida que el backend y la BD respondan con status 200 y {"status": "OK"}."""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        return JsonResponse({"status": "OK"})
    except Exception as exc:
        return JsonResponse({"status": "ERROR", "detail": str(exc)}, status=503)
