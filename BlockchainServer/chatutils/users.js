const array = require("lodash/array")

const users = [];

// Join user to chat
function userJoin(id, username, room,pIdentifier) {
  const user = { id, username, room ,typing:"",pIdentifier};

  users.push(user);
  return user;
}

// Get current user
function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    let userleft = users.splice(index, 1)[0];
    
    return userleft
  }
}

// Get room users
function getRoomUsers(room) {
  let filuser = users.filter(user => user.room === room);
  return array.uniqBy(filuser,"pIdentifier")
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
};
