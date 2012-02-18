package vark

uses java.io.File
uses java.lang.System
uses java.lang.Class
uses java.util.Iterator
uses gw.util.Pair
uses gw.vark.*
uses gw.vark.annotations.*
uses gw.vark.antlibs.*
uses org.apache.tools.ant.types.FileSet
uses org.apache.tools.ant.types.selectors.FileSelector
uses org.apache.tools.ant.types.selectors.FilenameSelector
uses org.apache.tools.ant.Location

enhancement RoninVarkTargets : gw.vark.AardvarkFile {

  property get RoninAppName() : String {
    return this.file(".").ParentFile.Name
  }

  /* Compiles any Java classes */
  @Target
  function compile() {
    var classesDir = this.file("classes")
    classesDir.mkdirs()
    Ant.javac( :srcdir = this.path(this.file("src")),
               :destdir = classesDir,
               :classpath = this.classpath(this.file("src").fileset())
                                .withPath(fixedPom().dependencies(COMPILE, :additionalDeps = {
                new() { : GroupId = "org.gosu-lang.gosu", :ArtifactId = "gosu-core", :Version = "0.9-10" }
            }).Path),
        :debug = true,
        :includeantruntime = false)
  }

  /* Starts up a Ronin environment with a working H2 database */
  @Target
  @Depends({"compile"})
  @Param("waitForDebugger", "Suspend the server until a debugger connects.")
  @Param("port", "The port to start the server on (default is 8080).")
  @Param("dontStartDB", "Suppress starting the H2 web server.")
  @Param("env", "A comma-separated list of environment variables, formatted as \"ronin.name=value\".")
  function server(waitForDebugger : boolean, dontStartDB : boolean, port : int = 8080, env : String = "") {
    var cp = fixedPom().dependencies(RUNTIME, :additionalDeps = {
        new() { : GroupId = "org.gosu-lang.gosu", :ArtifactId = "gosu-core", :Version = "0.9-10" }
    }).Path.withFile(this.file("classes"))
    Ant.java(:classpath=cp,
                   :jvmargs=getJvmArgsString(waitForDebugger) + " " + env.split(",").map(\e -> "-D" + e).join(" "),
                   :classname="ronin.DevServer",
                   :fork=true,
                   :failonerror=true,
                   :args="server${dontStartDB ? "-nodb" : ""} ${port} " + this.file(".").AbsolutePath)
  }

  /* Clears and reinitializes the database */
  @Target
  @Param("waitForDebugger", "Suspend the server until a debugger connects.")
  function resetDb(waitForDebugger : boolean) {
    var cp = fixedPom().dependencies(RUNTIME, :additionalDeps = {
        new() { : GroupId = "org.gosu-lang.gosu", :ArtifactId = "gosu-core", :Version = "0.9-10" }
    }).Path
    Ant.java(:classpath=cp,
                   :jvmargs=getJvmArgsString(waitForDebugger),
                   :classname="ronin.DevServer",
                   :fork=true,
                   :failonerror=true,
                   :args="upgrade_db " + this.file(".").AbsolutePath)
  }

  /* Verifies your application code */
  @Target
  @Depends({"compile"})
  @Param("waitForDebugger", "Suspend the server until a debugger connects.")
  @Param("env", "A comma-separated list of environment variables, formatted as \"ronin.name=value\".")
  function verifyApp(waitForDebugger : boolean, env : String = "") {
    var cp = fixedPom().dependencies(TEST, :additionalDeps = {
        new(){ : GroupId = "org.gosu-lang.gosu", :ArtifactId = "gosu-core", :Version = "0.9-10" }
    }).Path
    Ant.java(:classpath=cp,
                   :classname="ronin.DevServer",
                   :jvmargs=getJvmArgsString(waitForDebugger) + " -Xmx256m -XX:MaxPermSize=128m " + env.split(",").map(\e -> "-D" + e).join(" "),
                   :fork=true,
                   :failonerror=true,
                   :args="verify_ronin_app ${this.file(".").AbsolutePath}")
  }

  /* Deletes the build directory */
  @Target
  function clean() {
    if(this.file("build").exists()) {
      this.file("build").deleteRecursively()
    }
    if(this.file("target").exists()) {
      this.file("target").deleteRecursively()
    }
    if(this.file("classes").exists()) {
      this.file("classes").deleteRecursively()
    }
    if(this.file("lib").exists()) {
      Ant.delete(:filesetList = {this.file("lib").fileset()})
    }
    if(this.file("support").exists()) {
      Ant.delete(:filesetList = {this.file("support").fileset(:excludes="vark/*")})
    }
  }

  /* creates a war from the current ronin project */
  @Target
  @Depends({"compile"})
  function makeWar() {

    // copy over the html stuff
    var warDir = this.file("build/war")
    warDir.mkdirs()
    Ant.copy(:filesetList = { this.file("html").fileset() },
              :todir = warDir)

    // copy in the classes
    var webInfDir = this.file("build/war/WEB-INF")
    var classesDir = webInfDir.file("classes")
    classesDir.mkdirs()
    Ant.copy(:filesetList = { this.file("src").fileset(:excludes = "**/*.java") },
              :todir = classesDir)
    if(this.file("classes").exists()) {
      Ant.copy(:filesetList = { this.file("classes").fileset() },
                :todir = classesDir)
    }

    //TODO cgross - resolve files
    // copy in the libraries
    var libDir = webInfDir.file("lib")
    libDir.mkdirs()

    var cp = fixedPom().dependencies(TEST, :additionalDeps = {
        new(){ : GroupId = "org.gosu-lang.gosu", :ArtifactId = "gosu", :Version = "0.9-10" }
    }).Path

    cp.list().each( \ elt -> {
      print( "Adding ${elt} to the WAR")
      Ant.copy(:file = this.file(elt), : todir = libDir)
    } )

    var warName = this.file(".").ParentFile.Name + ".war"
    var warDest = this.file("build/${warName}")
    Ant.jar(:destfile = warDest,
             :basedir = warDir)

    this.logInfo("\n\n  A java war file was created at ${warDest.AbsolutePath}")
  }

  /* Runs the tests associated with your app */
  @Target
  @Depends({"compile"})
  @Param("waitForDebugger", "Suspend the server until a debugger connects.")
  @Param("parallelClasses", "Run test classes in parallel.")
  @Param("parallelMethods", "Run test method within a class in parallel.")
  @Param("env", "A comma-separated list of environment variables, formatted as \"ronin.name=value\".")
  @Param("trace", "Enable detailed tracing.")
  function test(waitForDebugger : boolean, parallelClasses : boolean, parallelMethods : boolean, trace : boolean, env : String = "") {
    var cp = fixedPom().dependencies(TEST, :additionalDeps = {
        new(){ : GroupId = "org.gosu-lang.gosu", :ArtifactId = "gosu-core", :Version = "0.9-10" }
    }).Path

    Ant.java(:classpath=cp,
                   :classname="ronin.DevServer",
                   :jvmargs=getJvmArgsString(waitForDebugger)
                    + (trace ? " -Dronin.trace=true " : "")
                    + " " + env.split(",").map(\e -> "-D" + e).join(" "),
                   :fork=true,
                   :failonerror=true,
                   :args="test ${this.file(".").AbsolutePath} ${parallelClasses} ${parallelMethods}")
  }

  /* Starts a server and runs the UI tests associated with your app */
  @Target
  @Depends({"compile"})
  @Param("waitForDebugger", "Suspend the server until a debugger connects.")
  @Param("port", "The port to start the server on (default is 8080).")
  @Param("parallelClasses", "Run test classes in parallel.")
  @Param("parallelMethods", "Run test method within a class in parallel.")
  @Param("env", "A comma-separated list of environment variables, formatted as \"ronin.name=value\".")
  @Param("trace", "Enable detailed tracing.")
  function uiTest(waitForDebugger : boolean, parallelClasses : boolean, parallelMethods : boolean, trace : boolean, port : int = 8080, env : String = "") {
    var cp = fixedPom().dependencies(TEST, :additionalDeps = {
        new() { : GroupId = "org.gosu-lang.gosu", :ArtifactId = "gosu-core", :Version = "0.9-10" }
    }).Path

    Ant.java(:classpath=cp,
                   :classname="ronin.DevServer",
                   :jvmargs=getJvmArgsString(waitForDebugger)
                    + (trace ? " -Dronin.trace=true " : "")
                    + " " + env.split(",").map(\e -> "-D" + e).join(" "),
                   :fork=true,
                   :failonerror=true,
                   :args="uiTest ${port} ${this.file(".").AbsolutePath} ${parallelClasses} ${parallelMethods}")
  }

  /* Connects to the admin console of a running app */
  @Target
  @Depends({"compile"})
  @Param("port", "The port on which the admin console is running.")
  @Param("username", "The username with which to connect to the admin console.")
  @Param("password", "The password with which to connect to the admin console.")
  function console(port : String = "8022", username : String = "admin", password : String = "password") {
    var cp = fixedPom().dependencies(RUNTIME, :additionalDeps = {
        new() { : GroupId = "org.gosu-lang.gosu", :ArtifactId = "gosu-core", :Version = "0.9-10" }
    }).Path

    Ant.java(:classpath=cp,
                   :classname="ronin.DevServer",
                   :failonerror=true,
                   :args="console ${port} ${username} ${password}")
  }

  function getJvmArgsString(suspend : boolean) : String {
    var debugStr : String
    if(gw.util.Shell.isWindows()) {
      this.logInfo("Starting server in shared-memory debug mode at ${RoninAppName}")
      debugStr = "-Xdebug -Xrunjdwp:transport=dt_shmem,server=y,suspend=${suspend ? "y" : "n"},address=${RoninAppName}"
    } else {
      this.logInfo("Starting server in socket debug mode at 8088")
      debugStr = "-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=${suspend ? "y" : "n"},address=8088"
    }
    return debugStr
  }

  function fixedPom() : PomHelper {
    var pom = this.pom()
    pom.Pom.addRemoteRepo(new() {:Id = "gosu-lang.org-snapshots", :Url = "http://gosu-lang.org/repositories/m2/snapshots", :Snapshots = true, :Releases = false})
    pom.Pom.addRemoteRepo(new() {:Id = "gosu-lang.org-releases", :Url = "http://gosu-lang.org/repositories/m2/releases", :Snapshots = false, :Releases = true})
    return pom
  }
}