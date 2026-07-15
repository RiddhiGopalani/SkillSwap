from app.database import db
from flask_login import UserMixin

class User(db.Model, UserMixin):
    __tablename__ = 'Users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True, index=True)
    passwordHash = db.Column(db.String(255), nullable=False)
    points = db.Column(db.Integer, default=0)
    bio = db.Column(db.Text)
    badges = db.Column(db.JSON, default=list)
    avatar = db.Column(db.String(10), default='S')
    color = db.Column(db.String(20), default='#60a5fa')

    # Relationships
    skills_teach = db.relationship('SkillTeach', backref='user', cascade='all, delete-orphan', lazy=True)
    skills_learn = db.relationship('SkillLearn', backref='user', cascade='all, delete-orphan', lazy=True)
    availability = db.relationship('Availability', backref='user', cascade='all, delete-orphan', lazy=True)

    def get_id(self):
        return str(self.id)
