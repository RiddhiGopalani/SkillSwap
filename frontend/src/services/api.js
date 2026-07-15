import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication / User Profile
export const registerUser = (name, email, password) => api.post('/users/register', { name, email, password });
export const loginUser = (email, password) => api.post('/users/login', { email, password });
export const getUserProfile = (userId) => api.get(`/users/${userId}`);
export const saveUserProfile = (userId, data) => api.put(`/users/${userId}/profile`, data);

// Skills
export const fetchUserSkills = (userId) => api.get(`/skills/${userId}`);
export const addUserSkill = (userId, skillName, type, level) => api.post('/skills', { userId, skillName, type, level });
export const updateUserSkill = (skillId, level) => api.put(`/skills/${skillId}`, { level });
export const deleteUserSkill = (skillId) => api.delete(`/skills/${skillId}`);

// Availability
export const fetchUserAvailability = (userId) => api.get(`/availability/${userId}`);
export const addUserAvailability = (userId, day, startTime, endTime) => api.post('/availability', { userId, day, startTime, endTime });
export const updateUserAvailability = (availId, day, startTime, endTime) => api.put(`/availability/${availId}`, { day, startTime, endTime });
export const deleteUserAvailability = (availId) => api.delete(`/availability/${availId}`);

// Matches
export const generateMatches = (userId) => api.post(`/matches/generate/${userId}`);
export const fetchMatches = (userId) => api.get(`/matches/${userId}`);
export const updateMatchStatus = (matchId, status) => api.patch(`/matches/${matchId}`, { status });

// Timetable
export const fetchTimetable = (matchId) => api.get(`/timetable/${matchId}`);
export const generateTimetable = (matchId) => api.post(`/timetable/generate/${matchId}`);
export const updateTimetable = (matchId, sessions) => api.patch(`/timetable/${matchId}`, { sessions });
export const fetchUserTimetable = (userId) => api.get(`/timetable/user/${userId}`);

// Rewards
export const fetchRewards = (userId) => api.get(`/rewards/${userId}`);
export const awardRewards = (userId, reason) => api.post('/rewards/award', { userId, reason });

// Messages
export const fetchMessages = (matchId) => api.get(`/messages/${matchId}`);

export default api;
