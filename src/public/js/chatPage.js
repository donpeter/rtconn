$(function() {
  setTimeout(showSetupPage, 1000);
  $('#cameraForm').submit(function(e) {
    e.preventDefault();
    showTextChatPage();
  });
  $('#openTextChat').click(toggleTextChat);
  $('#closeTextChat').click(toggleTextChat);
});

function showSetupPage() {
  $('#loader').hide();
  $('#before-join').show();
  $('#after-join').hide();
}
function showTextChatPage() {
  $('#loader').hide();
  $('#before-join').hide();
  $('#after-join').show();
  $('footer').hide();
  $('header').hide();
  $('div.container').removeClass('container')
    .addClass('container-fluid')
}
function openTextChat() {
  var speed= 500;
  $('[role="videoChatBox"]').toggleClass('col-md-7 col-md-10');
  $('#openTextChat').hide(speed);
  $('[role="textChatBox"]').show(speed);
}
function closeTextChat() {
  var speed= 500;
  // $('[role="videoChatBox"]').toggleClass('col-md-7 col-md-10');
  $('#openTextChat').show(speed);
  $('[role="textChatBox"]').slideUp(speed, function(){
    $('[role="videoChatBox"]').toggleClass('col-md-7 col-md-10')
  });

}
function toggleTextChat() {
   $('[role="textChatBox"]').is( ":hidden" ) ? openTextChat() : closeTextChat();
}
