from flask import Flask
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_socketio import SocketIO
from flask_cors import CORS
from app.database import db
from config.settings import Config

bcrypt = Bcrypt()
login_manager = LoginManager()
socketio = SocketIO()

def create_app(config_class=Config):
    flask_app = Flask(__name__)
    flask_app.config.from_object(config_class)

    # Enable CORS for frontend communication
    CORS(flask_app, supports_credentials=True)

    # Initialize extensions
    db.init_app(flask_app)
    bcrypt.init_app(flask_app)
    login_manager.init_app(flask_app)
    
    # Enable CORS for socketio
    socketio.init_app(flask_app, cors_allowed_origins="*")

    login_manager.login_view = 'users.login'
    login_manager.login_message_category = 'info'

    # Import User inside load_user to avoid circular dependencies
    from app.models.user import User

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # Initialize Database Tables
    with flask_app.app_context():
        # Ensure all models are imported so db.create_all() creates them
        import app.models
        db.create_all()

    # Register blueprints
    from app.routes import register_blueprints
    register_blueprints(flask_app)

    # Register socket events
    from app.sockets import register_socket_events
    register_socket_events(socketio)

    # Health check route
    @flask_app.route("/")
    def home():
        return {
            "status": "running",
            "project": "SkillSwap Backend",
            "message": "Backend deployed successfully 🚀"
        }

    return flask_app
