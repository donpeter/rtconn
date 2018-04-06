var namespace = getUrlPath().toLowerCase();
var socket = io();
var room = namespace + '-room';
$(function() {
  console.log('New Socket: ', socket.id);
  socket.emit('join-room', room);
  socket.on('user-join', function(payload) {
    console.log('New: ', payload);
  });
  socket.on('chat-message', chatMessage);
  socket.on('disconnect', function() {
    console.log('Socket disconneted');
  });
  socket.on('connect', function() {

  });

  var messageInput = $('#textChatForm [name="chat"]');
  $('#textChatForm').submit(function(e) {
    e.preventDefault();
    sendMessage(messageInput);
  });
});

function sendMessage(messageInput) {
  var message = messageInput.val().trim();
  if (!message) return;
  var data = {message: message, room: room, username: socket.id};
  messageInput.val('');
  socket.emit('chat-message', data);
  appendSentMessage(message);

}

function chatMessage(payload) {
  console.log(payload);
  if (payload.username == socket.id) {
    appendSentMessage(payload.message);
  } else {
    appendReceivedMessage(payload.message);
  }

}

function appendSentMessage(mes) {
  mes = encodeHTML(mes);
  var li = `<li>
            <div class="msj-rta macro">
              <div class="text text-r">
                <p>${mes} </p><p><small>12:28 PM</small></p>
              </div>
              <div class="avatar">
                <img class="rounded-circle" src="https://a11.t26.net/taringa/avatares/9/1/2/F/7/8/Demon_King1/48x48_5C5.jpg">
              </div>
            </div>
          </li>`;
  $('#messages').append(li);
}

/*
* Appends new message to the chat box
* @param String mes
* */
function appendReceivedMessage(mes) {
  var li = `<li>
            <div class="msj macro">
              <div class="avatar">
                <img class="rounded-circle" src="https://lh6.googleusercontent.com/-lr2nyjhhjXw/AAAAAAAAAAI/AAAAAAAARmE/MdtfUmC0M4s/photo.jpg?sz=48">
              </div>
              <div class="text text-l">
                <p>${mes} </p><p><small>12:00 PM</small></p>
              </div>
            </div>
          </li>`;
  $('#messages').append(li);
}

/*
* Return the last path in the url
* i.e if url = https://rtconn.io/chat/donpeter
* it returns '/donpeter'
* @return String lastPath
* */
function getUrlPath() {
  var namespace = window.location.pathname.split('/');
  return '/' + namespace[namespace.length - 1];
}

/*
* Encode String with a for safe output in HTML
* */
function encodeHTML(str) {
  return str.replace(/[\u00A0-\u9999<>&](?!#)/gim, function(i) {
    return '&#' + i.charCodeAt(0) + ';';
  });
}