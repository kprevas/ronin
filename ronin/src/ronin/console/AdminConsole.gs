package ronin.console

uses ronin.Ronin

uses java.net.*
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
   * @param authorizedUsers (Optional) The usernames of the users who are allowed to access the console.
   * Defaults to null, which means that in development mode, all username/password combinations will be
   * accepted, and in any other mode, no logins will be allowed.
   * @param port (Optional) The port on which to start the admin console; defaults to 8022.
   */
  static function start(authorizedUsers : String[] = null, port : int = 8022) {
    var ssh = SshServer.setUpDefaultServer()
    ssh.Port = port
    ssh.KeyPairProvider = new SimpleGeneratorHostKeyProvider("hostkey.ser")
    ssh.ShellFactory = new GosuShellFactory()
    if(authorizedUsers != null) {
      ssh.setPasswordAuthenticator(new PasswordAuthenticator() {
        override function authenticate(user : String, pass : String, serverSession : ServerSession) : boolean {
          Ronin.log(serverSession.IoSession.RemoteAddress)
          if(Ronin.Config?.AuthManager == null) {
            return isLocalDevModeConnection(serverSession)
          }
          return authorizedUsers.contains(user) and Ronin.Config.AuthManager.login(user, pass)
        }
      })
    } else {
      ssh.setPasswordAuthenticator(new PasswordAuthenticator() {
        override function authenticate(user : String, pass : String, serverSession : ServerSession) : boolean {
          return isLocalDevModeConnection(serverSession)
        }
      })
    }
    ssh.start()
  }

  static private function isLocalDevModeConnection(serverSession : ServerSession) : boolean {
    if(Ronin.Mode != DEVELOPMENT) {
      return false
    }
    var address = serverSession.IoSession.RemoteAddress
    if(address typeis InetSocketAddress) {
      return address.Address.AnyLocalAddress or address.Address.LoopbackAddress
    }
    return false
  }

}