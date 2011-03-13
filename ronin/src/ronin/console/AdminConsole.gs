package ronin.console

uses ronin.Ronin

uses org.apache.sshd.SshServer
uses org.apache.sshd.server.PasswordAuthenticator
uses org.apache.sshd.server.keyprovider.SimpleGeneratorHostKeyProvider
uses org.apache.sshd.server.session.ServerSession

class AdminConsole {

  static function start(port : int) {
    var ssh = SshServer.setUpDefaultServer()
    ssh.Port = port
    ssh.KeyPairProvider = new SimpleGeneratorHostKeyProvider("hostkey.ser")
    ssh.ShellFactory = new GosuShellFactory()
    // TODO
    ssh.setPasswordAuthenticator(new PasswordAuthenticator() {
      override function authenticate(s : String, s1 : String, serverSession : ServerSession) : boolean {
        return s.equals("admin") && s1.equals("secret")
      }
    })
    ssh.start()
  }

}