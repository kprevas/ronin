package config

uses ronin.*
uses ronin.config.*
uses ronin.console.AdminConsole
//uses ronin.ws.RoninWebservicesFilter

uses db.roblog.User
uses controller.*

class RoninConfig extends DefaultRoninConfig {

  /* Set up your RoninConfig as you see fit */
  construct(m : ApplicationMode, an : RoninServlet) {
    super(m, an)

    if(m == DEVELOPMENT) {
      db.roblog.Database.JdbcUrl = "jdbc:h2:file:runtime/h2/devdb"
    } else if(m == TESTING) {
      db.roblog.Database.JdbcUrl = "jdbc:h2:file:runtime/h2/testdb"
    } else if(m == STAGING) {
      db.roblog.Database.JdbcUrl = "jdbc:h2:file:runtime/h2/stagingdb"
    } else if(m == PRODUCTION) {
      db.roblog.Database.JdbcUrl = "jdbc:h2:file:runtime/h2/proddb"
    }

    DefaultController = controller.PostCx

    AuthManager = createDefaultAuthManager(
      \ username -> User.selectLike(new User(){:Name = username}).first(),
      \ identity, email, idProvider -> User.getOrCreateByOpenID(identity, email, idProvider),
      User#Name, User#Hash, User#Salt
    )

    LoginRedirect = AdminCx#login()

    AdminConsole.start({"admin"})
//    Filters.add(initFilter(new RoninWebservicesFilter()))
    Filters.add(new ronin_less.LessFilter())
  }

}