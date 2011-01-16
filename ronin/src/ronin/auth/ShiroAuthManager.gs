package ronin.auth

uses ronin.config.IAuthManager
uses gw.util.Pair
uses org.apache.shiro.SecurityUtils
uses org.apache.shiro.authc.AuthenticationException
uses org.apache.shiro.authc.UsernamePasswordToken
uses org.apache.shiro.crypto.SecureRandomNumberGenerator
uses org.apache.shiro.crypto.hash.SimpleHash

class ShiroAuthManager implements IAuthManager {

  static var _rng = new SecureRandomNumberGenerator()
  var _hashAlgorithm : String as HashAlgorithm
  var _hashIterations : int as HashIterations

  override property get CurrentUser() : String {
    var subject = SecurityUtils.getSubject()
    return subject.Authenticated ? subject.Principal as String : null
  }

  override function login(username : String, password : String) : boolean {
    try {
      SecurityUtils.getSubject().login(new UsernamePasswordToken(username, password))
      return true
    } catch (e : AuthenticationException) {
      return false
    }
  }

  override function logout() {
    SecurityUtils.getSubject().logout()
  }

  override function getPasswordHashAndSalt(password : String) : Pair<String, String> {
    var salt = _rng.nextBytes()
    var hash = new SimpleHash(HashAlgorithm, password, salt, HashIterations).toBase64()
    return Pair.make(hash, salt.toBase64())
  }

}