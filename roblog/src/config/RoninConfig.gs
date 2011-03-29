package config

uses ronin.*
uses ronin.config.*
uses ronin.console.AdminConsole

uses db.roblog.User
uses controller.*

class RoninConfig extends DefaultRoninConfig {

  /* Set up your RoninConfig as you see fit */
  construct(m : ApplicationMode, an : RoninServlet) {
    super(m, an)
    DefaultController = controller.PostCx
    AuthManager = createDefaultAuthManager(
      \ username -> User.find(new User(){:Name = username})[0],
      User#Name, User#Hash, User#Salt,
      :getOrCreateUserByEmail = \email, idProvider -> {
        var byEmail = User.find(new User(){:Name = email})
        if(byEmail?.HasElements) {
          return byEmail[0]
        } else {
          var newUser = new User() {:Name = email}
          newUser.update()
          return newUser
        }
      }
    )
    LoginRedirect = AdminCx#login()
    AdminConsole.start({"admin"})
  }

}