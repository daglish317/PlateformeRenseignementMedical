from core.events import handlers
from core.events.registry import EventTypes
from core.events.dispatcher import EventDispatcher


def register_all_events():

    EventDispatcher.register(EventTypes.STRUCTURE_CREATED, handlers.handle_structure_created)
    EventDispatcher.register(EventTypes.STRUCTURE_VALIDATED, handlers.handle_structure_validated)
    EventDispatcher.register(EventTypes.STRUCTURE_REJECTED, handlers.handle_structure_rejected)
    EventDispatcher.register(EventTypes.OTP_GENERATED, handlers.handle_otp_generated)
    EventDispatcher.register(EventTypes.USER_INVITED, handlers.handle_user_invited)
    EventDispatcher.register(EventTypes.FEEDBACK_CREATED, handlers.handle_feedback_created)
    EventDispatcher.register(EventTypes.MESSAGE_SENT, handlers.handle_message_sent)
