from app.models import db, User

def award_points(user_id, reason):
    user = User.query.get(user_id)
    if not user:
        return None

    points_to_add = 0
    if reason == 'session_completed':
        points_to_add = 10
    elif reason == 'feedback_submitted':
        points_to_add = 5
    elif reason == 'profile_completed':
        points_to_add = 2

    user.points += points_to_add

    # Initialize badges list if None
    if not user.badges:
        user.badges = []
    
    # Ensure badges is a mutable list
    badges_list = list(user.badges)

    # Badges logic
    if user.points >= 10 and 'Active Learner' not in badges_list:
        badges_list.append('Active Learner')
    if user.points >= 30 and 'Beginner Mentor' not in badges_list:
        badges_list.append('Beginner Mentor')
    if user.points >= 60 and 'Skill Guide' not in badges_list:
        badges_list.append('Skill Guide')
    if user.points >= 100 and 'Community Star' not in badges_list:
        badges_list.append('Community Star')

    user.badges = badges_list
    db.session.commit()
    
    return {
        'points': user.points,
        'badges': user.badges
    }
