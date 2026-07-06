import os
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

import messagerie.websocket.routing as chat_routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "renseignementmedical.settings")

django_asgi_app = get_asgi_application()

import notifications.routing as notification_routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": URLRouter(
        chat_routing.websocket_urlpatterns
        + notification_routing.websocket_urlpatterns
    ),
})