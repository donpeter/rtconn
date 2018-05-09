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
var dataChannelOptions = {
  ordered: false, //Unrealiable, Not guaranteed to deliver, but faster
  maxRetransmitTime: 1000,// Milliseconds

};
var offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1,
};

var localPeerConn;
var remotePeerConn = [];
var dataChannel;

// Define and add behavior to buttons.

// Define action buttons.
var callButton = document.getElementById('joinCall');
var hangupButton = document.getElementById('hangup');

// Set up initial action buttons status: disable call and hangup.
callButton.disabled = true;

$(function() {
  callButton.addEventListener('click', function() {
    joinRoom(chatRoom);
    start();
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
  if (!localPeerConn) {
    // startCall();
  }

  if (payload.type != 'user_here') {
    var message = JSON.parse(payload.message);
    if (message.sdp) {
      localPeerConn.setRemoteDescription(new RTCSessionDescription(message.sdp), function() {
        // if we received an offer, we need to answer
        if (localPeerConn.remoteDescription.type == 'offer') {
          localPeerConn.createAnswer(sendLocalDesc, logError);
        }
      }, logError);
    }
    else {
      remotePeerConn.addIceCandidate(new RTCIceCandidate(message.candidate));
    }
  }
}

function start() {
  trace('Requesting local stream');
  // get a local stream, show it in our video tag and add it to be sent
  var constraints = getVideoConstrains('vgaConstraints');
  navigator.mediaDevices.getUserMedia(constraints)
    .then(gotLocalMediaStream).catch(handleError);
}

function startCall() {
  console.log('Starting Call');
  callButton.disabled = true;
  hangupButton.disabled = false;
  // var videoTracks = localStream.getVideoTracks();
  // var audioTracks = localStream.getAudioTracks();
  // if (videoTracks.length > 0) {
  //   trace('Using video device: ' + videoTracks[0].label);
  // }
  // if (audioTracks.length > 0) {
  //   trace('Using audio device: ' + audioTracks[0].label);
  // }


  localPeerConn = new RTCPeerConnection(rtcPeerServer);
  remotePeerConn = new RTCPeerConnection(rtcPeerServer);

  dataChannel = localPeerConn.createDataChannel(chatRoom, dataChannelOptions);

  //DataChannel Event Listeners
  dataChannel.onopen = dataChannelStateChange;
  localPeerConn.ondatachannel = receivedDataChannel;


  // send local ice candidates to the other peer
  localPeerConn.onicecandidate = function(evt) {
    // if (evt.candidate) {
    //   socket.emit('signal-message', {
    //     'type': 'ice candidate',
    //     'message': JSON.stringify({'candidate': evt.candidate}),
    //     'room': signalRoom,
    //   });
    // }
    onIceCandidate(localPeerConn, evt);
    console.log('completed that ice candidate...');
  };
  // send remote ice candidates to the other peer
  remotePeerConn.onicecandidate = function(evt) {
    onIceCandidate(remotePeerConn, evt);
    console.log('completed that ice candidate...');
  };

  localPeerConn.oniceconnectionstatechange = function(e) {
    onIceStateChange(localPeerConn, e);
  };
  remotePeerConn.oniceconnectionstatechange = function(e) {
    onIceStateChange(remotePeerConn, e);
  };

  // let the 'negotiationneeded' event trigger offer generation
  // localPeerConn.onnegotiationneeded = function() {
  //   console.log('on negotiation called');
  //   localPeerConn.createOffer(sendLocalDesc, logError);
  // };

  // once remote stream arrives, show it in the remote video element
  // localPeerConn.onaddstream = gotRemoteMediaStream;

  remotePeerConn.ontrack = gotRemoteStream;

  localStream.getTracks().forEach(
    function(track) {
      localPeerConn.addTrack(
        track,
        localStream,
      );
    },
  );
  trace('Added local stream to localPeerConn');

  trace('localPeerConn createOffer start');
  localPeerConn.createOffer(offerOptions)
    .then(onCreateOfferSuccess)
    .catch(onCreateSessionDescriptionError);


}

// Listen for incomming message after DataChannel is Opened
function dataChannelStateChange() {
  if (dataChannel.readyState === 'open') {
    trace('DataChannel Opened');
    dataChannel.onmessage = receivedDataChannelMessage;
  }
}

//Fired when our peer is the one initiating the connection
function receivedDataChannel(event) {
  trace('Received a DataChannel');
  dataChannel = event.channel;
  dataChannel.onmessage = receivedDataChannelMessage;
}

function receivedDataChannelMessage(event) {
  trace('Received message via DataChannel');
  console.log(event.data);
  appendReceivedMessage(JSON.parse(event.data));
}


//Handle Ice candidate
function onIceCandidate(pc, event) {
  getOtherPc(pc).addIceCandidate(event.candidate)
    .then(
      function() {
        if (event.candidate) {
          socket.emit('signal-message', {
            'type': 'ice candidate',
            'message': JSON.stringify({'candidate': event.candidate}),
            'room': signalRoom,
          });
        }
        onAddIceCandidateSuccess(pc);
      },
      function(err) {
        onAddIceCandidateError(pc, err);
      },
    );
  trace(getName(pc) + ' ICE candidate: \n' + (event.candidate ?
    event.candidate.candidate : '(null)'));
}

function onAddIceCandidateSuccess(pc) {
  trace(getName(pc) + ' addIceCandidate success');
}

function onAddIceCandidateError(pc, error) {
  trace(getName(pc) + ' failed to add ICE Candidate: ' + error.toString());
}

//Ice State Changed
function onIceStateChange(pc, event) {
  if (pc) {
    trace(getName(pc) + ' ICE state: ' + pc.iceConnectionState);
    console.log('ICE state change event: ', event);
  }
}


function onCreateOfferSuccess(desc) {
  trace('Offer from localPeerConn\n' + desc.sdp);
  trace('localPeerConn setLocalDescription start');
  localPeerConn.setLocalDescription(desc).then(
    function() {
      onSetLocalSuccess(localPeerConn);
    },
    onSetSessionDescriptionError,
  );

  trace('remotePeerConn setRemoteDescription start');
  remotePeerConn.setRemoteDescription(desc).then(
    function() {
      onSetRemoteSuccess(remotePeerConn);
    },
    onSetSessionDescriptionError,
  );
  trace('remotePeerConn createAnswer start');
  // Since the 'remote' side has no media stream we need
  // to pass in the right constraints in order for it to
  // accept the incoming offer of audio and video.
  remotePeerConn.createAnswer().then(
    onCreateAnswerSuccess,
    onCreateSessionDescriptionError,
  );
}

function onCreateAnswerSuccess(desc) {
  trace('Answer from remotePeerConn:\n' + desc.sdp);
  trace('remotePeerConn setLocalDescription start');
  remotePeerConn.setLocalDescription(desc).then(
    function() {
      onSetLocalSuccess(remotePeerConn);
    },
    onSetSessionDescriptionError,
  );
  trace('localPeerConn setRemoteDescription start');
  localPeerConn.setRemoteDescription(desc).then(
    function() {
      onSetRemoteSuccess(localPeerConn);
    },
    onSetSessionDescriptionError,
  );
}

//Session offer error handler
function onCreateSessionDescriptionError(error) {
  trace('Failed to create session description: ' + error.toString());
}

function onSetLocalSuccess(pc) {
  socket.emit('signal-message', {
    'type': 'SDP',
    'message': JSON.stringify({'sdp': localPeerConn.localDescription}),
    'room': signalRoom,
  });
  trace(getName(pc) + ' setLocalDescription complete');
}

function onSetRemoteSuccess(pc) {
  socket.emit('signal-message', {
    'type': 'SDP',
    'message': JSON.stringify({'sdp': remoteVideo.localDescription}),
    'room': signalRoom,
  });
  trace(getName(pc) + ' setRemoteDescription complete');
}

function onSetSessionDescriptionError(error) {
  trace('Failed to set session description: ' + error.toString());
}






function sendLocalDesc(desc) {
  localPeerConn.setLocalDescription(desc, function() {
    console.log('sending local description', desc);
    socket.emit('signal-message', {
      'type': 'SDP',
      'message': JSON.stringify({'sdp': localPeerConn.localDescription}),
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
  startCall();
  // localPeerConn.addStream(mediaStream);

  console.log('Received local stream.');
  // callAction(); //Start Calling
}

function gotRemoteStream(e) {
  if (remoteVideo.srcObject !== e.streams[0]) {
    remoteVideo.srcObject = e.streams[0];
    trace('remotePeerConn received remote stream');
  }
}

// Handles remote MediaStream success by adding it as the remoteVideo src.
function gotRemoteMediaStream(event) {
  var mediaStream = event.stream;
  remoteStream = mediaStream; // make mediaStream available to console
  // Older browsers may not have srcObject
  if ('srcObject' in remoteStream) {
    remoteVideo.srcObject = mediaStream;
  } else {
    // Avoid using this in new browsers, as it is going away.
    remoteVideo.src = window.URL.createObjectURL(mediaStream);
  }
  remoteVideo.onloadedmetadata = function(e) {
    remoteVideo.play();
  };
  console.log('Remote peer connection received remote stream.');
}

function hangup() {
  trace('Ending call');
  localPeerConn.close();
  remotePeerConn.close();
  localPeerConn = null;
  remotePeerConn = null;
  // hangupButton.disabled = true;
  // callButton.disabled = false;
}


// Returns one a peer connection, differnt from the one passed
function getOtherPc(pc) {
  return (pc === localPeerConn) ? remotePeerConn : localPeerConn;
}

// Returns peer connection name
function getName(pc) {
  return (pc === localPeerConn) ? 'localPeerConn' : 'remotePeerConn';
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
  if (dataChannel.readyState !== 'open') {
    if (payload.socket == socket.id) {
      appendSentMessage(payload);
    } else {
      appendReceivedMessage(payload);
    }
  } else {
    trace('Recieved socket chat message, but leaving it for WebRTC DataChannel');
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
  dataChannel.send(JSON.stringify(payload));
  appendSentMessage(payload);

}

function logError(err) {
  console.log('Errro: ', err);
}
function appendSentMessage(payload) {
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