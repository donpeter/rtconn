'use strict';

//Variables
var setupVideo = document.getElementById('setupVideo'),
  videoSelect = document.getElementById('videoSelect'),
  audioSelect = document.getElementById('audioSelect'),
  image = document.getElementById('screenshot');

var setupStream, videoQuality = 'autoConstraints';
var videoQualityBtn = $('.vQuality');

//Get video constrain
function getVideoConstrains(constrain) {
  var constrains = {
    autoConstraints: {
      video: {deviceId: {exact: videoSelect.value}},
      audio: {deviceId: {exact: audioSelect.value}},
    },
    fullHdConstraints: {
      video: {
        width: {exact: 1920},
        height: {exact: 1080},
        deviceId: {exact: videoSelect.value},
      },
      audio: {deviceId: {exact: audioSelect.value}},
    },
    hdConstraints: {
      video: {
        width: {exact: 1280},
        height: {exact: 720},
        deviceId: {exact: videoSelect.value},
      },
      audio: {deviceId: {exact: audioSelect.value}},
    },
    vgaConstraints: {
      video: {
        width: {exact: 640},
        height: {exact: 480},
        deviceId: {exact: videoSelect.value},
      },
      audio: {deviceId: {exact: audioSelect.value}},
    },
    qvgaConstraints: {
      video: {
        width: {exact: 320},
        height: {exact: 240},
        deviceId: {exact: videoSelect.value},
      },
      // audio: false,
      audio: {deviceId: {exact: audioSelect.value}},
    },
    videoOnlu: {
      video: {deviceId: {exact: videoSelect.value}},
      audio: false,
    },
    audioOnly: {
      video: false,
      // audio: false,
      audio: {deviceId: {exact: audioSelect.value}},
    },
  };
  return constrains[constrain];
}

$(function() {
  videoQualityBtn.click(setVideoQuality);
});

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
  //Stop Previous Steam
  stopStream(setupStream);
  var constraints = getVideoConstrains(videoQuality);
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
  console.log('################');
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
  errorMessage.show();
  errors.append('<p>' + msg + '</p>');
  if (typeof error !== 'undefined') {
    console.error(error);
  }
}

function setVideoQuality(e) {
  //Change style of selected element
  videoQualityBtn.removeClass('btn-secondary');
  videoQualityBtn.addClass('btn-info');
  e.target.classList.remove('btn-info');
  e.target.classList.add('btn-secondary');

  //Disable selected button
  videoQualityBtn.removeAttr('disabled');
  e.target.setAttribute('disabled', 'true');

  //Set videoQuality
  videoQuality = e.target.getAttribute('quality');

  //Get New stream
  getStream();
}

function stopStream(stream) {
  if (stream) {

    stream.getTracks().forEach(function(track) {
      track.stop();
    });
  }
}