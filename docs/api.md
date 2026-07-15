# SkillSwap API Documentation

This document describes all API endpoints exposed by the Flask backend server on port 5000. All routes are prefixed with `/api`.

---

## 🔑 Authentication & Users

### 1. Register User
- **URL**: `/api/users/register`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "points": 0
  }
  ```

### 2. Login User
- **URL**: `/api/users/login`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "points": 12,
    "bio": "Learn coding",
    "badges": ["Active Learner"],
    "avatar": "J",
    "color": "#60a5fa"
  }
  ```

### 3. Get User Profile
- **URL**: `/api/users/<user_id>`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "points": 12,
    "bio": "Learn coding",
    "badges": ["Active Learner"],
    "avatar": "J",
    "color": "#60a5fa"
  }
  ```

### 4. Update Profile
- **URL**: `/api/users/<user_id>/profile`
- **Method**: `PUT`
- **Payload**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "teaches": [
      { "topic": "Python", "level": "Advanced" }
    ],
    "learns": [
      { "topic": "React", "level": "Beginner", "urgency": "Urgent" }
    ],
    "days": ["Monday", "Wednesday"],
    "slots": ["Morning (7-10)"]
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Profile updated successfully"
  }
  ```

---

## 📚 Skills

### 1. Add Skill
- **URL**: `/api/skills`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "userId": 1,
    "skillName": "Python",
    "type": "teach",
    "level": "Advanced"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "id": 12,
    "userId": 1,
    "skillName": "Python",
    "type": "teach",
    "level": "Advanced"
  }
  ```

### 2. Get User Skills
- **URL**: `/api/skills/<user_id>`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  [
    { "id": 1, "userId": 1, "skillName": "Python", "type": "teach", "level": "Advanced" },
    { "id": 2, "userId": 1, "skillName": "React", "type": "learn", "level": "Urgent" }
  ]
  ```

---

## 🗓️ Availability

### 1. Add Availability
- **URL**: `/api/availability`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "userId": 1,
    "day": "Monday",
    "startTime": "07:00",
    "endTime": "10:00"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "id": 5,
    "userId": 1,
    "day": "Monday",
    "startTime": "07:00",
    "endTime": "10:00"
  }
  ```

---

## 🤝 Matches

### 1. Generate Matches
- **URL**: `/api/matches/generate/<user_id>`
- **Method**: `POST`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "generatedCount": 3
  }
  ```

### 2. Get User Matches
- **URL**: `/api/matches/<user_id>`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "matches": [
      {
        "matchId": 15,
        "id": 2,
        "name": "Jane Smith",
        "avatar": "J",
        "color": "#60a5fa",
        "score": 85,
        "label": "Strong Match",
        "status": "pending",
        "teaches": [],
        "learns": [],
        "days": ["Monday"],
        "slots": ["07:00-10:00"],
        "mode": "Online",
        "bio": "Expert React dev."
      }
    ]
  }
  ```

### 3. Update Match Status
- **URL**: `/api/matches/<match_id>`
- **Method**: `PATCH`
- **Payload**:
  ```json
  {
    "status": "accepted"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "id": 15,
    "status": "accepted"
  }
  ```

---

## 📅 Timetable

### 1. Generate Timetable
- **URL**: `/api/timetable/generate/<match_id>`
- **Method**: `POST`
- **Response** (200 OK):
  ```json
  {
    "sessions": [
      { "id": "0", "day": "Monday", "time": "07:00-10:00", "duration": "1 hour", "topic": "Shared Session", "role": "learn" }
    ]
  }
  ```

### 2. Update Timetable Sessions
- **URL**: `/api/timetable/<match_id>`
- **Method**: `PATCH`
- **Payload**:
  ```json
  {
    "sessions": [
      { "day": "Monday", "time": "08:00-09:00", "topic": "React Hook Basics" }
    ]
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "sessions": [
      { "id": "1", "day": "Monday", "time": "08:00-09:00", "duration": "1 hour", "topic": "React Hook Basics", "role": "teach" }
    ]
  }
  ```

---

## 🏆 Rewards

### 1. Award Points
- **URL**: `/api/rewards/award`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "userId": 1,
    "reason": "session_completed"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "points": 22,
    "badges": ["Active Learner"]
  }
  ```
