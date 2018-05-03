'use strict';

var namespace = getUrlPath().toLowerCase();
var socket = io();
var room = namespace + '-room';
var nickname = $('#nickname');
$(function() {
  callButton.addEventListener('click', joinRoom);
  socket.on('user-join', function(payload) {
    // TODO Peer new user to the chat
    console.log(payload);
  });
  socket.on('chat-message', chatMessage);
  socket.on('disconnect', function() {
    // TODO Remove User form Chat
  });
  socket.on('connect', function() {

  });

  var messageInput = $('#textChatForm [name="chat"]');
  $('#textChatForm').submit(function(e) {
    e.preventDefault();
    sendMessage(messageInput);
  });
});

function joinRoom() {
  socket.emit('join-room', {room: room, user: nickname.val()});
}
function sendMessage(messageInput) {
  var message = messageInput.val().trim();
  if (!message) return;
  var payload = {
    message: message,
    room: room,
    socket: socket.id,
    nickname: nickname.val(),
  };
  messageInput.val('');
  socket.emit('chat-message', payload);
  appendSentMessage(payload);

}

function chatMessage(payload) {
  if (payload.socket == socket.id) {
    appendSentMessage(payload);
  } else {
    appendReceivedMessage(payload);
  }

}

function appendSentMessage(payload) {
  var date = new Date();
  payload.message = encodeHTML(payload.message);
  var li = `<li>
            <div class="msj-rta macro">
              <div class="text text-r">
                <p>${payload.message} </p>
                <p class="text-dark"><b>${payload.nickname}</b> <small>${moment().format('LT')}</small></p>
              </div>
              <div class="avatar">
                <img class="rounded-circle" src="${takeScreenshot(localVideo)}">
              </div>
            </div>
          </li>`;
  $('#messages').append(li);
}

/*
* Appends new message to the chat box
* @param String mes
* */
function appendReceivedMessage(payload) {
  var li = `<li>
            <div class="msj macro">
              <div class="avatar">
                <img class="rounded-circle" src="https://lh6.googleusercontent.com/-lr2nyjhhjXw/AAAAAAAAAAI/AAAAAAAARmE/MdtfUmC0M4s/photo.jpg?sz=48">
              </div>
              <div class="text text-l">
                <p>${payload.message} </p>
                <p class="text-info"><b>${payload.nickname}</b> <small>${moment().format('LT')}</small></p>
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

nickname.keyup(function() {
  callButton.disabled = nickname.val().trim().length === 0;
});