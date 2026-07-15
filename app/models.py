from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
import json

db = SQLAlchemy()

class User(db.Model, UserMixin):
    __tablename__ = 'Users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True, index=True)
    passwordHash = db.Column(db.String(255), nullable=False)
    points = db.Column(db.Integer, default=0)
    bio = db.Column(db.Text)
    badges = db.Column(db.JSON, default=list) # MySQL JSON column type
    avatar = db.Column(db.String(10), default='S')
    color = db.Column(db.String(20), default='#60a5fa')

    # Relationships
    skills_teach = db.relationship('SkillTeach', backref='user', cascade='all, delete-orphan', lazy=True)
    skills_learn = db.relationship('SkillLearn', backref='user', cascade='all, delete-orphan', lazy=True)
    availability = db.relationship('Availability', backref='user', cascade='all, delete-orphan', lazy=True)

    def get_id(self):
        return str(self.id)


class SkillTeach(db.Model):
    __tablename__ = 'Skills_Teach'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.id', ondelete='CASCADE'), nullable=False)
    topic = db.Column(db.String(255), nullable=False)
    level = db.Column(db.String(50), nullable=False)


class SkillLearn(db.Model):
    __tablename__ = 'Skills_Learn'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.id', ondelete='CASCADE'), nullable=False)
    topic = db.Column(db.String(255), nullable=False)
    urgency = db.Column(db.String(50), nullable=False)


class Availability(db.Model):
    __tablename__ = 'Availability'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.id', ondelete='CASCADE'), nullable=False)
    day = db.Column(db.String(50), nullable=False)
    time_slot = db.Column(db.String(100), nullable=False)
    mode = db.Column(db.String(50), default='Online')


class Match(db.Model):
    __tablename__ = 'Matches'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user1_id = db.Column(db.Integer, db.ForeignKey('Users.id', ondelete='CASCADE'), nullable=False)
    user2_id = db.Column(db.Integer, db.ForeignKey('Users.id', ondelete='CASCADE'), nullable=False)
    score = db.Column(db.Integer, default=0)
    status = db.Column(db.String(50), default='active')

    # Relationships
    timetable = db.relationship('Timetable', backref='match', cascade='all, delete-orphan', lazy=True)
    messages = db.relationship('Message', backref='match', cascade='all, delete-orphan', lazy=True)
    feedbacks = db.relationship('Feedback', backref='match', cascade='all, delete-orphan', lazy=True)

    # User relationships
    user1 = db.relationship('User', foreign_keys=[user1_id])
    user2 = db.relationship('User', foreign_keys=[user2_id])


class Timetable(db.Model):
    __tablename__ = 'Timetable'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    match_id = db.Column(db.Integer, db.ForeignKey('Matches.id', ondelete='CASCADE'), nullable=False)
    day = db.Column(db.String(50), nullable=False)
    time = db.Column(db.String(100), nullable=False)
    duration = db.Column(db.String(50), default='1 hour')
    topic = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False) # 'learn' or 'teach'


class Message(db.Model):
    __tablename__ = 'Messages'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    match_id = db.Column(db.Integer, db.ForeignKey('Matches.id', ondelete='CASCADE'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('Users.id', ondelete='CASCADE'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('Users.id', ondelete='CASCADE'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())


class Feedback(db.Model):
    __tablename__ = 'Feedback'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    match_id = db.Column(db.Integer, db.ForeignKey('Matches.id', ondelete='CASCADE'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)
