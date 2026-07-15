from flask import Blueprint, render_template, redirect, url_for, request, jsonify, flash
from flask_login import login_user, logout_user, current_user, login_required
from app.models import db, User, SkillTeach, SkillLearn, Availability, Match, Timetable, Message
from app import bcrypt
from app.services.matching import generate_matches
from app.services.timetable import generate_timetable
from app.services.rewards import award_points

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('landing.html')

@main.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password') or 'password123'
        user = User.query.filter_by(email=email).first()
        if user and bcrypt.check_password_hash(user.passwordHash, password):
            login_user(user, remember=True)
            return redirect(url_for('main.dashboard'))
        else:
            flash('Invalid credentials. If you are new, please use the Profile page to register.', 'danger')
            
    return render_template('login.html')

@main.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('main.index'))

@main.route('/profile')
def profile():
    # Renders the onboarding / edit profile wizard
    return render_template('profile.html')

@main.route('/api/profile/load', methods=['GET'])
def api_profile_load():
    if not current_user.is_authenticated:
        return jsonify({'authenticated': False})
        
    teaches = SkillTeach.query.filter_by(user_id=current_user.id).all()
    learns = SkillLearn.query.filter_by(user_id=current_user.id).all()
    avails = Availability.query.filter_by(user_id=current_user.id).all()

    return jsonify({
        'authenticated': True,
        'name': current_user.name,
        'email': current_user.email,
        'teaches': [{'topic': t.topic, 'level': t.level} for t in teaches],
        'learns': [{'topic': l.topic, 'level': 'Beginner', 'urgency': l.urgency} for l in learns],
        'avails': [{'day': a.day, 'startTime': a.time_slot.split('-')[0] if '-' in a.time_slot else a.time_slot, 'endTime': a.time_slot.split('-')[1] if '-' in a.time_slot else ''} for a in avails]
    })

@main.route('/api/profile/save', methods=['POST'])
def api_profile_save():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    year = data.get('year', '1st Year')
    teaches = data.get('teaches', [])
    learns = data.get('learns', [])
    days = data.get('days', [])
    slots = data.get('slots', [])
    
    # 1. Create or load user
    user = None
    if current_user.is_authenticated:
        user = current_user
        user.name = name
        user.email = email
    else:
        user = User.query.filter_by(email=email).first()
        if not user:
            pw_hash = bcrypt.generate_password_hash('password123').decode('utf-8')
            user = User(name=name, email=email, passwordHash=pw_hash)
            db.session.add(user)
            db.session.commit()
        login_user(user, remember=True)

    # 2. Update skills to teach (Diffing)
    existing_teaches = SkillTeach.query.filter_by(user_id=user.id).all()
    existing_teach_topics = [t.topic for t in existing_teaches]
    new_teach_topics = [t['topic'] for t in teaches]

    # Add or update
    for t in teaches:
        existing_t = next((et for et in existing_teaches if et.topic == t['topic']), None)
        if not existing_t:
            new_t = SkillTeach(user_id=user.id, topic=t['topic'], level=t['level'])
            db.session.add(new_t)
        else:
            existing_t.level = t['level']
            
    # Delete removed
    for et in existing_teaches:
        if et.topic not in new_teach_topics:
            db.session.delete(et)

    # 3. Update skills to learn (Diffing)
    existing_learns = SkillLearn.query.filter_by(user_id=user.id).all()
    existing_learn_topics = [l.topic for l in existing_learns]
    new_learn_topics = [l['topic'] for l in learns]

    # Add or update
    for l in learns:
        existing_l = next((el for el in existing_learns if el.topic == l['topic']), None)
        if not existing_l:
            new_l = SkillLearn(user_id=user.id, topic=l['topic'], urgency=l.get('urgency', 'Moderate'))
            db.session.add(new_l)
        else:
            existing_l.urgency = l.get('urgency', 'Moderate')

    # Delete removed
    for el in existing_learns:
        if el.topic not in new_learn_topics:
            db.session.delete(el)

    # 4. Update availability (Diffing)
    existing_avails = Availability.query.filter_by(user_id=user.id).all()
    existing_avail_strings = [f"{a.day}_{a.time_slot}" for a in existing_avails]

    new_avail_strings = []
    for d in days:
        for s in slots:
            # extract times inside parentheses: e.g. "Morning (7-10)" -> "7-10"
            import re
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

    return jsonify({'success': True, 'userId': user.id})


@main.route('/matches')
@login_required
def matches():
    # Generate matches if none exist
    existing_matches = Match.query.filter((Match.user1_id == current_user.id) | (Match.user2_id == current_user.id)).all()
    if not existing_matches:
        generate_matches(current_user.id)
        
    return render_template('matches.html')


@main.route('/api/matches', methods=['GET'])
@login_required
def api_matches():
    matches_query = Match.query.filter(
        ((Match.user1_id == current_user.id) | (Match.user2_id == current_user.id)) & (Match.status != 'rejected')
    ).all()
    
    formatted_matches = []
    for m in matches_query:
        partner = m.user2 if m.user1_id == current_user.id else m.user1
        
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
            'matchId': m.id,
            'id': partner.id,
            'name': partner.name,
            'avatar': partner.avatar or partner.name[0].upper(),
            'color': partner.color or "#60a5fa",
            'score': m.score,
            'label': label,
            'status': m.status,
            'teaches': [{'topic': t.topic, 'level': t.level} for t in partner_teaches],
            'learns': [{'topic': l.topic, 'level': 'Beginner', 'urgency': l.urgency} for l in partner_learns],
            'days': list(set([a.day for a in partner_avails])),
            'slots': list(set([a.time_slot for a in partner_avails])),
            'mode': 'Online',
            'bio': partner.bio or "Matched based on skills and availability!"
        })

    # Sort descending by score
    formatted_matches.sort(key=lambda x: x['score'], reverse=True)
    return jsonify({'success': True, 'matches': formatted_matches})


@main.route('/api/matches/status/<int:match_id>', methods=['POST'])
@login_required
def api_matches_status(match_id):
    data = request.get_json()
    status = data.get('status')
    if status not in ['pending', 'accepted', 'rejected']:
        return jsonify({'error': 'Invalid status'}), 400
        
    match = Match.query.get_or_404(match_id)
    if match.user1_id != current_user.id and match.user2_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
        
    match.status = status
    db.session.commit()
    return jsonify({'success': True, 'matchId': match_id, 'status': status})


@main.route('/timetable')
@login_required
def timetable():
    match_id = request.args.get('match_id')
    if not match_id:
        # Get first active/accepted match as default
        active_match = Match.query.filter(
            ((Match.user1_id == current_user.id) | (Match.user2_id == current_user.id)) & (Match.status == 'accepted')
        ).first()
        if active_match:
            return redirect(url_for('main.timetable', match_id=active_match.id))
        else:
            # Render empty state
            return render_template('timetable.html', match=None)
            
    match = Match.query.get_or_404(match_id)
    partner = match.user2 if match.user1_id == current_user.id else match.user1
    
    # Try fetching partner skills so they can choose from them during manual editing
    partner_teaches = SkillTeach.query.filter_by(user_id=partner.id).all()
    partner_learns = SkillLearn.query.filter_by(user_id=partner.id).all()
    all_topics = list(set([t.topic for t in partner_teaches] + [l.topic for l in partner_learns] + ["General Study"]))

    match_info = {
        'matchId': match.id,
        'id': partner.id,
        'name': partner.name,
        'avatar': partner.avatar or partner.name[0].upper(),
        'color': partner.color or "#60a5fa",
        'all_topics': all_topics,
        'status': match.status
    }
    
    return render_template('timetable.html', match=match_info)


@main.route('/api/timetable/<int:match_id>', methods=['GET'])
@login_required
def api_get_timetable(match_id):
    sessions = Timetable.query.filter_by(match_id=match_id).all()
    if not sessions:
        return jsonify({'error': 'Not found'}), 404
        
    return jsonify({
        'sessions': [{
            'id': str(s.id),
            'day': s.day,
            'time': s.time,
            'duration': s.duration,
            'topic': s.topic,
            'role': s.role
        } for s in sessions]
    })


@main.route('/api/timetable/generate/<int:match_id>', methods=['POST'])
@login_required
def api_generate_timetable(match_id):
    sessions = generate_timetable(match_id)
    return jsonify({
        'sessions': [{
            'id': str(idx),
            'day': s['day'],
            'time': s['time'],
            'duration': '1 hour',
            'topic': s['topic'],
            'role': s['role']
        } for idx, s in enumerate(sessions)]
    })


@main.route('/api/timetable/<int:match_id>', methods=['PATCH'])
@login_required
def api_update_timetable(match_id):
    data = request.get_json()
    sessions = data.get('sessions', [])
    
    # Clear and re-insert
    Timetable.query.filter_by(match_id=match_id).delete()
    
    for idx, s in enumerate(sessions):
        t_slot = Timetable(
            match_id=match_id,
            day=s['day'],
            time=s['time'],
            duration=s.get('duration', '1 hour'),
            topic=s['topic'],
            role=s.get('role', 'teach')
        )
        db.session.add(t_slot)
        
    db.session.commit()
    return jsonify({'success': True})


@main.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')


@main.route('/api/dashboard/data', methods=['GET'])
@login_required
def api_dashboard_data():
    # 1. Fetch points and badges
    rewards = {
        'points': current_user.points or 0,
        'badges': current_user.badges or []
    }

    # 2. Sidebar connections (accepted matches)
    matches_query = Match.query.filter(
        ((Match.user1_id == current_user.id) | (Match.user2_id == current_user.id)) & (Match.status == 'accepted')
    ).all()
    
    connections = []
    for m in matches_query:
        partner = m.user2 if m.user1_id == current_user.id else m.user1
        connections.append({
            'matchId': m.id,
            'id': partner.id,
            'name': partner.name,
            'avatar': partner.avatar or partner.name[0].upper(),
            'color': partner.color or "#60a5fa"
        })

    # 3. Timetable sessions
    sessions_query = db.session.query(
        Timetable, Match, User
    ).join(
        Match, Timetable.match_id == Match.id
    ).join(
        User, db.or_(
            db.and_(Match.user1_id == User.id, Match.user2_id == current_user.id),
            db.and_(Match.user2_id == User.id, Match.user1_id == current_user.id)
        )
    ).filter(
        (Match.user1_id == current_user.id) | (Match.user2_id == current_user.id)
    ).all()

    sessions = []
    for s, m, u in sessions_query:
        sessions.append({
            'id': s.id,
            'day': s.day,
            'time': s.time,
            'duration': s.duration,
            'topic': s.topic,
            'role': s.role,
            'partnerName': u.name,
            'partnerAvatar': u.avatar or u.name[0].upper(),
            'partnerColor': u.color or "#60a5fa"
        })

    return jsonify({
        'rewards': rewards,
        'connections': connections,
        'sessions': sessions
    })


@main.route('/api/rewards/award', methods=['POST'])
@login_required
def api_award_rewards():
    data = request.get_json()
    reason = data.get('reason')
    if not reason:
        return jsonify({'error': 'Reason is required'}), 400
        
    result = award_points(current_user.id, reason)
    return jsonify({
        'success': True,
        'points': result['points'],
        'badges': result['badges']
    })


@main.route('/api/messages/<int:match_id>', methods=['GET'])
@login_required
def api_get_messages(match_id):
    messages_query = Message.query.filter_by(match_id=match_id).order_by(Message.timestamp.asc()).limit(50).all()
    return jsonify({
        'success': True,
        'messages': [{
            'id': m.id,
            'matchId': m.match_id,
            'senderId': m.sender_id,
            'receiverId': m.receiver_id,
            'content': m.content,
            'timestamp': m.timestamp.isoformat() if m.timestamp else None
        } for m in messages_query]
    })
