function jquery() {
  $.noConflict();
  jQuery(document).ready(function($) {
    $('form').submit(function() {
      event.preventDefault();
      $('#header').hide();
      $('#before-join').hide();
      $('#after-join').show();
    });
  });
}

$(function() {
  loader();
  jquery();
});

var load;

function loader() {
  load = setTimeout(showPage, 1000);
}

function showPage() {
  document.getElementById('loader').style.display = 'none';
  document.getElementById('header').style.display = 'block';
  document.getElementById('before-join').style.display = 'block';
}

