import os

# Load .env file manually if exists
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                k, v = line.strip().split('=', 1)
                os.environ[k] = v

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'skillswap-secret-key-12345'
    
    # Database config
    db_host = os.environ.get('DB_HOST') or 'localhost'
    db_user = os.environ.get('DB_USER') or 'root'
    db_pass = os.environ.get('DB_PASSWORD') or 'root123'
    db_name = os.environ.get('DB_NAME') or 'skillswap'
    
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL") or \
    f"mysql+pymysql://{db_user}:{db_pass}@{db_host}:4000/{db_name}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
