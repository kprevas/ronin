
function scrollToSection(section) {
  var section = $('#' + section);
  if(section != null){
    $('body').animate({ scrollTop: section.offset().top - 50 }, 'fast');
  }
}
