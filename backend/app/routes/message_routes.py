from flask import Blueprint
from app.controllers import message_controller

message_bp = Blueprint('messages', __name__)

message_bp.route('/<int:match_id>', methods=['GET'])(message_controller.get_messages)
