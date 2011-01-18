package controller

class UserLogin extends ronin.RoninController {

  function login(username : String, password : String) {
    view.OneStringArg.render(Writer, AuthManager.login(username, password) as String)
    AuthManager.logout()
  }

  function currentUser(username : String, password : String) {
    AuthManager.login(username, password)
    view.OneStringArg.render(Writer, AuthManager.CurrentUser as String)
    AuthManager.logout()
  }

  function currentUserName(username : String, password : String) {
    AuthManager.login(username, password)
    view.OneStringArg.render(Writer, AuthManager.CurrentUserName)
    AuthManager.logout()
  }

  function currentUserHasRole(username : String, password : String, role : String) {
    AuthManager.login(username, password)
    view.OneStringArg.render(Writer, AuthManager.currentUserHasRole(role) as String)
    AuthManager.logout()
  }

  function logout(username : String, password : String) {
    AuthManager.login(username, password)
    AuthManager.logout()
    view.OneStringArg.render(Writer, AuthManager.CurrentUser as String)
  }

}