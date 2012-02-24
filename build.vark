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

var roninLogHome = file( "roninlog" )
var roninHome = file( "ronin" )
var roninitHome = file( "roninit" )
var ronintestHome = file( "ronintest" )
var roblogHome = file( "roblog" )
var lib = file( "lib" )

function deps() {
  Ivy.configure(:file = file("ivy-settings.xml"))
  Ivy.retrieve(:sync = true, :log = "download-only")
}

function cleanRoninLog() {
  roninLogHome.file( "build" ).deleteRecursively()
}

@Depends({"deps"})
function buildRoninLog() {
  buildRoninModule( roninLogHome, classpath( lib.fileset() ).
                                 withFileset( gosuHome.file( "jars" ).fileset() ).
                                 withFileset( gosuHome.file( "ext" ).fileset() ) )
}

function cleanRonin() {
  roninHome.file( "build" ).deleteRecursively()
}

@Depends({"deps"})
function buildRonin() {
  buildRoninModule( roninHome, classpath( lib.fileset() ).
                                 withFileset( gosuHome.file( "jars" ).fileset() ).
                                 withFileset( gosuHome.file( "ext" ).fileset() ) )
}

function cleanRoblog() {
  roblogHome.file( "build" ).deleteRecursively()
}

@Depends({"deps"})
function buildRoblog() {
  buildRoninModule( roblogHome, classpath( lib.fileset() ).
                                 withFileset( gosuHome.file( "jars" ).fileset() ).
                                 withFileset( gosuHome.file( "ext" ).fileset() ) )
}

function cleanRoninit() {
  roninitHome.file( "build" ).deleteRecursively()
}

@Depends( {"deps", "buildRoninLog", "buildRonin"} )
function buildRoninit() {

  buildRoninModule( roninitHome, classpath( lib.fileset() ).
                                withFile( roninHome.file( "build" ).file( "ronin.jar" )).
                                 withFileset( gosuHome.file( "jars" ).fileset() ).
                                  withFileset( gosuHome.file( "ext" ).fileset() ) )

  var filesDir = roninitHome.file( "build/files" )
  filesDir.mkdirs()
  
  var templateDir = roninitHome.file( "build/files/template" )
  templateDir.mkdirs()

  // Copy in the base template stuff
  Ant.copy( :filesetList = {roninitHome.file("template").fileset(:excludes=".gitignore") },
            :todir = templateDir )

  Ant.copy( :filesetList = {roninitHome.file("build/classes").fileset( :includes="ronin/Roninit.class" )},
            :todir = filesDir )

  Ant.jar( :destfile = roninitHome.file( "build/roninit_template.jar" ),
           :manifest = roninitHome.file( "src/MANIFEST.MF" ),
           :basedir = filesDir )
}

function cleanRonintest() {
  ronintestHome.file( "build" ).deleteRecursively()
}

@Depends( {"deps", "buildRoninLog", "buildRonin"} )
function buildRonintest() {
  buildRoninModule( ronintestHome, classpath( lib.fileset() ).
                                withFile( roninHome.file( "build" ).file( "ronin.jar" )).
                                 withFileset( gosuHome.file( "jars" ).fileset() ).
                                  withFileset( gosuHome.file( "ext" ).fileset() ) )
}

/* Build the entire ronin project into build/ronin.zip */
@Depends( {"deps", "buildRoninLog", "buildRonin", "buildRoninit", "buildRonintest", "buildRoblog"} )
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

/* Run tests */
@Depends({"build"})
@Target
function test(log:boolean = false) {
  var cp = classpath(file("lib").fileset())
             .withFile(roninHome.file("build").file("ronin.jar"))
             .withFile(ronintestHome.file("build").file("ronintest.jar"))
             .withFile(ronintestHome.file("src-test"))
             .withFile(roninitHome.file("build").file("roninit.jar"))
             .withFileset(gosuHome.file("jars").fileset())
  if(log) {
    cp = cp.withFile(roninLogHome.file("build").file("roninlog.jar"))
  }

  Ant.java(:classpath=cp,
                 :classname="ronin.TestScanner",
                 :jvmargs=DebugString + (log ? " -Dronin.trace" : ""),
                 :fork=true,
                 :failonerror=true,
                 :args=ronintestHome.file("src-test").AbsolutePath)
}


/* Clean all build artifacts */
@Depends( {"cleanRoninLog", "cleanRonin", "cleanRoninit", "cleanRonintest", "cleanRoblog"} )
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

property get DebugString() : String {
  var debugStr : String
  if(gw.util.Shell.isWindows()) {
    logInfo("Starting in shared-memory debug mode at \"ronin\"")
    debugStr = "-Xdebug -Xrunjdwp:transport=dt_shmem,server=y,suspend=n,address=ronin"
  } else {
    logInfo("Starting in socket debug mode at 8088")
    debugStr = "-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=8088"
  }
  return debugStr
}
