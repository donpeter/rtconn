$(function() {
  setTimeout(showSetupPage, 1000);
  $('#cameraForm').submit(function(e) {
    e.preventDefault();
    showChatPage();
  });
});

function showSetupPage() {
  $('#loader').hide();
  $('#before-join').show();
  $('#after-join').hide();
}

function showChatPage() {
  $('#loader').hide();
  $('#before-join').hide();
  $('#after-join').show();
  $('footer').hide();
}
