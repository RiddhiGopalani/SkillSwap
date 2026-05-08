const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Connect to MySQL
const { connectDB, getPool } = require('./config/db');
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow our React frontend to communicate with this backend
app.use(express.json()); // Allow API to safely parse incoming JSON data

// ---------------------------------------------------------
// ROUTES
// ---------------------------------------------------------
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// ---------------------------------------------------------
// SOCKET.IO CHAT
// ---------------------------------------------------------
io.on('connection', (socket) => {
    console.log(`[SOCKET] User connected: ${socket.id}`);

    socket.on('join_room', (matchId) => {
        socket.join(`match-${matchId}`);
        console.log(`[SOCKET] User joined room: match-${matchId}`);
    });

    socket.on('send_message', async (data) => {
        // data: { senderId, receiverId, matchId, content }
        try {
            const pool = getPool();
            const [result] = await pool.query(
                `INSERT INTO Messages (match_id, sender_id, receiver_id, content) VALUES (?, ?, ?, ?)`,
                [data.matchId, data.senderId, data.receiverId, data.content]
            );
            
            const newMessage = {
                id: result.insertId,
                senderId: data.senderId,
                receiverId: data.receiverId,
                matchId: data.matchId,
                content: data.content,
                timestamp: new Date()
            };

            // Emit to everyone in the room
            io.to(`match-${data.matchId}`).emit('receive_message', newMessage);
        } catch (err) {
            console.error("Socket send_message error:", err);
        }
    });

    socket.on('disconnect', () => {
        console.log(`[SOCKET] User disconnected: ${socket.id}`);
    });
});

// Start Server
server.listen(PORT, () => {
    console.log('-------------------------------------------');
    console.log(`[SERVER] SkillSwap API is running on http://localhost:${PORT}`);
    console.log('-------------------------------------------');
});
