from flask import Blueprint
from app.controllers import reward_controller

reward_bp = Blueprint('rewards', __name__)

reward_bp.route('/<int:user_id>', methods=['GET'])(reward_controller.get_rewards)
reward_bp.route('/award', methods=['POST'])(reward_controller.award_rewards)
