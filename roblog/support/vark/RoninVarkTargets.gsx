package vark

uses java.io.File
uses java.lang.System
uses java.lang.Class
uses java.util.Iterator
uses gw.util.Pair
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
  @Param("waitForDebugger", "Suspend the server until a debugger connects.")
  @Param("dontStartDB", "Suppress starting the H2 web server.")
  @Param("env", "A comma-separated list of environment variables, formatted as \"ronin.name=value\".")
  function server(waitForDebugger : boolean, dontStartDB : boolean, env : String = "") {
    var cp = this.classpath(this.file("support").fileset())
               .withFileset(this.file("lib").fileset())
               .withFileset(GosuFiles.fileset())
    this.Ant.java(:classpath=cp,
                   :jvmargs=getDebugString(waitForDebugger) + " " + env.split(",").map(\e -> "-D" + e).join(" "),
                   :classname="ronin.DevServer",
                   :fork=true,
                   :failonerror=true,
                   :args="server${dontStartDB ? "-nodb" : ""} 8080 " + this.file(".").AbsolutePath)
  }

  /* Clears and reinitializes the database */
  @Target
  @Depends({"deps"})
  @Param("waitForDebugger", "Suspend the server until a debugger connects.")
  function resetDb(waitForDebugger : boolean) {
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
  @Param("waitForDebugger", "Suspend the server until a debugger connects.")
  @Param("env", "A comma-separated list of environment variables, formatted as \"ronin.name=value\".")
  function verifyApp(waitForDebugger : boolean, env : String = "") {

    var cp = this.classpath(this.file("support").fileset())
               .withFileset(this.file("lib").fileset())
               .withFile(this.file("src"))
               .withFileset(GosuFiles.fileset())

    this.Ant.java(:classpath=cp,
                   :classname="ronin.DevServer",
                   :jvmargs=getDebugString(waitForDebugger) + " " + env.split(",").map(\e -> "-D" + e).join(" "),
                   :fork=true,
                   :failonerror=true,
                   :args="verify_ronin_app ${this.file(".").AbsolutePath}")
  }

  /* Verifies your application code under all possible combinations of environment properties */
  @Target
  @Depends({"deps"})
  @Param("waitForDebugger", "Suspend the server until a debugger connects.")
  function verifyAll(waitForDebugger : boolean) {
    doForAllEnvironments(\env -> verifyApp(waitForDebugger, env), "Verifying", "Verified")
  }

  /* Deletes the build directory */
  @Target
  function clean() {
    if(this.file("build").exists()) {
      this.file("build").deleteRecursively()
    }
    if(this.file("lib").exists()) {
      this.Ant.delete(:filesetList = {this.file("lib").fileset()})
    }
    if(this.file("support").exists()) {
      this.Ant.delete(:filesetList = {this.file("support").fileset(:excludes="vark/*")})
    }
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

    // copy in the environment-specific resources
    var warEnvDir = webInfDir.file("env")
    var envDir = this.file("env")
    if(envDir.exists()) {
      warEnvDir.mkDirs()
      this.Ant.copy(:filesetList = { envDir.fileSet() },
              :todir = warEnvDir)
    }

    // copy in the libraries
    var libDir = webInfDir.file("lib")
    libDir.mkdirs()
    this.Ant.copy(:filesetList = { this.file("lib").fileset() },
              :todir = libDir)

    // copy in the Gosu libraries
    this.Ant.copy(:filesetList = { GosuFiles.fileset() },
              :todir = libDir)
    this.Ant.copy(:filesetList = { GosuFiles.file("../ext").fileset(
              :excludes="*jetty* servlet*") },
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
  @Param("waitForDebugger", "Suspend the server until a debugger connects.")
  @Param("parallelClasses", "Run test classes in parallel.")
  @Param("parallelMethods", "Run test method within a class in parallel.")
  @Param("env", "A comma-separated list of environment variables, formatted as \"ronin.name=value\".")
  @Param("trace", "Enable detailed tracing.")
  function test(waitForDebugger : boolean, parallelClasses : boolean, parallelMethods : boolean, trace : boolean, env : String = "") {
    var cp = this.classpath(this.file("support").fileset())
               .withFileset(this.file("lib").fileset())
               .withFile(this.file("src"))
               .withFile(this.file("test"))
               .withFileset(GosuFiles.fileset())

    this.Ant.java(:classpath=cp,
                   :classname="ronin.DevServer",
                   :jvmargs=getDebugString(waitForDebugger)
                    + (trace ? " -Dronin.trace=true " : "")
                    + " " + env.split(",").map(\e -> "-D" + e).join(" "),
                   :fork=true,
                   :failonerror=true,
                   :args="test ${this.file(".").AbsolutePath} ${parallelClasses} ${parallelMethods}")
  }

  /* Runs the tests associated with your app under all possible combinations of environment properties */
  @Target
  @Depends({"deps"})
  @Param("waitForDebugger", "Suspend the server until a debugger connects.")
  @Param("parallelClasses", "Run test classes in parallel.")
  @Param("parallelMethods", "Run test method within a class in parallel.")
  @Param("trace", "Enable detailed tracing.")
  function testAll(waitForDebugger : boolean, parallelClasses : boolean, parallelMethods : boolean, trace : boolean) {
    doForAllEnvironments(\env -> test(waitForDebugger, parallelClasses, parallelMethods, trace, env), "Testing", "Tested", {"mode"})
  }

  /* Connects to the admin console of a running app */
  @Target
  @Depends({"deps"})
  @Param("port", "The port on which the admin console is running.")
  @Param("username", "The username with which to connect to the admin console.")
  @Param("password", "The password with which to connect to the admin console.")
  function console(port : String = "8022", username : String = "admin", password : String = "password") {
    var cp = this.classpath(this.file("support").fileset())
               .withFileset(this.file("lib").fileset())
               .withFile(this.file("src"))
               .withFileset(GosuFiles.fileset(:excludes="*.dll,*.so"))

    this.Ant.java(:classpath=cp,
                   :classname="ronin.DevServer",
                   :failonerror=true,
                   :args="console ${port} ${username} ${password}")
  }

  function getDebugString(suspend : boolean) : String {
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

  private function doForAllEnvironments(action(env : String), ing : String, ed : String, exclude : List<String> = null) {
    var environments = allCombinations(this.file("env").Children.where(\f -> exclude == null || !exclude.contains(f.Name))
      .map(\f -> Pair.make(f, f.Children)))
    this.logInfo("${ing} ${environments.Count} environments...")
    for(environment in environments index i) {
      action(environment.map(\e -> "ronin.${e.First.Name}=${e.Second.Name}").join(","))
      this.logInfo("${ed} ${i + 1}/${environments.Count} environments")
    }
  }

  private function allCombinations(m : List<Pair<File, List<File>>>) : List<List<Pair<File, File>>> {
    var rtn : List<List<Pair<File, File>>> = {}
    innerAllCombinations(m, rtn, {})
    return rtn
  }

  private function innerAllCombinations(m : List<Pair<File, List<File>>>, rtn : List<List<Pair<File, File>>>,
                                                                     coll : List<Pair<File, File>>) {
    if(m.Empty) {
      rtn.add(coll.copy())
    } else {
      var entry = m[0]
      m.remove(0)
      for(value in entry.Second) {
        coll.add(Pair.make(entry.First, value))
        innerAllCombinations(m, rtn, coll)
        coll.remove(coll.Count - 1)
      }
      m.add(0, entry)
    }
  }

}