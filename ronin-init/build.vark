
/* Creates the init template */
function buildTemplate() {
  var target = file( "target/ronin-template" )
  target.mkdirs()
  Ant.zip( :destfile = target.file( "ronin-template.zip" ), :basedir = file( "template" ) )
  Ant.copy( :todir = target, :file = file("init.vark") )
}