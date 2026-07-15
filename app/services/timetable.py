from app.models import db, Match, Availability, Timetable

def generate_timetable(match_id):
    match = Match.query.get(match_id)
    if not match:
        return None

    # Fetch availabilities
    user1_avails = Availability.query.filter_by(user_id=match.user1_id).all()
    user2_avails = Availability.query.filter_by(user_id=match.user2_id).all()

    sessions = []
    session_count = 0

    for a in user1_avails:
        for b in user2_avails:
            if a.day == b.day and a.time_slot == b.time_slot and session_count < 2:
                sessions.append({
                    'day': a.day,
                    'time': a.time_slot,
                    'topic': 'Shared Session',
                    'role': 'learn'
                })
                session_count += 1
                break

    if not sessions:
        sessions.append({
            'day': 'Weekend',
            'time': 'Flexible',
            'topic': 'Catch up',
            'role': 'learn'
        })

    # Clear existing timetable
    Timetable.query.filter_by(match_id=match_id).delete()

    # Save new sessions
    for s in sessions:
        t_slot = Timetable(
            match_id=match_id,
            day=s['day'],
            time=s['time'],
            duration='1 hour',
            topic=s['topic'],
            role=s['role']
        )
        db.session.add(t_slot)

    db.session.commit()
    return sessions
