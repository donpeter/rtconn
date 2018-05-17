'use strict';

//Variables
var setupVideo = document.getElementById('setupVideo'),
  videoSelect = document.getElementById('videoSelect'),
  audioSelect = document.getElementById('audioSelect'),
  image = document.getElementById('screenshot'),
  errorMessage = document.getElementById('errorMessages');

var setupStream;

//Get video constrain
function getVideoConstrains(constrain) {
  var constrains = {
    fullHdConstraints: {
      video: {
        width: {ideal: 1920},
        height: {ideal: 1080},
        deviceId: {exact: videoSelect.value},
      },
      audio: {deviceId: {exact: audioSelect.value}},
    },
    hdConstraints: {
      video: {
        width: {ideal: 1280},
        height: {ideal: 720},
        deviceId: {exact: videoSelect.value},
      },
      audio: {deviceId: {exact: audioSelect.value}},
    },
    vgaConstraints: {
      video: {
        width: {ideal: 640},
        height: {ideal: 480},
        deviceId: {exact: videoSelect.value},
      },
      // audio: false,
      audio: {deviceId: {exact: audioSelect.value}},
    },
    qvgaConstraints: {
      video: {
        width: {ideal: 320},
        height: {ideal: 240},
        deviceId: {exact: videoSelect.value},
      },
      // audio: false,
      audio: {deviceId: {exact: audioSelect.value}},
    },
  };
  return constrains[constrain];
}


// Older browsers might not implement mediaDevices at all, so we set an empty object first
if (navigator.mediaDevices === undefined) {
  navigator.mediaDevices = {};
}

// Some browsers partially implement mediaDevices. We can't just assign an object
// with getUserMedia as it would overwrite existing properties.
// Here, we will just add the getUserMedia property if it's missing.
if (navigator.mediaDevices.getUserMedia === undefined) {
  navigator.mediaDevices.getUserMedia = function(constraints) {

    // First get ahold of the legacy getUserMedia, if present
    var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    // Some browsers just don't implement it - return a rejected promise with an error
    // to keep a consistent interface
    if (!getUserMedia) {
      return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
    }

    // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
    return new Promise(function(resolve, reject) {
      getUserMedia.call(navigator, constraints, resolve, reject);
    });
  };
}

/*
* Get user devices list
* */
navigator.mediaDevices.enumerateDevices()
  .then(gotDevices).then(getStream).catch(handleGetUserMediaError);

audioSelect.onchange = getStream;
videoSelect.onchange = getStream;

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

//Get local video stream
function getStream() {
  stopStream(setupStream);

  var constraints = getVideoConstrains('vgaConstraints');


  navigator.mediaDevices.getUserMedia(constraints).then(gotStream).catch(handleGetUserMediaError);
}

//Plays the stream
function gotStream(stream) {
  setupStream = stream; // make stream available to console
  // Older browsers may not have srcObject
  if ('srcObject' in setupVideo) {
    setupVideo.srcObject = stream;
  } else {
    // Avoid using this in new browsers, as it is going away.
    setupVideo.src = window.URL.createObjectURL(stream);
  }
  setupVideo.onloadedmetadata = function(e) {
    setupVideo.play();
  };
}

//Handles WebRTC error
function handleGetUserMediaError(error) {
  if (error.name === 'ConstraintNotSatisfiedError') {
    errorMsg('The resolution ' + constraints.video.width.exact + 'x' +
      constraints.video.width.exact + ' px is not supported by your device.');
  } else if (error.name === 'PermissionDeniedError') {
    errorMsg('Permissions have not been granted to use your camera and ' +
      'microphone, you need to allow the page access to your devices in ' +
      'order for the demo to work.');
  }
  errorMsg('getUserMedia error: ' + error.name, error);
}

//Displays All error to user
function errorMsg(msg, error) {
  errorMessage.innerHTML += '<p>' + msg + '</p>';
  if (typeof error !== 'undefined') {
    console.error(error);
  }
}


function stopStream(stream) {
  if (stream) {

    stream.getTracks().forEach(function(track) {
      track.stop();
    });
  }
}