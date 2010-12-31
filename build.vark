uses java.io.File
uses java.lang.System
uses gw.vark.Aardvark
uses org.apache.tools.ant.types.Path

//=======================================================================
// Change to gosu distro home 
//=======================================================================

var ghVar = System.getenv( "GOSU_HOME" )
if(ghVar == null) {
  Ant.fail( :message = "Please define the GOSU_HOME system variable" )
}
var gosuHome = file( ghVar )

//=======================================================================
// 
//=======================================================================

var roninHome = file( "ronin" )
var roninDBHome = file( "ronindb" )
var roninitHome = file( "roninit" )
var roblogHome = file( "roblog" )
var lib = file( "lib" )

function cleanRonin() {
  roninHome.file( "build" ).deleteRecursively()
}

function buildRonin() {
  buildRoninModule( roninHome, classpath( lib.fileset() ).
                                 withFileset( gosuHome.file( "jars" ).fileset() ) )
  Ant.copy( :file = roninHome.file("build/ronin.jar"),
            :todir = roblogHome.file( "lib" ) )
}

function cleanRoninDB() {
  roninDBHome.file( "build" ).deleteRecursively()
}

function buildRoninDB() {
  buildRoninModule( roninDBHome, classpath( lib.fileset() ).
                                 withFileset( gosuHome.file( "jars" ).fileset() ) )
}

function cleanRoblog() {
  roblogHome.file( "build" ).deleteRecursively()
}

function buildRoblog() {
  buildRoninModule( roblogHome, classpath( lib.fileset() ).
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

  buildRoninModule( roninitHome, classpath( roninitHome.file("template/support").fileset() ).
                                 withFileset( lib.fileset() ).
                                 withFileset( gosuHome.file( "jars" ).fileset() ) )

  var filesDir = roninitHome.file( "build/files" )
  filesDir.mkdirs()
  
  var templateDir = roninitHome.file( "build/files/template" )
  templateDir.mkdirs()

  // Copy in the base template stuff
  Ant.copy( :filesetList = {roninitHome.file("template").fileset() },
            :todir = templateDir )

  // copy in latest ronin/ronindb jars
  var libDir = templateDir.file( "lib" )
  libDir.mkdir()
  Ant.copy( :filesetList = {roninHome.file("build").fileset( :includes="*.jar" ),
                            roninDBHome.file("build").fileset( :includes="*.jar" ),
                            file("lib").fileset( :includes="*.jar", :excludes="junit*.jar,servlet-api*.jar" ) },
            :todir = libDir )
            
  // copy junit to support dir 
  Ant.copy( :filesetList = { file("lib").fileset( :includes="junit*.jar" ) },
            :todir = templateDir.file("support") )

  // Copy roninit to support for the dev server, etc.      
  Ant.copy( :file = roninitHome.file("build/roninit.jar"),
            :todir = templateDir.file( "support" ) )

  // Copy roninit to support for the dev server, etc.      
  Ant.copy( :filesetList = {roninitHome.file("build/classes").fileset( :includes="ronin/Roninit.class" )},
            :todir = filesDir )

  Ant.jar( :destfile = roninitHome.file( "build/roninit_template.jar" ),
           :manifest = roninitHome.file( "src/MANIFEST.MF" ),
           :basedir = filesDir )
}

/* Build the entire ronin project into build/ronin.zip */
@Depends( {"buildRonin", "buildRoninDB", "buildRoninit", "buildRoblog"} )
function build() {
  var files = file( "build/files/ronin" )
  files.mkdirs()
  
  Ant.copy( :file=roninitHome.file( "build/roninit_template.jar" ), :todir = files )
  Ant.copy( :filesetList={roninitHome.file( "misc" ).fileset()}, :todir = files )
  
  Ant.zip(:destfile = file("build/ronin.zip"), :basedir = files)

  Ant.tar(:destfile = file("build/ronin.tar"), :tarfilesetBlocks = {
    \ tfs -> {
      tfs.Dir = files
      tfs.setIncludes("roninit")
      tfs.setFileMode("755")
      tfs.setPrefix("ronin")
    },
    \ tfs -> {
      tfs.Dir = files
      tfs.setExcludes("roninit")
      tfs.setPrefix("ronin")
    }
  })
  Ant.gzip(:src = file("build/ronin.tar"), :destfile = file("build/ronin.tgz"))
}

/* Clean all build artifacts */
@Depends( {"cleanRonin", "cleanRoninDB", "cleanRoninit", "cleanRoblog"} )
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
           :manifest = root.file( "src/META-INF/MANIFEST.MF" ).exists() ? root.file( "src/META-INF/MANIFEST.MF" ) : null,
           :basedir = classesDir )

}
