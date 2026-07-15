import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'skillswap-secret-key-12345'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'mysql+pymysql://root:root123@localhost/skillswap'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
