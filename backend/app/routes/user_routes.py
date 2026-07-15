from flask import Blueprint
from app.controllers import user_controller

user_bp = Blueprint('users', __name__)

user_bp.route('/register', methods=['POST'])(user_controller.register)
user_bp.route('/login', methods=['POST'])(user_controller.login)
user_bp.route('/<int:user_id>', methods=['GET'])(user_controller.get_profile)
user_bp.route('/<int:user_id>/profile', methods=['PUT'])(user_controller.update_profile)
