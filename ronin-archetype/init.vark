uses java.net.URL
uses java.io.File
uses gw.util.Shell
uses gw.xml.simple.SimpleXmlNode

DefaultTarget = "init"

/* Initializes a new Ronin application */
@Target
function init(name : String = null, groupId : String = null, version : String = "1.0-SNAPSHOT", snapshot : boolean = false) {
  while (not groupId?.HasContent) {
    groupId = Shell.readLine("Please enter a group ID (e.g. \"com.yourcompany\"): ")
  }
  while (not name?.HasContent) {
    name = Shell.readLine("Please enter a name for your application: ")
  }
  var targetDir = new File(".", name)
  if(targetDir.exists()) {
    Ant.fail(:message = "The directory ${targetDir.AbsolutePath} already exists.  Please delete it or choose another name.")
  } else {
    var archetype : File
    if (snapshot) {
      var metadata = get("http://gosu-lang.org/nexus/content/repositories/snapshots/org/gosu-lang/ronin/ronin/maven-metadata.xml",
          "maven-metadata", ".xml").read()
      var roninVersion = SimpleXmlNode.parse(metadata)
          .Children.firstWhere(\n -> n.Name == "versioning")
          .Children.firstWhere(\n -> n.Name == "versions")
          .Children.lastWhere(\n -> n.Name == "version")
          .Text
      var archetypeMetadata = get("http://gosu-lang.org/nexus/content/repositories/snapshots/org/gosu-lang/ronin/ronin-archetype/${roninVersion}/maven-metadata.xml",
          "archetype-metadata", ".xml").read()
      var snapshotVersion = SimpleXmlNode.parse(archetypeMetadata)
          .Children.firstWhere(\n -> n.Name == "versioning")
          .Children.firstWhere(\n -> n.Name == "snapshot")
      var snapshotTimestamp = snapshotVersion.Children.firstWhere(\n -> n.Name == "timestamp").Text
      var snapshotBuildNumber = snapshotVersion.Children.firstWhere(\n -> n.Name == "buildNumber").Text
      var snapshotJarName = roninVersion.substring(0, roninVersion.Length - "-SNAPSHOT".Length)
          + "-${snapshotTimestamp}-${snapshotBuildNumber}"
      archetype = get("http://gosu-lang.org/nexus/content/repositories/snapshots/org/gosu-lang/ronin/ronin-archetype/${roninVersion}/ronin-archetype-${snapshotJarName}.jar",
          "ronin-archetype", ".jar")
    } else {
      var metadata = get("http://gosu-lang.org/nexus/content/repositories/osprojects/org/gosu-lang/ronin/ronin/maven-metadata.xml",
          "maven-metadata", ".xml").read()
      var roninVersion = SimpleXmlNode.parse(metadata)
          .Children.firstWhere(\n -> n.Name == "versioning")
          .Children.firstWhere(\n -> n.Name == "release")
          .Text
      archetype = get("http://gosu-lang.org/nexus/content/repositories/osprojects/org/gosu-lang/ronin/ronin-archetype/${roninVersion}/ronin-archetype-${roninVersion}.jar",
          "ronin-archetype", ".jar")
    }
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
    if (snapshot) {
      pomContent = pomContent.replace("http://gosu-lang.org/nexus/content/groups/releases",
          "http://gosu-lang.org/nexus/content/repositories/snapshots")
      var buildVark = targetDir.file("build.vark").read()
      buildVark = buildVark.replace("remote:releases:gosu-lang.org-releases:http://gosu-lang.org/repositories/m2/releases",
          "remote:snapshots:gosu-lang.org-snapshots:http://gosu-lang.org/repositories/m2/snapshots")
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