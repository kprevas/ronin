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
var roninDBHome = file( "ronindb" )
var roninitHome = file( "roninit" )
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

function cleanRoninDB() {
  roninDBHome.file( "build" ).deleteRecursively()
}

@Depends({"deps"})
function buildRoninDB() {
  buildRoninModule( roninDBHome, classpath( lib.fileset() ).
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

@Depends( {"deps", "buildRoninLog", "buildRonin", "buildRoninDB"} )
function buildRoninit() {

  buildRoninModule( roninitHome, classpath( lib.fileset() ).
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

/* Build the entire ronin project into build/ronin.zip */
@Depends( {"deps", "buildRoninLog", "buildRonin", "buildRoninDB", "buildRoninit", "buildRoblog"} )
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
@Depends( {"cleanRoninLog", "cleanRonin", "cleanRoninDB", "cleanRoninit", "cleanRoblog"} )
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
