from flask import jsonify, request
from app.database import db
from app.models import SkillTeach, SkillLearn, Availability

def add_skill():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        skill_name = data.get('skillName')
        type_ = data.get('type')
        level = data.get('level')

        if type_ == 'teach':
            skill = SkillTeach(user_id=user_id, topic=skill_name, level=level)
            db.session.add(skill)
            db.session.commit()
            return jsonify({"id": skill.id, "userId": user_id, "skillName": skill_name, "type": type_, "level": level}), 201
        else:
            skill = SkillLearn(user_id=user_id, topic=skill_name, urgency=level)
            db.session.add(skill)
            db.session.commit()
            return jsonify({"id": skill.id, "userId": user_id, "skillName": skill_name, "type": type_, "level": level}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def get_user_skills(user_id):
    try:
        teaches = SkillTeach.query.filter_by(user_id=user_id).all()
        learns = SkillLearn.query.filter_by(user_id=user_id).all()

        skills = []
        for t in teaches:
            skills.append({
                "id": t.id,
                "userId": t.user_id,
                "skillName": t.topic,
                "type": "teach",
                "level": t.level
            })
        for l in learns:
            skills.append({
                "id": l.id,
                "userId": l.user_id,
                "skillName": l.topic,
                "type": "learn",
                "level": l.urgency
            })

        return jsonify(skills), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def update_skill(skill_id):
    try:
        data = request.get_json()
        level = data.get('level')

        # Try updating Skills_Teach first
        teach_skill = SkillTeach.query.get(skill_id)
        if teach_skill:
            teach_skill.level = level
            db.session.commit()
            return jsonify({"message": "Updated"}), 200

        # If not found, try updating Skills_Learn
        learn_skill = SkillLearn.query.get(skill_id)
        if learn_skill:
            learn_skill.urgency = level
            db.session.commit()
            return jsonify({"message": "Updated"}), 200

        return jsonify({"error": "Skill not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def delete_skill(skill_id):
    try:
        teach_skill = SkillTeach.query.get(skill_id)
        if teach_skill:
            db.session.delete(teach_skill)
            db.session.commit()
            return jsonify({"message": "Skill deleted"}), 200

        learn_skill = SkillLearn.query.get(skill_id)
        if learn_skill:
            db.session.delete(learn_skill)
            db.session.commit()
            return jsonify({"message": "Skill deleted"}), 200

        return jsonify({"error": "Skill not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def add_availability():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        day = data.get('day')
        start_time = data.get('startTime')
        end_time = data.get('endTime')
        time_slot = f"{start_time}-{end_time}"

        avail = Availability(user_id=user_id, day=day, time_slot=time_slot)
        db.session.add(avail)
        db.session.commit()

        return jsonify({"id": avail.id, "userId": user_id, "day": day, "startTime": start_time, "endTime": end_time}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def get_user_availability(user_id):
    try:
        avails = Availability.query.filter_by(user_id=user_id).all()
        formatted = []
        for a in avails:
            start_time, end_time = (a.time_slot or "-").split("-") if "-" in (a.time_slot or "") else (a.time_slot, "")
            formatted.append({
                "id": a.id,
                "userId": a.user_id,
                "day": a.day,
                "startTime": start_time,
                "endTime": end_time
            })
        return jsonify(formatted), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def update_availability(availability_id):
    try:
        data = request.get_json()
        day = data.get('day')
        start_time = data.get('startTime')
        end_time = data.get('endTime')
        time_slot = f"{start_time}-{end_time}"

        avail = Availability.query.get(availability_id)
        if not avail:
            return jsonify({"error": "Availability not found"}), 404

        avail.day = day
        avail.time_slot = time_slot
        db.session.commit()

        return jsonify({"message": "Updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def delete_availability(availability_id):
    try:
        avail = Availability.query.get(availability_id)
        if not avail:
            return jsonify({"error": "Availability not found"}), 404

        db.session.delete(avail)
        db.session.commit()

        return jsonify({"message": "Availability deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
