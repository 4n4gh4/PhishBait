import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const http = createServer(app);
const io = new Server(http);

// Serve static files from 'public' folder
app.use(express.static(__dirname + '/public'));

// Optional: serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', socket => {
    console.log('a user connected');

    // Listen for chat messages
    socket.on('chatMessage', ({ msg }) => {
        // Broadcast to everyone including sender
        io.emit('chatMessage', { name: 'Player', msg });
    });

    // Optional: handle joinRoom to show system messages
    socket.on('joinRoom', ({ name, room }) => {
        socket.emit('systemMessage', `Welcome, ${name}!`);
        socket.broadcast.emit('systemMessage', `${name} joined the game`);
    });
});


http.listen(3000, () => console.log('🚀 Server running at http://localhost:3000'));
