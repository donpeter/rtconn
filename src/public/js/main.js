'use strict';

var namespace = getUrlPath().toLowerCase();
var socket = io();
var chatRoom = namespace + '-room';
var nickname = $('#nickname');
var signalRoom = namespace + '-signal-room';
var fileRoom = namespace + '-file-room';


//Variables
var localVideo = document.getElementById('localVideo'),
  remoteVideo = document.getElementById('remoteVideo'),
  fileInput = document.getElementById('fileInput'),
  fileProgress = $('#file-progress .progress-bar'),
  sendFile = document.getElementById('sendFile'),
  image = document.getElementById('screenshot');

var localStream, remoteStream;
var rtcPeerServer = {
  iceServers: [
    {urls: 'stun:numb.viagenie.ca'},
    {urls: 'stun:stun.ekiga.net'},
    {urls: 'stun:stun.voipbuster.com'},
    {urls: 'stun:stun.l.google.com:19302'},
    {
      urls: 'turn:numb.viagenie.ca',
      'credential': 'Freshboy1!',
      'username': 'patunalu@yahoo.com',
    },
    // {
    //   'urls': 'turn:192.158.29.39:3478?transport=tcp',
    //   'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
    //   'username': '28224511:1379330808'
    // }
  ],
};
var dataChannelOptions = {
  ordered: true, //Unrealiable, Not guaranteed to deliver, but faster
  maxRetransmitTime: 1000,// Milliseconds

};
var offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1,
};
var fileMeta = {},
  fileBuffer = [],
  fileSize = 0;

var rtcPeerConn, dataChannel;


// Define and add behavior to buttons.

// Define action buttons.
var callButton = document.getElementById('joinCall');
var hangupButton = document.getElementById('hangup');
var screenSharingButton = document.getElementById('screenSharing');
// Set up initial action buttons status: disable call and hangup.
callButton.disabled = true;


$(function() {

  callButton.addEventListener('click', startCall);
  hangupButton.addEventListener('click', hangup);
  screenSharingButton.addEventListener('click', startScreenSharing);
  // socket.emit('join-room', {room: signalRoom});


  socket.on('file-transfer', onFileTransfer);
  socket.on('signal-message', onSignalMessage);
  socket.on('nickname-join', function(payload) {
    // TODO Peer new nickname to the chat
  }); //Handle new nickname joining the chat room
  socket.on('chat-message', chatMessage); // Handele new chat-message event
  socket.on('call_ended', onHangup);
  socket.on('disconnect', function() {
    // TODO Remove User form Chat
  });

  var messageInput = $('#textChatForm [name="chat"]');
  $('#textChatForm').submit(function(e) {
    e.preventDefault();
    sendMessage(messageInput);
  });
});

function startCall() {
  joinRoom(chatRoom);
  joinRoom(signalRoom);
  joinRoom(fileRoom);
  stopStream(setupStream);
  // get a local stream, show it in our video tag and add it to be sent
  var constraints = getVideoConstrains('hdConstraints');
  navigator.mediaDevices.getUserMedia(constraints)
    .then(gotLocalMediaStream).catch(handleError);
  // startSignaling();
  socket.emit('signal-message', {
    room: signalRoom,
    type: 'user_here',
    message: 'Are you available for call?',
  });

  sendFile.addEventListener('click', sendFileMeta);
}
//Hnadle Sinaling mesaage
function onSignalMessage(payload) {
  trace('Signal received: ' + payload.type);
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
  trace('Starting Signaling');
  rtcPeerConn = new RTCPeerConnection(rtcPeerServer);

  dataChannel = rtcPeerConn.createDataChannel(chatRoom, dataChannelOptions);

  //DataChannel Event Listeners
  dataChannel.onopen = dataChannelStateChange;
  rtcPeerConn.ondatachannel = receivedDataChannel;


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
    rtcPeerConn.createOffer(offerOptions)
      .then(sendLocalDesc)
      .catch(logError);
  };

  // once remote stream arrives, show it in the remote video element
  rtcPeerConn.ontrack = gotRemoteStream;
  if (localStream) {
    addLocalStream();
  } else {
    setTimeout(addLocalStream, 1000);
  } // Retry adding the local stream to the peer object after 1s
    // rtcPeerConn.onaddstream = gotRemoteMediaStream;
  // rtcPeerConn.addStream(localStream);



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
  try {
    appendReceivedMessage(JSON.parse(event.data));
    openTextChat(); //Open the chat box

  } catch (e) {
    //This is where we process incoming files
    fileBuffer.push(event.data);
    fileSize += event.data.byteLength;

    //Provide link to downloadable file when complete
    if (fileSize === fileMeta.fileSize) {
      var received = new window.Blob(fileBuffer);
      fileBuffer = [];
      fileMeta.url = URL.createObjectURL(received);
      // $('#messages').append(downloadLink);
      fileSize = 0;

      appendReceivedFile(fileMeta);
      openTextChat(); //Open the chat box
    }
  }



}

function sendFileMeta() {
  var file = fileInput.files[0];
  if (file) {
    sendFileChannel(file, dataChannel);
    fileInput.value = null;// Reset input
    showTextMesage();
  }


}

function sendFileChannel(file, dataChannel, chunkSize = 16348, progress) {
  if (!file) {
    return;
  }
  fileMeta = {
    room: fileRoom,
    nickname: nickname.val(),
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  };
  socket.emit('file-transfer', fileMeta);

  //Show file progress bar
  progress = progress || fileProgress;
  progress.css('width', '0%');
  progress.show();
  // progress.attr('aria-valuemax', file.size);

  //Slice the file into chunks of 16kb
  var sliceFile = function(offset) {
    var reader = new window.FileReader();
    reader.onload = (function() {
      return function(e) {
        dataChannel.send(e.target.result);
        if (file.size > offset + e.target.result.byteLength) {
          window.setTimeout(sliceFile, 0, offset + chunkSize);
        }
        var currentVal = (offset + e.target.result.byteLength) / file.size * 100;

        //Update progress bar
        progress.attr('aria-valuenow', currentVal);
        progress.text(currentVal + '%');
        progress.css('width', currentVal + '%');
      };
    })(file);
    var slice = file.slice(offset, offset + chunkSize);
    reader.readAsArrayBuffer(slice);
  };
  sliceFile(0);
  fileMeta.url = URL.createObjectURL(file);
  appendSentFile(fileMeta);

}

function onFileTransfer(payload) {
  fileMeta = payload;
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

/*
* Adds the LocalStream track to the rtcPeerConn*/
function addLocalStream() {
  localStream.getTracks().forEach(
    function(track) {
      rtcPeerConn.addTrack(
        track,
        localStream,
      );
    },
  );
}
// Sets the MediaStream as the video element src.
function gotLocalMediaStream(mediaStream) {
  window.localStream = mediaStream; // make mediaStream available to console
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
  // rtcPeerConn.addStream(mediaStream);

  trace('Received local stream.');
  // callAction(); //Start Calling
}


// Handles remote MediaStream success by adding it as the remoteVideo src.
// function gotRemoteMediaStream(event) {
//   const mediaStream = event.stream;
//   remoteStream = mediaStream; // make mediaStream available to console
//   // Older browsers may not have srcObject
//   if ('srcObject' in remoteStream) {
//     remoteVideo.srcObject = mediaStream;
//   } else {
//     // Avoid using this in new browsers, as it is going away.
//     remoteVideo.src = window.URL.createObjectURL(mediaStream);
//   }
//   remoteVideo.onloadedmetadata = function(e) {
//     remoteVideo.play();
//   };
//   console.log('Remote peer connection received remote stream.');
// }
function gotRemoteStream(e) {

  if (remoteVideo.srcObject !== e.streams[0]) {
    remoteStream = e.streams[0]; // make mediaStream available to console
    // Older browsers may not have srcObject
    if ('srcObject' in remoteVideo) {
      remoteVideo.srcObject = e.streams[0];
    } else {
      // Avoid using this in new browsers, as it is going away.
      remoteVideo.src = window.URL.createObjectURL(e.streams[0]);
    }
    remoteVideo.onloadedmetadata = function(e) {
      remoteVideo.play();
    };
    trace('Recieved peer remote stream');
  }
}


// Screen Sharing function

function startScreenSharing() {
  window.setTimeout(function() {
    getScreenMedia(function(err, stream) {
      if (err) {
        console.log('failed: ' + err);
      } else {
        console.log('got a stream', stream);
        someScreen.src = URL.createObjectURL(stream);
      }
    });
  }, 500);
};

function hangup() {
  hangupButton.disabled = true;
  trace('Ending call');
  rtcPeerConn.close();
  rtcPeerConn = null;
  socket.emit('call_ended', {
    room: signalRoom,
    socket: socket.id,
    nickname: nickname.val(),
  });

  socket.disconnect();
}

function onHangup(payload) { //Handle the hangup event
  alert(payload.nickname + ' Has Hangup');
  hangupButton.disabled = true;
  rtcPeerConn.close();
  rtcPeerConn = null;
  socket.disconnect();

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
  var canvas = document.createElement('canvas');
  canvas.width = width || video.videoWidth;
  canvas.height = height || video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  return canvas.toDataURL('image/webp');

}


//Joins the socket to the rooms
function joinRoom(room) {
  console.log('ReQ Join', room);
  socket.emit('join-room', {room: room, nickname: nickname.val()});
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
                <img src="${takeScreenshot(localVideo)}">
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
                <img src="https://lh6.googleusercontent.com/-lr2nyjhhjXw/AAAAAAAAAAI/AAAAAAAARmE/MdtfUmC0M4s/photo.jpg?sz=48">
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
* Appends new income file to the chat box
* @param String mes
* */
function appendReceivedFile(file) {
  var li = `<li>
            <div class="msj macro">
              <div class="avatar">
                <img src="https://lh6.googleusercontent.com/-lr2nyjhhjXw/AAAAAAAAAAI/AAAAAAAARmE/MdtfUmC0M4s/photo.jpg?sz=48">
              </div>
              <div class="text text-l">
                <a href="${file.url}" download="${file.fileName}" target="_blank">${file.fileName} <i class="fas fa-download"></i></a>
                <p class="text-info"><b>${file.nickname}</b> <small>${moment().format('LT')}</small></p>
              </div>
            </div>
          </li>`;
  $('#messages').append(li);
}

function appendSentFile(file) {
  var li = `<li>
            <div class="msj-rta macro">
              <div class="text text-r">
                <a href="${file.url}" download="${file.fileName}" target="_blank">${file.fileName} <i class="fas fa-download"></i></a>
                <p class="text-dark"><b>${file.nickname}</b> <small>${moment().format('LT')}</small></p>
              </div>
              <div class="avatar">
                <img src="${takeScreenshot(localVideo)}">
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