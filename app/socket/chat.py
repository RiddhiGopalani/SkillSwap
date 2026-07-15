from flask import request
from flask_socketio import emit, join_room
from app.models import db, Message, User
from datetime import datetime

def register_socket_events(socketio):
    @socketio.on('connect')
    def handle_connect():
        print(f"[SOCKET] User connected: {request.sid}")

    @socketio.on('disconnect')
    def handle_disconnect():
        print(f"[SOCKET] User disconnected: {request.sid}")

    @socketio.on('join_room')
    def handle_join_room(match_id):
        room_name = f"match-{match_id}"
        join_room(room_name)
        print(f"[SOCKET] User joined room: {room_name}")

    @socketio.on('send_message')
    def handle_send_message(data):
        # data format: { senderId, receiverId, matchId, content }
        try:
            match_id = int(data['matchId'])
            sender_id = int(data['senderId'])
            receiver_id = int(data['receiverId'])
            content = data['content']

            # Insert into database
            msg = Message(
                match_id=match_id,
                sender_id=sender_id,
                receiver_id=receiver_id,
                content=content
            )
            db.session.add(msg)
            db.session.commit()

            new_message = {
                'id': msg.id,
                'senderId': sender_id,
                'receiverId': receiver_id,
                'matchId': match_id,
                'content': content,
                'timestamp': datetime.now().isoformat()
            }

            # Emit to everyone in the room
            room_name = f"match-{match_id}"
            emit('receive_message', new_message, to=room_name)
            print(f"[SOCKET] Broadcasted message in {room_name}")
            
        except Exception as e:
            print(f"[SOCKET] Error in send_message: {str(e)}")
            db.session.rollback()
