
function scrollToSection(section) {
  var section = $('#' + section);
  if(section != null){
    if($.browser.webkit) {
     $('body').animate({ scrollTop: sec.offset().top - 50 }, 'fast');
    } else {
     $('html').animate({ scrollTop: sec.offset().top - 50 }, 'fast');
    }
  }
}
