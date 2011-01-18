package ronin.config

uses gw.util.Pair

interface IAuthManager {

  property get CurrentUser() : Object

  property get CurrentUserName() : String

  function get currentUserHasRole(role : String) : boolean

  function login(username : String, password : String) : boolean

  function logout()

  function getPasswordHashAndSalt(password : String) : Pair<String, String>

}