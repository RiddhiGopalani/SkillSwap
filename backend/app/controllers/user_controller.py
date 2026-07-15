from flask import jsonify, request
from flask_login import login_user, current_user
from app.database import db
from app.models import User, SkillTeach, SkillLearn, Availability
from app.services.matching import generate_matches
from app.services.rewards import award_points
from flask_bcrypt import Bcrypt
import re

bcrypt = Bcrypt()

def register():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password') or 'password123'

        if not name or not email:
            return jsonify({"error": "Name and email are required"}), 400

        existing = User.query.filter_by(email=email).first()
        if existing:
            return jsonify({"error": "User already exists"}), 400

        pw_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        user = User(name=name, email=email, passwordHash=pw_hash)
        db.session.add(user)
        db.session.commit()

        return jsonify({"id": user.id, "name": name, "email": email, "points": 0}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password') or 'password123'

        if not email:
            return jsonify({"error": "Email is required"}), 400

        user = User.query.filter_by(email=email).first()
        if not user or not bcrypt.check_password_hash(user.passwordHash, password):
            return jsonify({"error": "Invalid credentials"}), 400

        login_user(user, remember=True)
        
        # Serialize user object
        badges = user.badges or []
        if isinstance(badges, str):
            import json
            badges = json.loads(badges)

        return jsonify({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "points": user.points,
            "bio": user.bio,
            "badges": badges,
            "avatar": user.avatar,
            "color": user.color
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def get_profile(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        badges = user.badges or []
        if isinstance(badges, str):
            import json
            badges = json.loads(badges)

        return jsonify({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "points": user.points,
            "bio": user.bio,
            "badges": badges,
            "avatar": user.avatar,
            "color": user.color
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def update_profile(user_id):
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        teaches = data.get('teaches', [])
        learns = data.get('learns', [])
        days = data.get('days', [])
        slots = data.get('slots', [])

        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # 1. Update basic info
        user.name = name
        user.email = email

        # 2. Update Teaches (Diffing)
        existing_teaches = SkillTeach.query.filter_by(user_id=user.id).all()
        existing_teach_topics = [t.topic for t in existing_teaches]
        new_teach_topics = [t['topic'] for t in teaches]

        for t in teaches:
            existing_t = next((et for et in existing_teaches if et.topic == t['topic']), None)
            if not existing_t:
                new_t = SkillTeach(user_id=user.id, topic=t['topic'], level=t['level'])
                db.session.add(new_t)
            else:
                existing_t.level = t['level']
        for et in existing_teaches:
            if et.topic not in new_teach_topics:
                db.session.delete(et)

        # 3. Update Learns (Diffing)
        existing_learns = SkillLearn.query.filter_by(user_id=user.id).all()
        existing_learn_topics = [l.topic for l in existing_learns]
        new_learn_topics = [l['topic'] for l in learns]

        for l in learns:
            existing_l = next((el for el in existing_learns if el.topic == l['topic']), None)
            if not existing_l:
                new_l = SkillLearn(user_id=user.id, topic=l['topic'], urgency=l.get('urgency', 'Moderate'))
                db.session.add(new_l)
            else:
                existing_l.urgency = l.get('urgency', 'Moderate')
        for el in existing_learns:
            if el.topic not in new_learn_topics:
                db.session.delete(el)

        # 4. Update Availability (Diffing)
        existing_avails = Availability.query.filter_by(user_id=user.id).all()
        existing_avail_strings = [f"{a.day}_{a.time_slot}" for a in existing_avails]

        new_avail_strings = []
        for d in days:
            for s in slots:
                times = re.search(r'\((.*?)\)', s)
                if times:
                    time_range = times.group(1)
                    new_avail_strings.append(f"{d}_{time_range}")

        # Add missing
        for av in new_avail_strings:
            if av not in existing_avail_strings:
                day, time_slot = av.split('_')
                new_a = Availability(user_id=user.id, day=day, time_slot=time_slot)
                db.session.add(new_a)
        # Delete removed
        for ea in existing_avails:
            if f"{ea.day}_{ea.time_slot}" not in new_avail_strings:
                db.session.delete(ea)

        db.session.commit()

        # Award points for profile completion
        award_points(user.id, 'profile_completed')

        # Trigger matchmaking
        generate_matches(user.id)

        return jsonify({"success": True, "message": "Profile updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
