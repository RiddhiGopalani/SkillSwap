from app.database import db

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

    # User relations
    user1 = db.relationship('User', foreign_keys=[user1_id])
    user2 = db.relationship('User', foreign_keys=[user2_id])


class Feedback(db.Model):
    __tablename__ = 'Feedback'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    match_id = db.Column(db.Integer, db.ForeignKey('Matches.id', ondelete='CASCADE'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)
