package ronin.auth

uses org.apache.shiro.authc.*

class OpenIDToken implements AuthenticationToken {

  var _email : String as Email
  var _idProvider : String as IdProvider

  override property get Credentials : Object {
    return _idProvider
  }

  override property get Principal : Object {
    return _email
  }

}