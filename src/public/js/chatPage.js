$(function() {
  setTimeout(showSetupPage, 1000); //Used to simulated WebRTC setup delay
  $('#joinCallForm').submit(function(e) {
    e.preventDefault();
    showTextChatPage();
  });
  $('#openTextChat').click(toggleTextChat);
  $('#closeTextChat').click(toggleTextChat);
});

/*
* This function show the Setup page
* Which is the page where users select and setup webcam that will be used
**/
function showSetupPage() {
  $('#loader').hide();
  $('#before-join').show();
  $('#after-join').hide();
}

/*
* Displays the main page for chat
* After user has successfully join a room
* */
function showTextChatPage() {
  $('#loader').hide();
  $('#before-join').hide();
  $('#after-join').show();
  $('footer').hide();
  $('header').hide();
  $('div.container').removeClass('container')
    .addClass('container-fluid')
}

/*
* Opens the Chat box for text massaging
* */
function openTextChat() {
  var speed= 500;
  $('#usersVideo').toggleClass('col-md-7 col-md-10');
  $('#openTextChat').hide(speed);
  $('[role="textChatBox"]').show(speed);
}

/*
* Close the Chat box for text massaging
* */
function closeTextChat() {
  var speed= 500;
  // $('#usersVideo').toggleClass('col-md-7 col-md-10');
  $('#openTextChat').show(speed);
  $('[role="textChatBox"]').slideUp(speed, function(){
    $('#usersVideo').toggleClass('col-md-7 col-md-10')
  });

}

/*
* Opens/Close the Chat box for text massaging
* */
function toggleTextChat() {
   $('[role="textChatBox"]').is( ":hidden" ) ? openTextChat() : closeTextChat();
}

