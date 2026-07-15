from app.routes.user_routes import user_bp
from app.routes.skill_routes import skill_bp, availability_bp
from app.routes.match_routes import match_bp
from app.routes.timetable_routes import timetable_bp
from app.routes.reward_routes import reward_bp
from app.routes.message_routes import message_bp

def register_blueprints(app):
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(skill_bp, url_prefix='/api/skills')
    app.register_blueprint(availability_bp, url_prefix='/api/availability')
    app.register_blueprint(match_bp, url_prefix='/api/matches')
    app.register_blueprint(timetable_bp, url_prefix='/api/timetable')
    app.register_blueprint(reward_bp, url_prefix='/api/rewards')
    app.register_blueprint(message_bp, url_prefix='/api/messages')
