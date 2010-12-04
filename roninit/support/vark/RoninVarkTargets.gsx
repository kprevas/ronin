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
      this.logWarn( "GOSU_HOME is not defined, using the Gosu distribution bundled with Aardvark" )
      return new File( new File( gw.vark.Aardvark.Type.BackingClass.ProtectionDomain.CodeSource.Location.Path ).ParentFile, "gosu" )
    }
  }

  /* Starts up a Ronin environment with a working H2 database */
  @gw.vark.annotations.Target
  function server() {
    var cp = this.classpath( this.file( "support" ).fileset() )
               .withFileset( this.file( "lib" ).fileset() )
               .withFileset( GosuFiles.fileset() )
    this.logInfo( "Starting server in shared-memory debug mode at ${RoninAppName}" )
    this.Ant.java( :classpath=cp,
                   :jvmargs="-Xdebug -Xrunjdwp:transport=dt_shmem,server=y,suspend=n,address=${RoninAppName}",
                   :classname="ronin.DevServer",
                   :fork=true,
                   :args="server 8080 " + this.file(".").AbsolutePath )
  }

  /* Starts an H2 shell against the applications database (should be run in conjunction with the 'server' target. */
  @gw.vark.annotations.Target
  function h2shell() {
    DriverManager.registerDriver( new org.h2.Driver() )
    Shell.main( {'-url', 'jdbc:h2:tcp://localhost/./runtime/h2/'}  )
  }
}