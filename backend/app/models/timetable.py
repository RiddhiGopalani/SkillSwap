from app.database import db

class Timetable(db.Model):
    __tablename__ = 'Timetable'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    match_id = db.Column(db.Integer, db.ForeignKey('Matches.id', ondelete='CASCADE'), nullable=False)
    day = db.Column(db.String(50), nullable=False)
    time = db.Column(db.String(100), nullable=False)
    duration = db.Column(db.String(50), default='1 hour')
    topic = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False)
