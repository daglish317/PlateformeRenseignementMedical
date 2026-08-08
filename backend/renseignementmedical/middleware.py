from django.urls import resolve
from django.urls.exceptions import Resolver404


class AppendSlashNoRedirectMiddleware:
    """Résout en interne les URLs sans slash final (équivalent APPEND_SLASH)
    sans redirection HTTP.

    Le proxy Next.js supprime le slash final des URLs /api/... avant de
    les transmettre à Django. La redirection APPEND_SLASH (301) vers la
    version avec slash provoquait alors une boucle de redirections.
    Ce middleware applique le slash au chemin interne (request.path_info)
    uniquement lorsque la version avec slash résout en une vue.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path_info
        if path != "/" and not path.endswith("/"):
            urlconf = getattr(request, "urlconf", None)
            try:
                resolve(path, urlconf)
            except Resolver404:
                try:
                    resolve(path + "/", urlconf)
                except Resolver404:
                    pass
                else:
                    request.path_info = path + "/"
        return self.get_response(request)
