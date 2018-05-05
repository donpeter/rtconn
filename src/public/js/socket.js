'use strict';

var namespace = getUrlPath().toLowerCase();
var socket = io();
var chatRoom = namespace + '-room';
var nickname = $('#nickname');
var signalRoom = namespace + '-signal-room';


//Variables
var localVideo = document.querySelector('#localVideo'),
  remoteVideo = document.querySelector('#remoteVideo'),
  videoSelect = document.querySelector('#videoSelect'),
  audioSelect = document.querySelector('#audioSelect'),
  image = document.querySelector('#screenshot');

var localStream, remoteStream;
var rtcPeerServer = {iceServers: [{urls: 'stun:stun.l.google.com:19302'}]};
var rtcPeerConn;


// Define and add behavior to buttons.

// Define action buttons.
const callButton = document.getElementById('joinCall');

// Set up initial action buttons status: disable call and hangup.
callButton.disabled = true;

$(function() {
  callButton.addEventListener('click', function() {
    joinRoom(chatRoom);
    // startSignaling();
  });
  socket.emit('join-room', {room: signalRoom});
  socket.emit('signal-message', {
    room: signalRoom,
    type: 'user_here',
    message: 'Whats your number?',
  });


  socket.on('signal-message', onSignalMessage);
  socket.on('user-join', function(payload) {
    // TODO Peer new user to the chat
  }); //Handle new user joining the chat room
  socket.on('chat-message', chatMessage); // Handele new chat-message event
  socket.on('disconnect', function() {
    // TODO Remove User form Chat
  });

  var messageInput = $('#textChatForm [name="chat"]');
  $('#textChatForm').submit(function(e) {
    e.preventDefault();
    sendMessage(messageInput);
  });
});


//Hnadle Sinaling mesaage
function onSignalMessage(payload) {
  console.log('Signal received: ' + payload.type);
  console.log(payload);
  if (!rtcPeerConn) {
    startSignaling();
  }

  if (payload.type != 'user_here') {
    var message = JSON.parse(payload.message);
    if (message.sdp) {
      rtcPeerConn.setRemoteDescription(new RTCSessionDescription(message.sdp), function() {
        // if we received an offer, we need to answer
        if (rtcPeerConn.remoteDescription.type == 'offer') {
          rtcPeerConn.createAnswer(sendLocalDesc, logError);
        }
      }, logError);
    }
    else {
      rtcPeerConn.addIceCandidate(new RTCIceCandidate(message.candidate));
    }
  }
}

function startSignaling() {
  console.log('Starting Signaling');
  rtcPeerConn = new RTCPeerConnection(rtcPeerServer);

  // send any ice candidates to the other peer
  rtcPeerConn.onicecandidate = function(evt) {
    if (evt.candidate) {
      socket.emit('signal-message', {
        'type': 'ice candidate',
        'message': JSON.stringify({'candidate': evt.candidate}),
        'room': signalRoom,
      });
    }
    console.log('completed that ice candidate...');
  };

  // let the 'negotiationneeded' event trigger offer generation
  rtcPeerConn.onnegotiationneeded = function() {
    console.log('on negotiation called');
    rtcPeerConn.createOffer(sendLocalDesc, logError);
  };

  // once remote stream arrives, show it in the remote video element
  rtcPeerConn.onaddstream = gotRemoteMediaStream;

  // get a local stream, show it in our video tag and add it to be sent
  var constraints = getVideoConstrains('qvgaConstraints');
  navigator.mediaDevices.getUserMedia(constraints)
    .then(gotLocalMediaStream).catch(handleLocalMediaStreamError);

}

function sendLocalDesc(desc) {
  rtcPeerConn.setLocalDescription(desc, function() {
    console.log('sending local description');
    socket.emit('signal-message', {
      'type': 'SDP',
      'message': JSON.stringify({'sdp': rtcPeerConn.localDescription}),
      'room': signalRoom,
    });
  }, logError);
}

// Sets the MediaStream as the video element src.
function gotLocalMediaStream(mediaStream) {
  localStream = mediaStream; // make mediaStream available to console
  // Older browsers may not have srcObject
  if ('srcObject' in localVideo) {
    localVideo.srcObject = mediaStream;
  } else {
    // Avoid using this in new browsers, as it is going away.
    localVideo.src = window.URL.createObjectURL(mediaStream);
  }
  localVideo.onloadedmetadata = function(e) {
    localVideo.play();
  };
  rtcPeerConn.addStream(mediaStream);

  console.log('Received local stream.');
  // callAction(); //Start Calling
}

// Handles error by logging a message to the console.
function handleLocalMediaStreamError(error) {
  console.log(`navigator.getUserMedia error: ${error.toString()}.`);
}

// Handles remote MediaStream success by adding it as the remoteVideo src.
function gotRemoteMediaStream(event) {
  const mediaStream = event.stream;
  remoteStream = mediaStream; // make mediaStream available to console
  // Older browsers may not have srcObject
  if ('srcObject' in remoteStream) {
    remoteVideo.srcObject = mediaStream;
  } else {
    // Avoid using this in new browsers, as it is going away.
    remoteVideo.src = window.URL.createObjectURL(mediaStream);
  }
  remoteStream.onloadedmetadata = function(e) {
    remoteVideo.play();
  };
  console.log('Remote peer connection received remote stream.');
}

//List out all video and audio devices as options
function gotDevices(deviceInfos) {
  for (var i = 0; i !== deviceInfos.length; ++i) {
    var deviceInfo = deviceInfos[i];
    var option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'audioinput') {
      option.text = deviceInfo.label ||
        'microphone ' + (audioSelect.length + 1);
      audioSelect.appendChild(option);
    } else if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || 'camera ' +
        (videoSelect.length + 1);
      videoSelect.appendChild(option);
    } else {
      // console.log('Found one other kind of source/device: ', deviceInfo);
    }
  }
}


//Handles WebRTC error
function handleError(error) {
  if (error.name === 'ConstraintNotSatisfiedError') {
    console.log('The resolution ' + constraints.video.width.exact + 'x' +
      constraints.video.width.exact + ' px is not supported by your device.');
  } else if (error.name === 'PermissionDeniedError') {
    console.log('Permissions have not been granted to use your camera and ' +
      'microphone, you need to allow the page access to your devices in ' +
      'order for the demo to work.');
  }
  console.log('getUserMedia error: ' + error.name, error);
}

/*
* Take Screenshot of the video stream
* @return Image url
* */
function takeScreenshot(video, width, height) {
  video = video || localVideo; //Sets localVideo as default value
  const canvas = document.createElement('canvas');
  canvas.width = width || video.videoWidth;
  canvas.height = height || video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  return canvas.toDataURL('image/webp');

}


//Joins the socket to the rooms
function joinRoom(room) {
  console.log('ReQ Join', room);
  socket.emit('join-room', {room: room, user: nickname.val()});
}

function chatMessage(payload) {
  if (payload.socket == socket.id) {
    appendSentMessage(payload);
  } else {
    appendReceivedMessage(payload);
  }

}

function sendMessage(messageInput) {
  var message = messageInput.val().trim();
  if (!message) return;
  var payload = {
    message: message,
    room: chatRoom,
    socket: socket.id,
    nickname: nickname.val(),
  };
  messageInput.val('');
  socket.emit('chat-message', payload);
  appendSentMessage(payload);

}

function logError(err) {
  console.log('Errro: ', err);
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
  var name = nickname.val();
  nickname.val(name.trim());
  callButton.disabled = nickname.val().length === 0;
});

// Logs an action (text) and the time when it happened on the console.
function trace(text) {
  text = text.trim();
  var now = (window.performance.now() / 1000).toFixed(3);

  console.log(now, text);
}