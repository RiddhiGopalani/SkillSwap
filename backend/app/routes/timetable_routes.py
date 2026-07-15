from flask import Blueprint
from app.controllers import timetable_controller

timetable_bp = Blueprint('timetable', __name__)

timetable_bp.route('/generate/<int:match_id>', methods=['POST'])(timetable_controller.generate_timetable)
timetable_bp.route('/<int:match_id>', methods=['GET'])(timetable_controller.get_timetable)
timetable_bp.route('/<int:match_id>', methods=['PATCH'])(timetable_controller.update_timetable)
timetable_bp.route('/user/<int:user_id>', methods=['GET'])(timetable_controller.get_user_timetable)
