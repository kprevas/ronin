
function scrollToSection(section) {
  var section = $('#' + section);
  if(section != null){
    if($.browser.webkit) {
     $('body').animate({ scrollTop: section.offset().top - 50 }, 'fast');
    } else {
     $('html').animate({ scrollTop: section.offset().top - 50 }, 'fast');
    }
  }
}
