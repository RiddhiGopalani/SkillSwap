from flask import jsonify, request
from app.models import User
from app.services.rewards import award_points

def get_rewards(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        badges = user.badges or []
        if isinstance(badges, str):
            import json
            badges = json.loads(badges)

        return jsonify({
            "points": user.points or 0,
            "badges": badges
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def award_rewards():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        reason = data.get('reason')

        if not user_id or not reason:
            return jsonify({"error": "Missing parameters"}), 400

        result = award_points(user_id, reason)
        if not result:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "success": True,
            "points": result['points'],
            "badges": result['badges']
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
