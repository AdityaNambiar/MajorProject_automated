const moment = require('moment');

function formatMessage(username, text) {
  return {
    username,
    message:text,
    timestamp: moment().format('h:mm a')
  };
}

module.exports = formatMessage;
