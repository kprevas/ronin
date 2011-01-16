package ronin.config

uses gw.util.Pair

interface IAuthManager<U> {

  property get CurrentUser() : String

  function login(username : String, password : String) : boolean

  function logout()

  function getPasswordHashAndSalt(password : String) : Pair<String, String>

}