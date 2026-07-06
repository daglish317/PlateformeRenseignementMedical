import logging

logger = logging.getLogger("core.events")


class EventDispatcher:

    _handlers = {}

    @classmethod
    def register(cls, event_name, handler):
        if event_name not in cls._handlers:
            cls._handlers[event_name] = []
        cls._handlers[event_name].append(handler)

    @classmethod
    def dispatch(cls, event_name, payload=None):
        logger.info("Dispatch event: %s", event_name)
        handlers = cls._handlers.get(event_name, [])
        for handler in handlers:
            handler(payload or {})
