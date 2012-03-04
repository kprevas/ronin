uses java.io.*
uses java.lang.System
uses java.lang.Integer
uses java.net.URL
uses gw.util.Pair
uses gw.util.Shell
uses gw.xml.simple.SimpleXmlNode

var knownPlugins = {
  Pair.make("RoMail", Pair.make("org.gosu-lang.romail", "romail")),
  Pair.make("Ronin Web Services", Pair.make("org.gosu-lang.ronin", "ronin-ws")),
  Pair.make("CoffeeScript support", Pair.make("org.gosu-lang.ronin", "ronin-coffee")),
  Pair.make("LessCSS support", Pair.make("org.gosu-lang.ronin", "ronin-less"))
//  Pair.make("ROnin Forms Library for Managing Application Objects", Pair.make("org.gosu-lang.ronin", "roflmao"))
}

DefaultTarget = "plugins"

@Target
function plugins() {
  var pomFile = new File("pom.xml")
  var pom = SimpleXmlNode.parse(pomFile.read())
  
  var depsNode = pom.Children.firstWhere(\n -> n.Name == "dependencies")
  var deps : List<Pair<String, String>>
  if (depsNode == null) {
    depsNode = new SimpleXmlNode("dependencies")
    pom.Children.add(depsNode)
    deps = {}
  } else {
    deps = depsNode.Children.map(\n -> Pair.make(
        n.Children.firstWhere(\c -> c.Name == "groupId").Text,
        n.Children.firstWhere(\c -> c.Name == "artifactId").Text))
  }
  
  var availablePlugins = 
      knownPlugins.where(\p -> not deps.contains(p.Second))
  
  if (availablePlugins.Empty) {
    print("All known plugins are already installed.")
    System.exit(0)
  }
  
  print("Select plugins to install by number from the following list:")
  for(plugin in availablePlugins index i) {
    print("${i + 1}: ${plugin.First}")
  }
  var numbers = Shell.readLine("Plugins to install (comma-separated): ")
  var pluginsToInstall : List<Pair<String, String>> = {}
  for(number in numbers.split(",")) {
    try {
      pluginsToInstall.add(availablePlugins[Integer.parseInt(number) - 1].Second)
    } catch (e) {
      // ignore
    }
  }
  if (pluginsToInstall.Empty) {
    print("No plugins selected.")
    System.exit(0)
  }
  
  for (plugin in pluginsToInstall) {
    try {
      var url = "http://gosu-lang.org/nexus/content/repositories/osprojects/${plugin.First.replace(".", "/")}/${plugin.Second}/maven-metadata.xml"
      var metadataFile = File.createTempFile("metadata", ".xml")
      Ant.get(:src = new URL(url), :dest = metadataFile)
      var version = SimpleXmlNode.parse(metadataFile.read())
          .Children.firstWhere(\n -> n.Name == "versioning")
          .Children.firstWhere(\n -> n.Name == "release")
          .Text
      var dep = SimpleXmlNode.parse("<dependency>" +
          "<groupId>${plugin.First}</groupId>" +
          "<artifactId>${plugin.Second}</artifactId>" +
          "<version>${version}</version>" +
          "</dependency>")
      depsNode.Children.add(dep)
    } catch (e) {
      e.printStackTrace()
      print("Error installing ${plugin.First}.")
    }
  }
  
  pomFile.write(pom.toXmlString())
}