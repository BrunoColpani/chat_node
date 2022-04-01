const express = require('express');
const path = require('path');
const http = require('http')
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let connectedUsers = [];

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('join-request', (username) => {
    socket.username = username;
    connectedUsers.push(username);

    socket.emit('user-ok', connectedUsers);
    socket.broadcast.emit('list-update', {
      joined: username,
      list: connectedUsers
    });
  });

  socket.on('disconnect', () => {
    connectedUsers = connectedUsers.filter(u => u !== socket.username);
    socket.broadcast.emit('list-update', {
      left: socket.username,
      list: connectedUsers
    });
  });

  socket.on('send-msg', (txt) => {
    let obj = {
      username: socket.username,
      message: txt
    };

    socket.emit('show-msg', obj);
    socket.broadcast.emit('show-msg', obj);
  });
});


server.listen(3000, () => {
  console.log('Server running on port 3000');
});