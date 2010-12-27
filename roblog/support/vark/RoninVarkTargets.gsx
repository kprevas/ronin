package vark

uses java.io.File
uses java.lang.System
uses java.lang.Class
uses java.sql.DriverManager
uses gw.vark.Aardvark
uses org.mortbay.jetty.Server
uses org.mortbay.jetty.webapp.WebAppContext
uses org.h2.tools.Shell

enhancement RoninVarkTargets : gw.vark.AardvarkFile {

  property get RoninAppName() : String {
    return this.file(".").ParentFile.Name
  }

  property get GosuFiles() : File {
    var gosuHome = System.getenv()["GOSU_HOME"] as String
    if(gosuHome != null) {
      return new File( gosuHome, "jars" )
    } else {
      this.logWarn( "\n  Warning: GOSU_HOME is not defined, using the Gosu distribution bundled with Aardvark." +
                    "\n  Ideally, you should define the GOSU_HOME environment variable.\n" )
      return new File( new File( gw.vark.Aardvark.Type.BackingClass.ProtectionDomain.CodeSource.Location.Path ).ParentFile, "gosu" )
    }
  }

  /* Starts up a Ronin environment with a working H2 database */
  @gw.vark.annotations.Target
  function server() {
    var cp = this.classpath( this.file( "support" ).fileset() )
               .withFileset( this.file( "lib" ).fileset() )
               .withFileset( GosuFiles.fileset() )
    this.Ant.java( :classpath=cp,
                   :jvmargs=DebugString,
                   :classname="ronin.DevServer",
                   :fork=true,
                   :args="server 8080 " + this.file(".").AbsolutePath )
  }

  /* Clears and reinitializes the database */
  @gw.vark.annotations.Target
  function resetDb() {
    var cp = this.classpath( this.file( "support" ).fileset() )
               .withFileset( this.file( "lib" ).fileset() )
               .withFileset( GosuFiles.fileset() )
    this.Ant.java( :classpath=cp,
                   :jvmargs=DebugString,
                   :classname="ronin.DevServer",
                   :fork=true,
                   :args="upgrade_db " + this.file(".").AbsolutePath )
  }

  /* Deletes the build directory */
  @gw.vark.annotations.Target
  function clean() {
    this.file("build").deleteRecursively()
  }

  /* creates a war from the current ronin project */
  @gw.vark.annotations.Target
  function makeWar() {

    // copy over the html stuff
    var warDir = this.file( "build/war" )
    warDir.mkdirs()
    this.Ant.copy( :filesetList = { this.file("html").fileset() },
              :todir = warDir )

    // copy in the classes
    var webInfDir = this.file( "build/war/WEB-INF" )
    var classesDir = webInfDir.file( "classes" )
    classesDir.mkdirs()
    this.Ant.copy( :filesetList = { this.file("src").fileset() },
              :todir = classesDir )

    // copy in the libraries
    var libDir = webInfDir.file( "lib" )
    libDir.mkdirs()
    this.Ant.copy( :filesetList = { this.file("lib").fileset() },
              :todir = libDir )

    // copy in the Gosu libraries
    this.Ant.copy( :filesetList = { GosuFiles.fileset() },
              :todir = libDir )

    var warName = this.file(".").ParentFile.Name + ".war"
    var warDest = this.file( "build/${warName}" )
    this.Ant.jar( :destfile = warDest,
             :basedir = warDir )

    this.logInfo("\n\n  A java war file was created at ${warDest.AbsolutePath}")
  }

  property get DebugString() : String {
    var debugStr : String
    if(gw.util.Shell.isWindows()) {
      this.logInfo( "Starting server in shared-memory debug mode at ${RoninAppName}" )
      debugStr = "-Xdebug -Xrunjdwp:transport=dt_shmem,server=y,suspend=n,address=${RoninAppName}"
    } else {
      this.logInfo( "Starting server in socket debug mode at 8088" )
      debugStr = "-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=8088"
    }
    return debugStr
  }

}