classpath "remote:releases:gosu-lang.org-releases:http://gosu-lang.org/nexus/content/groups/releases"
classpath "org.gosu-lang.aardvark:aardvark-aether-utils:1.0-SNAPSHOT"

uses java.net.URL
uses java.io.File
uses gw.util.Shell
uses gw.xml.simple.SimpleXmlNode
uses gw.vark.Aardvark
uses gw.vark.aether.AetherUtil
uses org.sonatype.aether.ant.types.Dependencies
uses org.sonatype.aether.ant.types.Dependency
uses org.sonatype.aether.ant.types.RemoteRepository

DefaultTarget = "init"
var releasesRepo = new RemoteRepository() {
    :Id = "gosu-lang.org-releases",
    :Url = "http://gosu-lang.org/nexus/content/groups/releases"
}
var snapshotsRepo = new RemoteRepository() {
    :Snapshots = true,
    :Releases = false,
    :Id = "gosu-lang.org-snapshots",
    :Url = "http://gosu-lang.org/nexus/content/repositories/snapshots"
}

/* Initializes a new Ronin application */
@Target
function init(name : String = null, groupId : String = null, version : String = "1.0-SNAPSHOT", roninVersion : String = null) {
  while (not groupId?.HasContent) {
    groupId = Shell.readLine("Please enter a group ID (e.g. \"com.yourcompany\"): ")
  }
  while (not name?.HasContent) {
    name = Shell.readLine("Please enter a name for your application: ")
  }
  var targetDir = file(name)
  if(targetDir.exists()) {
    Ant.fail(:message = "The directory ${targetDir.AbsolutePath} already exists.  Please delete it or choose another name.")
  } else {
    if (roninVersion == null) {
      var metadata = get(releasesRepo.Url + "/org/gosu-lang/ronin/ronin/maven-metadata.xml",
          "maven-metadata", ".xml").read()
      roninVersion = SimpleXmlNode.parse(metadata)
          .Children.firstWhere(\n -> n.Name == "versioning")
          .Children.firstWhere(\n -> n.Name == "release")
          .Text
      Ant.echo(:message = "Using the latest published version of Ronin: ${roninVersion}")
    }
    var archetype = resolveArchetype(roninVersion)
    Ant.unzip(:src = archetype, :dest = targetDir)
    targetDir.file("META-INF").deleteRecursively()
    targetDir.file("archetype-resources").eachChild(\c -> {
      c.renameTo(targetDir.file(c.Name))
    })
    targetDir.file("archetype-resources").delete()

    var pomTemplate = targetDir.file("pom.xml").read()
    var pomContent = pomTemplate.replace("\${artifactId}", name)
        .replace("\${groupId}", groupId)
        .replace("\${version}", version)
    if (isSnapshot(roninVersion)) {
      pomContent = pomContent.replace(releasesRepo.Url, snapshotsRepo.Url)
      var buildVark = targetDir.file("build.vark").read()
      buildVark = buildVark.replace("remote:releases:gosu-lang.org-releases:http://gosu-lang.org/repositories/m2/releases",
          "remote:snapshots:gosu-lang.org-snapshots:http://gosu-lang.org/repositories/m2/snapshots")
          .replace("remote:releases:${releasesRepo.Id}:${releasesRepo.Url}",
          "remote:snapshots:${snapshotsRepo.Id}:${snapshotsRepo.Url}")
      targetDir.file("build.vark").write(buildVark)
    }
    targetDir.file("pom.xml").write(pomContent)
    Ant.echo(:message = "Created a new ronin application at ${targetDir.AbsolutePath}.")
    Ant.echo(:message = "  To start your ronin app, cd ${targetDir.Name}; vark server")
  }
}

function get(url : String, name : String, ext : String) : File {
  var file = File.createTempFile(name, ext)
  Ant.get(:src = new URL(url), :dest = file)
  return file
}

private function resolveArchetype(roninVersion : String) : File {
  var aether = new AetherUtil(Aardvark.getProject(), { isSnapshot(roninVersion) ? snapshotsRepo : releasesRepo })
  var dependencies = new Dependencies()
  dependencies.addDependency(new Dependency() {:Coords = "org.gosu-lang.ronin:ronin-archetype:${roninVersion}"})
  var archetype = aether.resolve(dependencies).asFileList().single()
  return archetype
}

private function isSnapshot(roninVersion : String) : boolean {
  return roninVersion.endsWith("-SNAPSHOT")
}
