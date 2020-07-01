const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./chatutils/messages');
const createChat = require("./utilities/createChat")
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./chatutils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const botName = 'DevOpsChain';

// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room,pIdentifier }) => {
    
    const user = userJoin(socket.id, username, room,pIdentifier);

    socket.join(user.room);

    // Welcome current user
    socket.emit('welcomemessage', formatMessage(botName, 'Welcome to Devopschain!'));

    // Broadcast when a user connects
    socket.broadcast 
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info 
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  }); 

  // Listen for chatMessage
  socket.on('chatMessage', async({cardName,room,chat,chatType}) => {
    let chatretrieve = await createChat(cardName,room,chat,chatType);
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('chatMessage', chatretrieve);
  });
  
  socket.on("typing",({desc})=>{
    const user = getCurrentUser(socket.id);
    socket.broadcast.to(user.room).emit("typing",{user,desc})
  })

  // Runs when client disconnects 
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );
 
      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

// const PORT = process.env.PORT || 6800;

// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = server;