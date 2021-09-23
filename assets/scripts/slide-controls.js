$(function() {

  function add_controls() {
    $slideControls = $('.slide-controls').clone();
    $slideControls.css('display', 'block')
    const PREFIX = 'umt-slide-';
    let last = 0
    $('.umt-slide').each(function(i, section) {
      $(this).attr('id', PREFIX + String(i))
      $(this).append($slideControls.clone())
      last = i
    });
    let begin = PREFIX + '0';
    let end = PREFIX + last;
    $('.umt-slide').each(function(i, section) {
      let previous = (i === 0) ? PREFIX + String(i) : PREFIX + String(i - 1);
      let next = (i === last) ? PREFIX + String(i) : PREFIX + String(i + 1);
      $('.first-control a', $(this)).attr('href', '#' + begin);
      $('.previous-control a', $(this)).attr('href', '#' + previous);
      $('.next-control a', $(this)).attr('href', '#' + next);
      $('.last-control a', $(this)).attr('href', '#' + end);
    });    
  }

  add_controls();
  
});
