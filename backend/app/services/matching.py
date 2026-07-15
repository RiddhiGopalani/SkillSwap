from app.database import db
from app.models import User, SkillTeach, SkillLearn, Availability, Match

def generate_matches(user_id):
    current_user = User.query.get(user_id)
    if not current_user:
        return 0

    # 1. Fetch current user's skills and availability
    my_teaches = SkillTeach.query.filter_by(user_id=user_id).all()
    my_learns = SkillLearn.query.filter_by(user_id=user_id).all()
    my_avails = Availability.query.filter_by(user_id=user_id).all()

    my_teach_names = [s.topic for s in my_teaches]
    my_learn_names = [s.topic for s in my_learns]

    # Fetch other users
    other_users = User.query.filter(User.id != user_id).all()
    new_matches_count = 0

    for other in other_users:
        their_teaches = SkillTeach.query.filter_by(user_id=other.id).all()
        their_learns = SkillLearn.query.filter_by(user_id=other.id).all()
        their_avails = Availability.query.filter_by(user_id=other.id).all()

        their_teach_names = [s.topic for s in their_teaches]
        their_learn_names = [s.topic for s in their_learns]

        # 2. Check Overlap & Calculate Base Score
        overlap_teach = [my_t for my_t in my_teaches if my_t.topic in their_learn_names]
        overlap_learn = [my_l for my_l in my_learns if my_l.topic in their_teach_names]
        shared_skills = list(set([t.topic for t in overlap_teach] + [l.topic for l in overlap_learn]))

        if not shared_skills:
            continue

        score = 20  # Base score for at least one shared skill

        # Points for Teach overlap (I teach, they learn)
        for my_t in overlap_teach:
            their_l = next((l for l in their_learns if l.topic == my_t.topic), None)
            if their_l:
                score += 10
                if my_t.level == 'Advanced' and their_l.urgency == 'Urgent':
                    score += 15
                elif my_t.level == 'Advanced' or their_l.urgency == 'Urgent':
                    score += 10
                elif my_t.level == 'Intermediate':
                    score += 5

        # Points for Learn overlap (They teach, I learn)
        for my_l in overlap_learn:
            their_t = next((t for t in their_teaches if t.topic == my_l.topic), None)
            if their_t:
                score += 10
                if their_t.level == 'Advanced' and my_l.urgency == 'Urgent':
                    score += 15
                elif their_t.level == 'Advanced' or my_l.urgency == 'Urgent':
                    score += 10
                elif their_t.level == 'Intermediate':
                    score += 5

        # 3. Check Availability Overlap
        has_avail_overlap = False
        avail_points = 0
        for my_a in my_avails:
            for their_a in their_avails:
                if my_a.day == their_a.day and my_a.time_slot == their_a.time_slot:
                    has_avail_overlap = True
                    avail_points += 10

        if not has_avail_overlap:
            continue

        score += avail_points

        # Cap at 98
        if score > 98:
            score = 98

        # 4. Check if match already exists
        existing = Match.query.filter(
            ((Match.user1_id == user_id) & (Match.user2_id == other.id)) |
            ((Match.user1_id == other.id) & (Match.user2_id == user_id))
        ).first()

        if not existing:
            new_match = Match(user1_id=user_id, user2_id=other.id, score=score, status='pending')
            db.session.add(new_match)
            new_matches_count += 1

    db.session.commit()
    return new_matches_count
