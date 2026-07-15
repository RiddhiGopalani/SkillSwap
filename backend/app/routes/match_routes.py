from flask import Blueprint
from app.controllers import match_controller

match_bp = Blueprint('matches', __name__)

match_bp.route('/generate/<int:user_id>', methods=['POST'])(match_controller.generate_matches)
match_bp.route('/<int:user_id>', methods=['GET'])(match_controller.get_user_matches)
match_bp.route('/<int:match_id>', methods=['PATCH'])(match_controller.update_match_status)
