uses java.net.URL
uses java.io.File

/* Initializes a new Ronin application */
@Target
function init(name : String = "my_ronin_app",  groupid : String = null ) {
  if(name.Empty) {
    Ant.fail( :message = "Please give a non-empty name for your app" )
  } else {
    var targetDir = new File(".", name)
    if(targetDir.exists()) {
      Ant.fail( :message = "The directory ${targetDir.AbsolutePath} already exists.  Please delete it or choose another name." )      
    } else {
      var tmpFile = File.createTempFile( "ronin-template", "zip" ) 
      // TODO cgross - we need a way to determine the URL that this vark file is being invoked from
      Ant.get( :src = new URL("http://localhost/~carson/ronin-template.zip" ), :dest = tmpFile )
      Ant.unzip( :src = tmpFile, :dest = targetDir )
      createPOM( name, groupid, targetDir )
      Ant.echo( :message = "Created a new ronin application at ${targetDir.AbsolutePath}." )
      Ant.echo( :message = "  To start your ronin app, cd ${targetDir.Name}; vark server" )
    }
  }
}

private function createPOM( name : String, groupId : String, f : File ) {
  var template = "<project xmlns=\"http://maven.apache.org/POM/4.0.0\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n" +
    "  xsi:schemaLocation=\"http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd\">\n" +
    "  <modelVersion>4.0.0</modelVersion>\n" +
    "  <groupId>${groupId != null ? groupId : name}</groupId>\n" +
    "  <artifactId>${name}</artifactId>\n" +
    "  <version>0.1</version>\n" +
    "\n" +
    "  <name>${name}</name>\n" +
    "\n" +
    "  <repositories>\n" +
    "    <repository>\n" +
    "      <snapshots>\n" +
    "        <enabled>true</enabled>\n" +
    "      </snapshots>\n" +
    "      <releases>\n" +
    "        <enabled>true</enabled>\n" +
    "      </releases>\n" +
    "      <id>gosu-lang.org</id>\n" +
    "      <name>Official Gosu website</name>\n" +
    "      <url>http://gosu-lang.org/m2</url>\n" +
    "    </repository>\n" +
    "  </repositories>\n" +
    "  <pluginRepositories>\n" +
    "    <pluginRepository>\n" +
    "      <snapshots>\n" +
    "        <enabled>true</enabled>\n" +
    "      </snapshots>\n" +
    "      <releases>\n" +
    "        <enabled>true</enabled>\n" +
    "      </releases>\n" +
    "      <id>gosu-lang.org</id>\n" +
    "      <name>Official Gosu website</name>\n" +
    "      <url>http://gosu-lang.org/m2</url>\n" +
    "    </pluginRepository>\n" +
    "  </pluginRepositories>\n" +
    "\n" +
    "  <dependencies>\n" +
    "    <dependency>\n" +
    "      <groupId>org.gosu-lang.ronin</groupId>\n" +
    "      <artifactId>ronin</artifactId>\n" +
    "      <version>0.9.1-SNAPSHOT</version>\n" +
    "    </dependency>\n" +
    "    <dependency>\n" +
    "      <groupId>org.gosu-lang.ronin</groupId>\n" +
    "      <artifactId>ronin-init</artifactId>\n" +
    "      <version>0.9.1-SNAPSHOT</version>\n" +
    "    </dependency>\n" +
    "    <dependency>\n" +
    "      <groupId>org.gosu-lang.tosa</groupId>\n" +
    "      <artifactId>tosa</artifactId>\n" +
    "      <version>0.1-SNAPSHOT</version>\n" +
    "    </dependency>\n" +
    "    <dependency>\n" +
    "      <groupId>junit</groupId>\n" +
    "      <artifactId>junit</artifactId>\n" +
    "      <version>4.8.2</version>\n" +
    "    </dependency>\n" +
    "  </dependencies>\n" +
    "\n" +
    "  <build>\n" +
    "    <sourceDirectory>src</sourceDirectory>\n" +
    "    <testSourceDirectory>test</testSourceDirectory>\n" +
    "\n" +
    "    <resources>\n" +
    "      <resource>\n" +
    "        <directory>src</directory>\n" +
    "        <excludes>\n" +
    "          <exclude>**/*.java</exclude>\n" +
    "        </excludes>\n" +
    "      </resource>\n" +
    "    </resources>\n" +
    "\n" +
    "    <plugins>\n" +
    "      <plugin>\n" +
    "        <groupId>org.apache.maven.plugins</groupId>\n" +
    "        <artifactId>maven-jar-plugin</artifactId>\n" +
    "        <version>2.3.2</version>\n" +
    "        <configuration>\n" +
    "          <archive>\n" +
    "            <manifest>\n" +
    "              <addDefaultImplementationEntries>true</addDefaultImplementationEntries>\n" +
    "            </manifest>\n" +
    "          </archive>\n" +
    "        </configuration>\n" +
    "      </plugin>\n" +
    "      <plugin>\n" +
    "        <groupId>org.gosu-lang</groupId>\n" +
    "        <artifactId>maven-gosu-plugin</artifactId>\n" +
    "        <version>1.0</version>\n" +
    "        <executions>\n" +
    "          <execution>\n" +
    "            <phase>process-resources</phase>\n" +
    "            <goals>\n" +
    "              <goal>insert-gosu-artifact</goal>\n" +
    "            </goals>\n" +
    "          </execution>\n" +
    "        </executions>\n" +
    "        <configuration>\n" +
    "          <gosuVersion>0.9-SNAPSHOT</gosuVersion>\n" +
    "        </configuration>\n" +
    "      </plugin>\n" +
    "    </plugins>\n" +
    "  </build>\n" +
    "\n" +
    "</project>"

  f.file("pom.xml").write(template)
}