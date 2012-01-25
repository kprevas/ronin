uses java.net.URL
uses java.io.File

/* Initializes a new Ronin application */
@Target
function init(name : String = "my_ronin_app",  groupId : String = "my_group_id" ) {
  if(name.Empty) {
    Ant.fail( :message = "Please give a non-empty name for your app" )
  } else {
    var targetDir = new File(".", name)
    if(targetDir.exists()) {
      Ant.fail( :message = "The directory ${targetDir.AbsolutePath} already exists.  Please delete it or choose another name." )      
    } else {
      var tmpFile = File.createTempFile( "ronin-template", "zip" ) 
      Ant.get( :src = new URL(RawVarkFilePath.substring( 0, RawVarkFilePath.lastIndexOf( "/" ) ) + "/ronin-template.zip"), :dest = tmpFile )
      Ant.unzip( :src = tmpFile, :dest = targetDir )
      var pomTemplate = targetDir.file("pom.xml").read()
      var pomContent = pomTemplate.replace("$$$ARTIFACT_ID$$$", name).replace("$$$GROUP_ID$$$", groupId)
      targetDir.file("pom.xml").write(pomContent)
      Ant.echo( :message = "Created a new ronin application at ${targetDir.AbsolutePath}." )
      Ant.echo( :message = "  To start your ronin app, cd ${targetDir.Name}; vark server" )
    }
  }
}