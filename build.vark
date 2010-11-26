uses java.io.File
uses java.lang.System
uses gw.vark.Aardvark
uses org.apache.tools.ant.types.Path

//=======================================================================
// Change to gosu distro home 
//=======================================================================

var gosuHome = file( "C:/gosu-0.7.0.1-C" )

//=======================================================================
// 
//=======================================================================

var roninHome = file( "ronin" )
var roninDBHome = file( "ronindb" )
var roninitHome = file( "roninit" )
var lib = file( "lib" )

function cleanRonin() {
  roninHome.file( "build" ).deleteRecursively()
}

function buildRonin() {
  buildRoninModule( roninHome, classpath( lib.fileset() ).
                                 withFileset( gosuHome.file( "jars" ).fileset() ) )
}

function cleanRoninDB() {
  roninDBHome.file( "build" ).deleteRecursively()
}

function buildRoninDB() {
  buildRoninModule( roninDBHome, classpath( lib.fileset() ).
                                 withFileset( gosuHome.file( "jars" ).fileset() ) )
}

function cleanRoninInit() {
  roninitHome.file( "build" ).deleteRecursively()
}
function cleanRoninit() {
  roninitHome.file( "build" ).deleteRecursively()
}

@Depends( {"buildRonin", "buildRoninDB"} )
function buildRoninit() {
  buildRoninModule( roninitHome, classpath( roninitHome.file("support").fileset() ).
                                 withFileset( gosuHome.file( "jars" ).fileset() ) )
  var filesDir = roninitHome.file( "build/files" )
  filesDir.mkdirs()
  var libDir = filesDir.file( "lib" )
  libDir.mkdir()
  Ant.copy( :filesetList = {roninHome.file("build").fileset( :includes="*.jar" ),
                            roninDBHome.file("build").fileset( :includes="*.jar" ) },
            :todir = libDir )
  Ant.copy( :filesetList = {roninitHome.fileset( :excludes="src/**,build/**,.idea/**,*.iml" ) },
            :todir = filesDir )
  Ant.copy( :filesetList = {roninitHome.file("build").fileset( :includes="*.jar" ) },
            :todir = filesDir.file( "support" ) )
}

/* Build the entire ronin project into build/ronin.zip */
@Depends( {"buildRonin", "buildRoninDB", "buildRoninit"} )
function build() {
  Ant.zip(:destfile = file("build/ronin.zip"), :basedir = roninitHome.file("build/files") )
}

/* Clean all build artifacts */
@Depends( {"cleanRonin", "cleanRoninDB", "cleanRoninit"} )
function clean() {
  file("build").deleteRecursively()
}

function buildRoninModule( root : File, cp : Path ) {
  var classesDir = root.file( "build/classes" )
  classesDir.mkdirs()
  Ant.javac( :srcdir = path(root.file("src")),
             :destdir = classesDir,
             :classpath = cp,
             :debug = true,
             :includeantruntime = false)
  Ant.copy( :filesetList = {root.file( "src" ).fileset( :excludes = "**/*.java") },
            :todir = classesDir )
  Ant.jar( :destfile = root.file( "build/${root.Name}.jar" ), 
           :basedir = classesDir )

}

function createDist() {
  print( "Creating Ronin Distribution..." )
}
