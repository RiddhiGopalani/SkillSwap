from app.database import db

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
