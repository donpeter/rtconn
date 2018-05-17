var fileTranfer;
$(function() {
  fileTranfer = $('#file-transfer');
  var invite = $('#invite');

  invite.click(function() {
    copyToClipboard(window.location.href);
    invite.attr('title', 'Invite URL Copied');
    invite.tooltip('enable');
    invite.tooltip('show');
    setTimeout(function() {
      invite.tooltip('disable');
      invite.attr('title', '');
    }, 2000); //Disabele Tooltip after 2s
    // alert('Copied');
  });
  setTimeout(showSetupPage, 1000); //Used to simulated WebRTC setup delay
  $('#joinCallForm').submit(function(e) {
    e.preventDefault();
    showTextChatPage();
  });
  $('#openTextChat').click(toggleTextChat);
  $('#closeTextChat').click(toggleTextChat);
  fileTranfer.hide();
  $('#shareFile').click(showFileTransfer);
  $('#closeFile').click(showTextMesage);


});

function showFileTransfer() {
  fileTranfer.show();
  $('#text-message').hide();
  $('.progress-bar').hide();
}

function showTextMesage() {
  fileTranfer.hide();
  $('#text-message').show();
  $('.progress-bar').hide();
}
/*
* This function show the Setup page
* Which is the page where users select and setup webcam that will be used
**/
function showSetupPage() {
  $('#loader').hide();
  $('#before-join').show();
  $('#after-join').hide();
  $('#nickname').focus();
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
  $('#usersVideo').addClass('col-md-7')
    .removeClass('col-md-10');
  $('#openTextChat').hide(speed);
  $('[role="textChatBox"]').show(speed);
  $('input[name="chat"]').focus();
}

/*
* Close the Chat box for text massaging
* */
function closeTextChat() {
  var speed= 500;
  // $('#usersVideo').toggleClass('col-md-7 col-md-10');
  $('#openTextChat').show(speed);
  $('[role="textChatBox"]').slideUp(speed, function(){

    $('#usersVideo').addClass('col-md-10')
      .removeClass('col-md-7');
  });

}

/*
* Opens/Close the Chat box for text massaging
* */
function toggleTextChat() {
  $('[role="textChatBox"]').is( ":hidden" ) ? openTextChat() : closeTextChat();
}

/*
* Copies string to the clipboard*/
function copyToClipboard(str) {
  const el = document.createElement('textarea');
  el.value = str;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

/*
* Display a dismissible error to the page*/
function displayError(err) {
  var errorDiv = $('errorMessages');
  if (errorDivr) {
    errorDiv.append('<p>' + msg + '</p>');
  }
}