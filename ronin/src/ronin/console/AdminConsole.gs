package ronin.console

uses ronin.Ronin

uses org.apache.sshd.SshServer
uses org.apache.sshd.server.PasswordAuthenticator
uses org.apache.sshd.server.keyprovider.SimpleGeneratorHostKeyProvider
uses org.apache.sshd.server.session.ServerSession

/**
 * Allows administrators to log in via SSH and run Gosu commands directly on the Ronin app.
 */
class AdminConsole {

  /**
   * Starts the admin console.  Call this method from your RoninConfig constructor.
   * @param authorizedUsers The usernames of the users who are allowed to access the console.
   * @param port (Optional) The port on which to start the admin console; defaults to 8022.
   */
  static function start(authorizedUsers : String[], port : int = 8022) {
    var ssh = SshServer.setUpDefaultServer()
    ssh.Port = port
    ssh.KeyPairProvider = new SimpleGeneratorHostKeyProvider("hostkey.ser")
    ssh.ShellFactory = new GosuShellFactory()
    ssh.setPasswordAuthenticator(new PasswordAuthenticator() {
      override function authenticate(user : String, pass : String, serverSession : ServerSession) : boolean {
        if(Ronin.Config?.AuthManager == null) {
          return true
        }
        return authorizedUsers.contains(user) and Ronin.Config.AuthManager.login(user, pass)
      }
    })
    ssh.start()
  }

}