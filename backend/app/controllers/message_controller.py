from flask import jsonify
from app.models import Message

def get_messages(match_id):
    try:
        messages = Message.query.filter_by(match_id=match_id).order_by(Message.timestamp.asc()).limit(50).all()
        
        formatted = []
        for m in messages:
            formatted.append({
                "id": m.id,
                "matchId": m.match_id,
                "senderId": m.sender_id,
                "receiverId": m.receiver_id,
                "content": m.content,
                "timestamp": m.timestamp.isoformat() if m.timestamp else None
            })
            
        return jsonify({"success": True, "messages": formatted}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
