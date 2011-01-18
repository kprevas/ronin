package config

uses ronin.*
uses ronin.config.*

uses db.roblog.User

class RoninConfig extends DefaultRoninConfig {

  /* Set up your RoninConfig as you see fit */
  construct(m : ApplicationMode, an : RoninServlet) {
    super(m, an)
    DefaultController = controller.PostCx
    AuthManager = createDefaultAuthManager(
      \ username -> User.find(new User(){:Name = username})[0],
      User#Name, User#Hash, User#Salt
    )
  }

}