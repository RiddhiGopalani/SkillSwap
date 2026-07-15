import sys
import os

# Add current folder to sys.path so that 'app' module can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app, socketio

app = create_app()

if __name__ == '__main__':
    # Flask-SocketIO runs on port 5000 by default
    socketio.run(app, debug=True, port=5000)
