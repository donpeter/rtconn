$(function() {
  typeWriter('typer', 'Truly simple video chat and screen sharing for group');
});


var i = 0;

function typeWriter(id, txt, speed = 50) {
  if (i < txt.length) {
    document.getElementById(id).innerHTML += txt.charAt(i);
    i++;
    setTimeout(typeWriter, speed, id, txt, speed);
  }
}


