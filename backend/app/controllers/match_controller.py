from flask import jsonify, request
from app.database import db
from app.models import Match, User, SkillTeach, SkillLearn, Availability
from app.services.matching import generate_matches as generate_matches_service

def generate_matches(user_id):
    try:
        count = generate_matches_service(user_id)
        return jsonify({"success": True, "generatedCount": count}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def get_user_matches(user_id):
    try:
        matches = Match.query.filter(
            ((Match.user1_id == user_id) | (Match.user2_id == user_id)) & (Match.status != 'rejected')
        ).all()

        formatted_matches = []
        for m in matches:
            partner = m.user2 if m.user1_id == int(user_id) else m.user1
            if not partner:
                continue

            partner_teaches = SkillTeach.query.filter_by(user_id=partner.id).all()
            partner_learns = SkillLearn.query.filter_by(user_id=partner.id).all()
            partner_avails = Availability.query.filter_by(user_id=partner.id).all()

            label = "Casual Match"
            if m.score >= 90:
                label = "Excellent Match"
            elif m.score >= 75:
                label = "Strong Match"
            elif m.score >= 50:
                label = "Good Match"

            formatted_matches.append({
                "matchId": m.id,
                "id": partner.id,
                "name": partner.name,
                "avatar": partner.avatar or partner.name[0].upper(),
                "color": partner.color or "#60a5fa",
                "score": m.score,
                "label": label,
                "status": m.status,
                "teaches": [{"topic": t.topic, "level": t.level} for t in partner_teaches],
                "learns": [{"topic": l.topic, "level": "Beginner", "urgency": l.urgency} for l in partner_learns],
                "days": list(set([a.day for a in partner_avails])),
                "slots": list(set([a.time_slot for a in partner_avails])),
                "mode": "Online",
                "bio": partner.bio or "Matched based on skills and availability!"
            })

        # Sort descending by score
        formatted_matches.sort(key=lambda x: x['score'], reverse=True)
        return jsonify({"success": True, "matches": formatted_matches}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def update_match_status(match_id):
    try:
        data = request.get_json()
        status = data.get('status')

        if status not in ['pending', 'accepted', 'rejected']:
            return jsonify({"error": "Invalid status"}), 400

        match = Match.query.get(match_id)
        if not match:
            return jsonify({"error": "Match not found"}), 404

        match.status = status
        db.session.commit()

        return jsonify({"id": match_id, "status": status}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
