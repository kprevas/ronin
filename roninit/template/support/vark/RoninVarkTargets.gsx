package vark

uses java.io.File
uses java.lang.System
uses java.lang.Class
uses gw.vark.Aardvark
uses gw.vark.annotations.*

enhancement RoninVarkTargets : gw.vark.AardvarkFile {

  property get RoninAppName() : String {
    return this.file(".").ParentFile.Name
  }

  property get GosuFiles() : File {
    var gosuHome = System.getenv()["GOSU_HOME"] as String
    if(gosuHome != null) {
      return new File(gosuHome, "jars")
    } else {
      this.logWarn("\n  Warning: GOSU_HOME is not defined, using the Gosu distribution bundled with Aardvark." +
                    "\n  Ideally, you should define the GOSU_HOME environment variable.\n")
      return new File(new File(gw.vark.Aardvark.Type.BackingClass.ProtectionDomain.CodeSource.Location.Path).ParentFile, "gosu")
    }
  }

  /* Retrieves dependencies as configured in ivy.xml */
  @Target
  function deps() {
    this.Ivy.configure(:file = this.file("ivy-settings.xml"))
    this.Ivy.retrieve(:pattern = "[conf]/[artifact]-[revision](-[classifier]).[ext]", :log = "download-only")
  }

  /* Starts up a Ronin environment with a working H2 database */
  @Target
  @Depends({"deps"})
  @Param("waitForDebugger", "Set to \"y\" to suspend the server until a debugger connects.")
  @Param("startDB", "Set to \"n\" to suppress starting the H2 web server.")
  function server(waitForDebugger : String = "n", startDB : String = "y") {
    var cp = this.classpath(this.file("support").fileset())
               .withFileset(this.file("lib").fileset())
               .withFileset(GosuFiles.fileset())
    this.Ant.java(:classpath=cp,
                   :jvmargs=getDebugString(waitForDebugger),
                   :classname="ronin.DevServer",
                   :fork=true,
                   :failonerror=true,
                   :args="server${startDB == "y" ? "" : "-nodb"} 8080 " + this.file(".").AbsolutePath)
  }

  /* Clears and reinitializes the database */
  @Target
  @Depends({"deps"})
  @Param("waitForDebugger", "Set to \"y\" to suspend the server until a debugger connects.")
  function resetDb(waitForDebugger : String = "n") {
    var cp = this.classpath(this.file("support").fileset())
               .withFileset(this.file("lib").fileset())
               .withFileset(GosuFiles.fileset())
    this.Ant.java(:classpath=cp,
                   :jvmargs=getDebugString(waitForDebugger),
                   :classname="ronin.DevServer",
                   :fork=true,
                   :failonerror=true,
                   :args="upgrade_db " + this.file(".").AbsolutePath)
  }

  /* Verifies your application code */
  @Target
  @Depends({"deps"})
  @Param("waitForDebugger", "Set to \"y\" to suspend the server until a debugger connects.")
  function verifyApp(waitForDebugger : String = "n") {

    var cp = this.classpath(this.file("support").fileset())
               .withFileset(this.file("lib").fileset())
               .withFile(this.file("src"))
               .withFileset(GosuFiles.fileset())

    this.Ant.java(:classpath=cp,
                   :classname="ronin.DevServer",
                   :jvmargs=getDebugString(waitForDebugger),
                   :fork=true,
                   :failonerror=true,
                   :args="verify_ronin_app")
  }

  /* Deletes the build directory */
  @Target
  function clean() {
    this.file("build").deleteRecursively()
    this.Ant.delete(:filesetList = {this.file("lib").fileset()})
    this.Ant.delete(:filesetList = {this.file("support").fileset(:excludes="vark/*")})
  }

  /* creates a war from the current ronin project */
  @Target
  @Depends({"deps"})
  function makeWar() {

    // copy over the html stuff
    var warDir = this.file("build/war")
    warDir.mkdirs()
    this.Ant.copy(:filesetList = { this.file("html").fileset() },
              :todir = warDir)

    // copy in the classes
    var webInfDir = this.file("build/war/WEB-INF")
    var classesDir = webInfDir.file("classes")
    classesDir.mkdirs()
    this.Ant.copy(:filesetList = { this.file("src").fileset() },
              :todir = classesDir)

    // copy in the database specifications
    var warDbDir = webInfDir.file("db")
    var dbDir = this.file("db")
    if(dbDir.exists()) {
      warDbDir.mkDirs()
      this.Ant.copy(:filesetList = { dbDir.fileSet() },
              :todir = warDbDir)
    }

    // copy in the libraries
    var libDir = webInfDir.file("lib")
    libDir.mkdirs()
    this.Ant.copy(:filesetList = { this.file("lib").fileset() },
              :todir = libDir)

    // copy in the Gosu libraries
    this.Ant.copy(:filesetList = { GosuFiles.fileset() },
              :todir = libDir)

    var warName = this.file(".").ParentFile.Name + ".war"
    var warDest = this.file("build/${warName}")
    this.Ant.jar(:destfile = warDest,
             :basedir = warDir)

    this.logInfo("\n\n  A java war file was created at ${warDest.AbsolutePath}")
  }

  /* Runs the tests associated with your app */
  @Target
  @Depends({"deps"})
  @Param("waitForDebugger", "Set to \"y\" to suspend the server until a debugger connects.")
  function test(waitForDebugger : String = "n") {
    var cp = this.classpath(this.file("support").fileset())
               .withFileset(this.file("lib").fileset())
               .withFile(this.file("src"))
               .withFile(this.file("test"))
               .withFileset(GosuFiles.fileset())

    this.Ant.java(:classpath=cp,
                   :classname="ronin.DevServer",
                   :jvmargs=getDebugString(waitForDebugger),
                   :fork=true,
                   :failonerror=true,
                   :args="test ${this.file("test").AbsolutePath}")
  }

  function getDebugString(suspend : String) : String {
    var debugStr : String
    if(gw.util.Shell.isWindows()) {
      this.logInfo("Starting server in shared-memory debug mode at ${RoninAppName}")
      debugStr = "-Xdebug -Xrunjdwp:transport=dt_shmem,server=y,suspend=${suspend},address=${RoninAppName}"
    } else {
      this.logInfo("Starting server in socket debug mode at 8088")
      debugStr = "-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=${suspend},address=8088"
    }
    return debugStr
  }

}