from flask import jsonify, request
from app.database import db
from app.models import Match, Timetable, User
from app.services.timetable import generate_timetable as generate_timetable_service

def generate_timetable(match_id):
    try:
        sessions = generate_timetable_service(match_id)
        if sessions is None:
            return jsonify({"error": "Match not found"}), 404

        formatted = []
        for idx, s in enumerate(sessions):
            formatted.append({
                "id": str(idx),
                "day": s['day'],
                "time": s['time'],
                "duration": "1 hour",
                "topic": s['topic'],
                "role": s['role']
            })
        return jsonify({"sessions": formatted}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def get_timetable(match_id):
    try:
        sessions = Timetable.query.filter_by(match_id=match_id).all()
        if not sessions:
            return jsonify({"error": "Timetable not found"}), 404

        formatted = []
        for s in sessions:
            formatted.append({
                "id": str(s.id),
                "day": s.day,
                "time": s.time,
                "duration": s.duration,
                "topic": s.topic,
                "role": s.role
            })
        return jsonify({"sessions": formatted}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def update_timetable(match_id):
    try:
        data = request.get_json()
        sessions_data = data.get('sessions', [])

        if not isinstance(sessions_data, list):
            return jsonify({"error": "Invalid sessions payload"}), 400

        # Clear existing
        Timetable.query.filter_by(match_id=match_id).delete()

        # Re-insert
        inserted = []
        for s in sessions_data:
            t_slot = Timetable(
                match_id=match_id,
                day=s['day'],
                time=s['time'],
                duration=s.get('duration', '1 hour'),
                topic=s['topic'],
                role=s.get('role', 'teach')
            )
            db.session.add(t_slot)
            inserted.append(t_slot)

        db.session.commit()

        # Format return
        formatted = []
        for idx, s in enumerate(inserted):
            formatted.append({
                "id": str(s.id or idx),
                "day": s.day,
                "time": s.time,
                "duration": s.duration,
                "topic": s.topic,
                "role": s.role
            })

        return jsonify({"sessions": formatted}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


def get_user_timetable(user_id):
    try:
        # Fetch timetable for matches user is involved in
        sessions = db.session.query(
            Timetable, Match, User
        ).join(
            Match, Timetable.match_id == Match.id
        ).join(
            User, db.or_(
                db.and_(Match.user1_id == User.id, Match.user2_id == user_id),
                db.and_(Match.user2_id == User.id, Match.user1_id == user_id)
            )
        ).filter(
            ((Match.user1_id == user_id) | (Match.user2_id == user_id))
        ).all()

        formatted = []
        for s, m, u in sessions:
            formatted.append({
                "id": s.id,
                "match_id": s.match_id,
                "day": s.day,
                "time": s.time,
                "duration": s.duration,
                "topic": s.topic,
                "role": s.role,
                "partnerId": u.id,
                "partnerName": u.name,
                "partnerAvatar": u.avatar or u.name[0].upper(),
                "partnerColor": u.color or "#60a5fa"
            })

        return jsonify({"sessions": formatted}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
