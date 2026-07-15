from flask import Blueprint
from app.controllers import skill_controller

skill_bp = Blueprint('skills', __name__)

skill_bp.route('', methods=['POST'])(skill_controller.add_skill)
skill_bp.route('/<int:user_id>', methods=['GET'])(skill_controller.get_user_skills)
skill_bp.route('/<int:skill_id>', methods=['PUT'])(skill_controller.update_skill)
skill_bp.route('/<int:skill_id>', methods=['DELETE'])(skill_controller.delete_skill)

availability_bp = Blueprint('availability', __name__)

availability_bp.route('', methods=['POST'])(skill_controller.add_availability)
availability_bp.route('/<int:user_id>', methods=['GET'])(skill_controller.get_user_availability)
availability_bp.route('/<int:availability_id>', methods=['PUT'])(skill_controller.update_availability)
availability_bp.route('/<int:availability_id>', methods=['DELETE'])(skill_controller.delete_availability)
