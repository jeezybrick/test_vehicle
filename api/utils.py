from rest_framework import permissions


# return true if method is safe
def is_safe_method(request):
    if request.method in permissions.SAFE_METHODS:
        return True
