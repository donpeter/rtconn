$(function() {
  var roomNameInput = $('input[name="roomName"]');
  typeWriter('typer', 'Truly simple video chat and screen sharing for group');
  $('#joinRoom').submit(function(e) {
    // Prevent form submission and redirect user inputed room name
    e.preventDefault();
    roomName = roomNameInput.val().trim();
    roomName ? window.location.pathname = roomName : null;
  });
  // Generate a Random Name and assign it to roomName input
  var randomRoomName = randomName();
  // roomNameInput.val(randomRoomName);

  /*
  * Clears the input if  the roomName is equal to the generated random name
  **/
  roomNameInput.focus(function() {
    roomName = roomNameInput.val().trim();
    if (roomName == randomRoomName) {
      roomNameInput.val('');
    }
  });

  /*
  * Set a random generated room name and trims the input for any white space
  * */
  roomNameInput.blur(function() {
    roomName = roomNameInput.val().trim();

    !roomName ? roomNameInput.val(randomRoomName) : roomNameInput.val(roomName);
  });

});


var i = 0;

function typeWriter(id, txt, speed = 50) {
  if (i < txt.length) {
    document.getElementById(id).innerHTML += txt.charAt(i);
    i++;
    setTimeout(typeWriter, speed, id, txt, speed);
  }
}

function randomName(length) {
  return 'randomRoomName';
}


