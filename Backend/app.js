const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const stockRoutes = require('./routes/stocks');
const salesRoutes = require('./routes/sales');
const notificationRoutes = require('./routes/notifications');
require("./cron/salesCleanup");

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: [
      "https://point-of-sale-stock-manager.vercel.app/",
      "https://point-of-sale-stock-manager-8xq7.vercel.app/",
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(
  cors({
    origin: [
      "https://point-of-sale-stock-manager.vercel.app/",
      "https://point-of-sale-stock-manager-8xq7.vercel.app/",
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
  })
);

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api', stockRoutes);
app.use('/api', salesRoutes);
app.use('/api', notificationRoutes);

io.on('connection', (socket) => {
  console.log('WebSocket client connected');
  socket.on('disconnect', () => {
    console.log('WebSocket client disconnected');
  });
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
