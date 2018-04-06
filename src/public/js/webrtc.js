//Variables
var myVideo = document.querySelector('#myVideoPreview');
var users = ['donpeter', 'patunalu', 'dubem', 'chidubem']; // used for testing
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
  }
}
console.log(navigator.mediaDevices);
//Set video constrain
var myVideoConstrain = {
  audio: false,
  video: {height: {min: 400}},
  facingMode: true,
};

addUserMedia(myVideo, myVideoConstrain);
$(function() {
  $('#joinCallForm').submit(function(e) {
    e.preventDefault();
    // myVideo.stop();
    //Update user video variable
    var myVideo = document.querySelector('#myVideo');
    //Set video constrain
    var myVideoConstrain = {
      audio: false,
      video: {width: {max: 200}, height: {max: 250}}
    };
    addUserMedia(myVideo, myVideoConstrain);
    users.forEach(function(user) {
      var videos = document.querySelector('#'+user);
      addUserMedia(videos, {
        audio: false,
        video: {width: 1024}
      });

    })
  })
});

/*
* Add uses media on select video element
* @param DomEle video, Object constrain
* */
function addUserMedia(video, constrain) {
  constrain = constrain || { audio: true, video: true};
  navigator.mediaDevices.getUserMedia(constrain)
    .then(function(stream) {
      // Older browsers may not have srcObject
      if ("srcObject" in video) {
        video.srcObject = stream;
      } else {
        // Avoid using this in new browsers, as it is going away.
        video.src = window.URL.createObjectURL(stream);
      }
      video.onloadedmetadata = function(e) {
        video.play();
      };
    })
    .catch(function(err) {
      console.log(err.name + ": " + err.message);
    });
}