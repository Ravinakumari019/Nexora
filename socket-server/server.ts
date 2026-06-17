import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 3001;

// Map to keep track of active users and their connected socket IDs
// userId -> Set of socketIds
const userSockets = new Map<string, Set<string>>();

const httpServer = createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // HTTP endpoint for Next.js API route to broadcast saved messages
  if (req.method === 'POST' && req.url === '/api/broadcast') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const { conversationId, message } = payload;

        if (!conversationId || !message) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing conversationId or message' }));
          return;
        }

        // Broadcast the message to all sockets in the conversation room
        io.to(conversationId).emit('message:received', message);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        console.error('[BROADCAST_ERROR]', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to process broadcast payload' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow all origins for dev simplicity, can refine if needed
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId as string;

  if (!userId) {
    console.log(`[SOCKET] Connected socket ${socket.id} has no userId. Disconnecting.`);
    socket.disconnect(true);
    return;
  }

  console.log(`[SOCKET] User connected: ${userId} (Socket: ${socket.id})`);

  // Register socket
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }
  userSockets.get(userId)!.add(socket.id);

  // If this is the user's first connection, broadcast they are online
  if (userSockets.get(userId)!.size === 1) {
    socket.broadcast.emit('presence:update', { userId, status: 'online' });
  }

  // Send initial list of currently online user IDs to the newly connected user
  const onlineUserIds = Array.from(userSockets.keys());
  socket.emit('presence:initial', onlineUserIds);

  // Rooms joining & leaving
  socket.on('room:join', (conversationId: string) => {
    socket.join(conversationId);
    console.log(`[SOCKET] Socket ${socket.id} (User: ${userId}) joined room: ${conversationId}`);
  });

  socket.on('room:leave', (conversationId: string) => {
    socket.leave(conversationId);
    console.log(`[SOCKET] Socket ${socket.id} (User: ${userId}) left room: ${conversationId}`);
  });

  // Typing indicators
  socket.on('typing:start', (conversationId: string) => {
    socket.to(conversationId).emit('typing:update', {
      conversationId,
      userId,
      isTyping: true,
    });
  });

  socket.on('typing:stop', (conversationId: string) => {
    socket.to(conversationId).emit('typing:update', {
      conversationId,
      userId,
      isTyping: false,
    });
  });

  // Disconnection handler
  socket.on('disconnect', () => {
    console.log(`[SOCKET] User disconnected: ${userId} (Socket: ${socket.id})`);
    
    const sockets = userSockets.get(userId);
    if (sockets) {
      sockets.delete(socket.id);
      
      // If no sockets left for this user, they are now offline
      if (sockets.size === 0) {
        userSockets.delete(userId);
        io.emit('presence:update', { userId, status: 'offline' });
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Real-time Socket.IO server listening on http://localhost:${PORT}`);
});
